/**
 * =========================================================================
 * GOOGLE APPS SCRIPT: THU THẬP LEAD DÙNG CHUNG CHO 2 LANDING PAGE
 * =========================================================================
 *
 * Script này phục vụ đồng thời:
 * 1. Landing Page Phụ Huynh  -> ghi vào tab "Phụ Huynh"
 * 2. Landing Page Đối Tác    -> ghi vào tab "Đối Tác"
 *
 * Cả 2 website Vercel gửi dữ liệu qua serverless API /api/lead, API này
 * chuyển tiếp tới cùng một URL Web App của script.
 *
 * CÁC LỚP BẢO MẬT:
 * - Chống Spreadsheet / Formula Injection (CWE-1236).
 * - Chặn bot qua honeypot (_hp_field của Phụ huynh, _hp_company của Đối tác).
 * - Rate limiting theo số điện thoại qua CacheService (60 giây).
 * - Khóa luồng chống race condition khi nhiều lead gửi đồng thời.
 * - Timestamp lấy từ server, không tin client.
 * - (Tùy chọn) Xác thực token chia sẻ giữa Vercel API và Apps Script.
 *
 * HƯỚNG DẪN TRIỂN KHAI:
 * 1. Tạo một Google Sheet mới.
 * 2. Extensions > Apps Script > dán toàn bộ file này vào > Lưu.
 * 3. Chạy hàm setupSheets() một lần để tạo 2 tab + header chuẩn.
 * 4. Deploy > New deployment > Web app:
 *    - Execute as: Me
 *    - Who has access: Anyone
 *    - Copy URL dạng https://script.google.com/macros/s/.../exec
 * 5. Dán URL đó vào biến môi trường GOOGLE_APPS_SCRIPT_URL của CẢ 2
 *    project Vercel (Phụ huynh và Đối tác), sau đó redeploy.
 * 6. (Tùy chọn) Project Settings > Script Properties > thêm
 *    LEAD_SECRET_TOKEN = chuỗi bí mật, và đặt cùng biến đó trên Vercel.
 */

var PARENT_SHEET = {
  name: "Phụ Huynh",
  color: "#8C1823",
  headers: [
    "Thời Gian Gửi",
    "Họ & Tên Phụ Huynh",
    "Số Điện Thoại",
    "Độ Tuổi Bé",
    "Email Liên Hệ",
    "Cơ Sở Quan Tâm",
    "Ghi Chú Gửi Trường"
  ],
  widths: [160, 200, 140, 150, 200, 280, 300]
};

var PARTNER_SHEET = {
  name: "Đối Tác",
  color: "#C89D35",
  headers: [
    "Thời Gian Gửi",
    "Họ & Tên Nhà Đầu Tư",
    "Số Điện Thoại",
    "Tỉnh / Thành Phố",
    "Mô Hình Quan Tâm",
    "Ngân Sách Dự Kiến",
    "Email",
    "Ghi Chú"
  ],
  widths: [160, 200, 150, 180, 220, 200, 180, 300]
};

function doPost(e) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) {
    return jsonResponse({ result: "error", message: "busy" });
  }

  try {
    var params = readParams(e);

    // Honeypot: bot điền vào trường ẩn -> trả success giả, không ghi sheet.
    if (isFilled(params._hp_field) || isFilled(params._hp_company)) {
      return jsonResponse({ result: "success" });
    }

    // (Tùy chọn) Token chia sẻ giữa API Vercel và Apps Script.
    var expectedToken = PropertiesService.getScriptProperties().getProperty("LEAD_SECRET_TOKEN");
    if (expectedToken && String(params.secretToken || "") !== expectedToken) {
      return jsonResponse({ result: "error", message: "unauthorized" });
    }

    var formType = cleanText(params.formType, 40);
    var name = cleanText(params.name, 100);
    var phone = cleanText(params.phone, 24);
    var email = cleanText(params.email, 254);
    var phoneKey = phone.replace(/\D/g, "");

    if (!name || name.length < 2 || !/^\+?[0-9 ().-]{8,24}$/.test(phone) ||
        phoneKey.length < 8 || phoneKey.length > 15) {
      return jsonResponse({ result: "error", message: "invalid input" });
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonResponse({ result: "error", message: "invalid input" });
    }

    // Rate limit theo số điện thoại, dùng chung cho cả 2 loại form.
    var cache = CacheService.getScriptCache();
    var cacheKey = "lead:" + phoneKey;
    if (cache.get(cacheKey)) {
      return jsonResponse({ result: "error", message: "duplicate" });
    }
    cache.put(cacheKey, "1", 60);

    var timestamp = Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm:ss");

    if (formType.toLowerCase() === "đối tác") {
      writePartnerLead(timestamp, params, name, phone, email);
    } else {
      writeParentLead(timestamp, params, name, phone, email);
    }

    return jsonResponse({ result: "success" });
  } catch (error) {
    return jsonResponse({ result: "error" });
  } finally {
    lock.releaseLock();
  }
}

