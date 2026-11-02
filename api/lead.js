const ALLOWED_FIELDS = new Set([
  "formType", "name", "phone", "email", "childAge", "campus", "province",
  "model", "budget", "notes", "createdAt"
]);

function isAllowedOrigin(originHeader) {
  if (!originHeader) return true;
  try {
    const parsed = new URL(originHeader);
    const hostname = parsed.hostname.toLowerCase();
    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "princetonacademy.vn" ||
      hostname.endsWith(".princetonacademy.vn") ||
      hostname.endsWith(".vercel.app")
    );
  } catch {
    return false;
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ result: "error" });
  }

  // Cross-Site Request Origin validation
  const origin = req.headers.origin || req.headers.referer;
  if (!isAllowedOrigin(origin)) {
    return res.status(403).json({ result: "error", message: "unauthorized origin" });
  }

  try {
    const incoming = new URLSearchParams();
    if (typeof req.body === "string") {
      new URLSearchParams(req.body).forEach((value, key) => incoming.append(key, value));
    } else if (req.body && typeof req.body === "object") {
      for (const [key, value] of Object.entries(req.body)) {
        if (typeof value === "string" || typeof value === "number") incoming.append(key, String(value));
      }
    }

    // Invisible Honeypot detection:
    // If bot filled out the hidden field, silently return success without forwarding upstream
    const honeypot = incoming.get("_hp_field");
    if (honeypot && honeypot.trim() !== "") {
      return res.status(200).json({ result: "success" });
    }

    const target = process.env.GOOGLE_APPS_SCRIPT_URL;
    if (!target || !/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/.test(target)) {
      return res.status(503).json({ result: "error" });
    }

    const outgoing = new URLSearchParams();
    for (const [key, value] of incoming.entries()) {
      if (ALLOWED_FIELDS.has(key)) outgoing.append(key, value.slice(0, 1000));
    }
    if (!outgoing.get("name") || !outgoing.get("phone")) {
      return res.status(400).json({ result: "error" });
    }

    // Optional secret token shared with Google Apps Script
    if (process.env.LEAD_SECRET_TOKEN) {
      outgoing.append("secretToken", process.env.LEAD_SECRET_TOKEN);
    }

    const upstream = await fetch(target, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: outgoing.toString(),
      redirect: "follow",
      signal: AbortSignal.timeout(10000)
    });
    const text = await upstream.text();
    let result;
    try { result = JSON.parse(text); } catch { result = null; }
    if (!upstream.ok || !result || result.result !== "success") {
      return res.status(502).json({ result: "error" });
    }
    return res.status(200).json({ result: "success" });
  } catch {
    return res.status(502).json({ result: "error" });
  }
};
