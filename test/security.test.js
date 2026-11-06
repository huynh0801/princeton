const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

test('Security Header & Config Tests', async (t) => {
  await t.test('.gitignore ignores .env files', () => {
    const gitignore = fs.readFileSync(path.join(__dirname, '../.gitignore'), 'utf8');
    assert.match(gitignore, /\.env\*/, '.gitignore should ignore .env* files');
  });

  await t.test('.vercelignore blocks internal files and scripts from public deployment but preserves assets/logo and assets/img', () => {
    const vercelignore = fs.readFileSync(path.join(__dirname, '../.vercelignore'), 'utf8');
    assert.match(vercelignore, /google-apps-script\.js/, 'Must ignore google-apps-script.js');
    assert.match(vercelignore, /serve\.js/, 'Must ignore serve.js');
    assert.match(vercelignore, /test\//, 'Must ignore test/');
    assert.match(vercelignore, /scripts\//, 'Must ignore scripts/');
    assert.match(vercelignore, /docs\//, 'Must ignore docs/');
    assert.match(vercelignore, /\*\.pdf/, 'Must ignore *.pdf');
    // Ensure raw folders are anchored to root and not ignoring assets/logo/
    assert.doesNotMatch(vercelignore, /(?:^|\r?\n)logo\//m, 'Must not ignore unanchored logo/ to protect assets/logo');
    assert.doesNotMatch(vercelignore, /(?:^|\r?\n)image\//m, 'Must not ignore unanchored image/ to protect assets/img');
  });

  await t.test('vercel.json includes security headers (CSP, HSTS, Permissions-Policy) and removes deprecated X-XSS-Protection', () => {
    const vercelConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '../vercel.json'), 'utf8'));
    const globalHeaders = vercelConfig.headers.find(h => h.source === '/(.*)').headers;
    const headerMap = Object.fromEntries(globalHeaders.map(h => [h.key, h.value]));

    assert.ok(headerMap['Content-Security-Policy'], 'Must have Content-Security-Policy');
    assert.ok(headerMap['Strict-Transport-Security'], 'Must have Strict-Transport-Security');
    assert.ok(headerMap['Permissions-Policy'], 'Must have Permissions-Policy');
    assert.strictEqual(headerMap['X-XSS-Protection'], undefined, 'Deprecated X-XSS-Protection should be removed');
  });
});

test('Client-side Sanitization & Form Handling Tests', async (t) => {
  await t.test('main.js includes escapeHtml and uses it in modal rendering', () => {
    const mainJs = fs.readFileSync(path.join(__dirname, '../assets/js/main.js'), 'utf8');
    assert.match(mainJs, /function escapeHtml\(/, 'main.js must have escapeHtml function');
    assert.match(mainJs, /escapeHtml\(name\)/, 'main.js must escape name');
    assert.match(mainJs, /escapeHtml\(phone\)/, 'main.js must escape phone');
  });

  await t.test('main.js checks sendToGoogleSheet result and avoids false success', () => {
    const mainJs = fs.readFileSync(path.join(__dirname, '../assets/js/main.js'), 'utf8');
    assert.match(mainJs, /const\s+(?:sent|success|res)\s*=\s*await sendToGoogleSheet/, 'main.js must capture sendToGoogleSheet result');
    assert.match(mainJs, /if\s*\(!(?:sent|success|res)\)/, 'main.js must check if result was unsuccessful');
  });

  await t.test('main.js syntax parses without error', () => {
    const mainJs = fs.readFileSync(path.join(__dirname, '../assets/js/main.js'), 'utf8');
    assert.doesNotThrow(() => {
      new Function(mainJs);
    }, 'main.js must parse with zero syntax errors');
  });

  await t.test('app.js syntax parses without error and includes sanitization and form handling', () => {
    const appJs = fs.readFileSync(path.join(__dirname, '../assets/js/app.js'), 'utf8');
    assert.doesNotThrow(() => {
      new Function(appJs);
    }, 'app.js must parse with zero syntax errors');
    assert.match(appJs, /function escapeHtml\(/, 'app.js must have escapeHtml');
    assert.match(appJs, /escapeHtml\(name\)/, 'app.js must escape name');
    assert.match(appJs, /escapeHtml\(phone\)/, 'app.js must escape phone');
    assert.match(appJs, /const\s+sent\s*=\s*await sendToGoogleSheet/, 'app.js must capture sendToGoogleSheet result');
    assert.match(appJs, /if\s*\(!sent\)/, 'app.js must check if result was unsuccessful');
  });

  await t.test('index.html has pre-populated campus options in parent-campus-select', () => {
    const indexHtml = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
    assert.match(indexHtml, /<select[^>]+id="parent-campus-select"[^>]*>[\s\S]*?<option value="Princeton Academy Ecopark/, 'index.html must have pre-rendered campus options');
  });

  await t.test('HTML forms include honeypot fields', () => {
    const indexHtml = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
    const partnerHtml = fs.readFileSync(path.join(__dirname, '../princeton-academy-partner/index.html'), 'utf8');
    assert.match(indexHtml, /name="_hp_field"/, 'index.html parent form must have honeypot input');
    assert.match(partnerHtml, /name="_hp_company"/, 'partner forms must have honeypot input');
  });

  await t.test('unified Apps Script routes parent and partner leads into separate tabs', () => {
    const script = fs.readFileSync(path.join(__dirname, '../google-apps-script.js'), 'utf8');
    assert.match(script, /PARENT_SHEET/, 'must define parent sheet config');
    assert.match(script, /PARTNER_SHEET/, 'must define partner sheet config');
    assert.match(script, /formType\.toLowerCase\(\) === "đối tác"/, 'must route partner leads by formType');
    assert.match(script, /setupSheets\(\)/, 'must provide setupSheets helper');
  });
});

test('Serverless API (api/lead.js) Security Tests', async (t) => {
  const handler = require('../api/lead.js');

  await t.test('api/lead drops honeypot bot submissions without forwarding upstream', async () => {
    let upstreamCalled = false;
    process.env.GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/dummy/exec';
    
    const originalFetch = global.fetch;
    global.fetch = async () => {
      upstreamCalled = true;
      return { ok: true, text: async () => JSON.stringify({ result: 'success' }) };
    };

    let statusCode = null;
    let responseData = null;
    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        responseData = data;
        return this;
      },
      setHeader() {}
    };

    const req = {
      method: 'POST',
      headers: {
        origin: 'https://princetonacademy.vn'
      },
      body: {
        name: 'Spam Bot',
        phone: '0988284799',
        _hp_field: 'I am a bot'
      }
    };

    await handler(req, res);
    global.fetch = originalFetch;

    assert.strictEqual(statusCode, 200);
    assert.strictEqual(responseData.result, 'success');
    assert.strictEqual(upstreamCalled, false, 'Upstream must NOT be called when honeypot is filled');
  });

  await t.test('api/lead drops partner honeypot (_hp_company) without forwarding upstream', async () => {
    let upstreamCalled = false;
    process.env.GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/dummy/exec';

    const originalFetch = global.fetch;
    global.fetch = async () => {
      upstreamCalled = true;
      return { ok: true, text: async () => JSON.stringify({ result: 'success' }) };
    };

    let statusCode = null;
    let responseData = null;
    const res = {
      status(code) { statusCode = code; return this; },
      json(data) { responseData = data; return this; },
      setHeader() {}
    };

    const req = {
      method: 'POST',
      headers: { origin: 'https://princetonpartner.vercel.app' },
      body: {
        formType: 'Đối Tác',
        name: 'Spam Bot',
        phone: '0988284799',
        _hp_company: 'I am a bot'
      }
    };

    await handler(req, res);
    global.fetch = originalFetch;

    assert.strictEqual(statusCode, 200);
    assert.strictEqual(responseData.result, 'success');
    assert.strictEqual(upstreamCalled, false, 'Upstream must NOT be called when partner honeypot is filled');
  });

  await t.test('api/lead accepts same-origin requests from Vercel preview deployments', async () => {
    let upstreamCalled = false;
    process.env.GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/dummy/exec';

    const originalFetch = global.fetch;
    global.fetch = async () => {
      upstreamCalled = true;
      return { ok: true, text: async () => JSON.stringify({ result: 'success' }) };
    };

    let statusCode = null;
    const res = {
      status(code) { statusCode = code; return this; },
      json() { return this; },
      setHeader() {}
    };

    const req = {
      method: 'POST',
      headers: {
        origin: 'https://landingpage2-preview-22130107.vercel.app',
        host: 'landingpage2-preview-22130107.vercel.app'
      },
      body: {
        formType: 'Đối Tác',
        name: 'Nguyen Van An',
        phone: '0988284799'
      }
    };

    await handler(req, res);
    global.fetch = originalFetch;

    assert.strictEqual(statusCode, 200);
    assert.strictEqual(upstreamCalled, true, 'Same-origin preview request must be forwarded');
  });

  await t.test('api/lead rejects untrusted third-party origins (CSRF protection)', async () => {
    const req = {
      method: 'POST',
      headers: {
        origin: 'https://evil-hacker-site.com'
      },
      body: {
        name: 'Target User',
        phone: '0988284799'
      }
    };

    let statusCode = null;
    let responseData = null;
    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        responseData = data;
        return this;
      },
      setHeader() {}
    };

    await handler(req, res);
    assert.strictEqual(statusCode, 403, 'Should reject untrusted origin with 403');
    assert.strictEqual(responseData.result, 'error');
  });

  await t.test('api/lead rejects untrusted third-party .vercel.app origins', async () => {
    const req = {
      method: 'POST',
      headers: {
        origin: 'https://random-scam-site.vercel.app'
      },
      body: {
        name: 'Target User',
        phone: '0988284799'
      }
    };

    let statusCode = null;
    const res = {
      status(code) { statusCode = code; return this; },
      json() { return this; },
      setHeader() {}
    };

    await handler(req, res);
    assert.strictEqual(statusCode, 403, 'Should reject arbitrary vercel.app origin with 403');
  });

  await t.test('api/lead validates phone format and rejects malformed numbers', async () => {
    const req = {
      method: 'POST',
      headers: {
        origin: 'https://princetonacademy.vn'
      },
      body: {
        name: 'Target User',
        phone: 'invalid_phone_letters'
      }
    };

    let statusCode = null;
    const res = {
      status(code) { statusCode = code; return this; },
      json() { return this; },
      setHeader() {}
    };

    await handler(req, res);
    assert.strictEqual(statusCode, 400, 'Should reject invalid phone with 400');
  });

  await t.test('FontAwesome stylesheet includes Subresource Integrity (SRI)', () => {
    const indexHtml = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
    const partnerHtml = fs.readFileSync(path.join(__dirname, '../princeton-academy-partner/index.html'), 'utf8');
    assert.match(indexHtml, /cdnjs\.cloudflare\.com\/ajax\/libs\/font-awesome[\s\S]*?integrity=/, 'index.html must have SRI integrity for FontAwesome');
    assert.match(partnerHtml, /cdnjs\.cloudflare\.com\/ajax\/libs\/font-awesome[\s\S]*?integrity=/, 'partner index.html must have SRI integrity for FontAwesome');
  });
});

test('Partner Project Integration Tests', async (t) => {
  await t.test('partner project sends leads through the shared /api/lead proxy', () => {
    const partnerJs = fs.readFileSync(path.join(__dirname, '../princeton-academy-partner/assets/js/partner.js'), 'utf8');
    assert.match(partnerJs, /const LEAD_API_URL = "\/api\/lead"/, 'partner.js must use /api/lead');
    assert.doesNotMatch(partnerJs, /no-cors/, 'partner.js must not post with no-cors');
    assert.doesNotMatch(partnerJs, /GOOGLE_SHEET_URL/, 'partner.js must not hard-code the Apps Script URL');
    assert.ok(fs.existsSync(path.join(__dirname, '../princeton-academy-partner/api/lead.js')), 'partner project must include api/lead.js');
  });

  await t.test('partner index.html loads the cache-busted partner script and uses autofill-safe honeypots', () => {
    const partnerHtml = fs.readFileSync(path.join(__dirname, '../princeton-academy-partner/index.html'), 'utf8');
    assert.match(partnerHtml, /assets\/js\/partner\.js\?v=5/, 'partner index.html must load partner.js?v=5');
    assert.doesNotMatch(partnerHtml, /<label[^>]+for="(?:hero|final)-company-hp"/, 'honeypot must not have an autofillable label');
    assert.match(partnerHtml, /type="checkbox"[^>]+id="hero-hp-verify"/, 'hero honeypot must be a hidden checkbox');
    assert.match(partnerHtml, /type="checkbox"[^>]+id="final-hp-verify"/, 'final honeypot must be a hidden checkbox');
  });
});

test('serve.js Path Traversal & Robustness Tests', async (t) => {
  const serveContent = fs.readFileSync(path.join(__dirname, '../serve.js'), 'utf8');
  assert.match(serveContent, /try\s*\{[\s\S]*decodeURI/, 'serve.js should catch URIError in decodeURI');
  assert.match(serveContent, /startsWith\((?:ROOT_DIR|__dirname)\)/, 'serve.js should verify path stays within root directory');
});