function writeParentLead(timestamp, params, name, phone, email) {
  var sheet = ensureSheet(PARENT_SHEET);
  var childAge = cleanText(params.childAge, 40);
  var campus = cleanText(params.campus || params.province, 120);
  var notes = cleanText(params.notes, 500);

  sheet.appendRow([
    safeCell(timestamp),
    safeCell(name),
    safeCell(phone),
    safeCell(childAge),
    safeCell(email),
    safeCell(campus),
    safeCell(notes)
  ]);
}

function writePartnerLead(timestamp, params, name, phone, email) {
  var sheet = ensureSheet(PARTNER_SHEET);
  var province = cleanText(params.province, 120);
  var model = cleanText(params.model, 120);
  var budget = cleanText(params.budget, 120);
  var notes = cleanText(params.notes, 500);

  sheet.appendRow([
    safeCell(timestamp),
    safeCell(name),
    safeCell(phone),
    safeCell(province),
    safeCell(model),
    safeCell(budget),
    safeCell(email),
    safeCell(notes)
  ]);
}

/**
 * Tạo tab + header chuẩn nếu chưa tồn tại.
 * Nếu tab đang trống, tự động ghi header và định dạng.
 */
function ensureSheet(config) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(config.name);

  if (!sheet) {
    var activeSheet = ss.getActiveSheet();
    var isDefaultEmptySheet = activeSheet &&
      activeSheet.getLastRow() === 0 &&
      (activeSheet.getName() === "Sheet1" || activeSheet.getName() === "Trang tính 1");

    if (isDefaultEmptySheet) {
      activeSheet.setName(config.name);
      sheet = activeSheet;
    } else {
      sheet = ss.insertSheet(config.name);
    }
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(config.headers);
    formatHeader(sheet, config.headers.length, config.color, config.widths);
  }

  return sheet;
}

function formatHeader(sheet, numCols, color, widths) {
  var headerRange = sheet.getRange(1, 1, 1, numCols);
  headerRange.setFontWeight("bold");
  headerRange.setBackground(color);
  headerRange.setFontColor("#FFFFFF");
  headerRange.setHorizontalAlignment("center");
  sheet.setFrozenRows(1);

  for (var i = 0; i < widths.length; i++) {
    sheet.setColumnWidth(i + 1, widths[i]);
  }
}

/**
 * Chạy hàm này một lần trong Apps Script editor để tạo sẵn 2 tab.
 */
function setupSheets() {
  ensureSheet(PARENT_SHEET);
  ensureSheet(PARTNER_SHEET);
  return "Đã tạo tab Phụ Huynh và Đối Tác.";
}

function readParams(e) {
  if (e && e.parameter && Object.keys(e.parameter).length > 0) {
    return e.parameter;
  }
  if (e && e.postData && e.postData.contents) {
    try {
      return JSON.parse(e.postData.contents);
    } catch (jsonErr) {
      return {};
    }
  }
  return {};
}

function isFilled(value) {
  return String(value == null ? "" : value).trim().length > 0;
}

function cleanText(value, maxLength) {
  return String(value == null ? "" : value)
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .trim()
    .slice(0, maxLength);
}

// Ép giá trị người dùng nhập thành text thuần trong Google Sheets.
function safeCell(value) {
  var text = String(value == null ? "" : value);
  return /^\s*[=+\-@]/.test(text) ? "'" + text : text;
}

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  return ContentService
    .createTextOutput("Princeton Academy shared lead collection Web App is active (Parents + Partners).")
    .setMimeType(ContentService.MimeType.TEXT);
}
