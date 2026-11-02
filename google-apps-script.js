/**
 * =========================================================================
 * GOOGLE APPS SCRIPT: TỰ ĐỘNG THU THẬP LEAD PHỤ HUYNH VÀO GOOGLE SHEETS
 * Dành riêng cho Landing Page: Tuyển sinh Princeton Academy (Team Marketing)
 * =========================================================================
 * 
 * ĐÃ LOẠI BỎ HOÀN TOÀN: Logic tự tạo sheet "Đối Tác".
 * File này CHỈ phục vụ duy nhất một mục đích: Nhận lead Phụ Huynh.
 * 
 * HƯỚNG DẪN CẬP NHẬT TRÊN GOOGLE SHEETS (GIỮ NGUYÊN LINK CŨ):
 * 1. Mở Google Sheet của bạn > Vào Tiện ích mở rộng (Extensions) > Apps Script.
 * 2. Xóa hết code cũ, dán toàn bộ nội dung file này vào > Bấm icon Lưu (Ctrl + S).
 * 3. Để cập nhật mà KHÔNG BỊ ĐỔI LINK WEB APP:
 *    - Bấm "Triển khai" (Deploy) > Chọn "Quản lý bản triển khai" (Manage deployments).
 *    - Bấm vào icon Cây bút (Chỉnh sửa / Edit) ở góc trên bên phải.
 *    - Ở mục "Phiên bản" (Version): Chọn "Phiên bản mới" (New version).
 *    - Bấm "Triển khai" (Deploy).
 *    -> Link URL Web App sẽ được GIỮ NGUYÊN 100%, không cần đổi gì trên landing page.
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  // Serialize writes and rate-limit duplicate submissions by phone.
  if (!lock.tryLock(10000)) return jsonResponse({ result: "error", message: "busy" });

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var params = {};

    // 1. Phân tích dữ liệu nhận được (hỗ trợ FormData, x-www-form-urlencoded và JSON)
    if (e && e.parameter && Object.keys(e.parameter).length > 0) {
      params = e.parameter;
    } else if (e && e.postData && e.postData.contents) {
      try {
        params = JSON.parse(e.postData.contents);
      } catch (jsonErr) {
        params = {};
      }
    }

    // The endpoint is public; reject malformed or oversized submissions server-side.
    var name = cleanText(params.name, 100);
    var phone = cleanText(params.phone, 24);
    var email = cleanText(params.email, 254);
    var childAge = cleanText(params.childAge, 40);
    var campus = cleanText(params.campus, 120);
    var notes = cleanText(params.notes, 500);
    if (!name || !/^\+?[0-9 ().-]{8,24}$/.test(phone)) {
      return jsonResponse({ result: "error", message: "invalid input" });
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonResponse({ result: "error", message: "invalid input" });
    }
    var phoneKey = phone.replace(/\D/g, "");
    var cache = CacheService.getScriptCache();
    if (cache.get("lead:" + phoneKey)) {
      return jsonResponse({ result: "error", message: "duplicate" });
    }
    cache.put("lead:" + phoneKey, "1", 60);

    var timestamp = Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm:ss");

    // =====================================================================
    // CHỈ THU THẬP LEAD PHỤ HUYNH ĐĂNG KÝ THAM QUAN / TUYỂN SINH
    // Không tạo thêm bất kỳ Sheet Đối Tác nào khác
    // =====================================================================
    var sheetParent = ss.getSheetByName("Phụ Huynh");
    
    // Nếu chưa có sheet "Phụ Huynh", tự động khởi tạo chuẩn chỉnh
    if (!sheetParent) {
      var activeSheet = ss.getActiveSheet();
      // Nếu sheet hiện tại là sheet trống mặc định ("Trang tính 1" hoặc "Sheet1"), đổi tên trực tiếp
      if (activeSheet && (activeSheet.getName() === "Trang tính 1" || activeSheet.getName() === "Sheet1") && activeSheet.getLastRow() === 0) {
        sheetParent = activeSheet;
        sheetParent.setName("Phụ Huynh");
      } else {
        sheetParent = ss.insertSheet("Phụ Huynh");
      }

      var headersParent = [
        "Thời Gian Gửi", 
        "Họ & Tên Phụ Huynh", 
        "Số Điện Thoại", 
        "Độ Tuổi Bé", 
        "Email Liên Hệ", 
        "Cơ Sở Quan Tâm", 
        "Ghi Chú Gửi Trường"
      ];
      sheetParent.appendRow(headersParent);
      var headerRangeParent = sheetParent.getRange(1, 1, 1, headersParent.length);
      headerRangeParent.setFontWeight("bold");
      headerRangeParent.setBackground("#8C1823"); // Màu đỏ Crimson Princeton chuẩn thương hiệu
      headerRangeParent.setFontColor("#FFFFFF");
      headerRangeParent.setHorizontalAlignment("center");
      sheetParent.setFrozenRows(1);

      // Căn độ rộng cột đẹp mắt
      sheetParent.setColumnWidth(1, 160);
      sheetParent.setColumnWidth(2, 200);
      sheetParent.setColumnWidth(3, 140);
      sheetParent.setColumnWidth(4, 150);
      sheetParent.setColumnWidth(5, 200);
      sheetParent.setColumnWidth(6, 280);
      sheetParent.setColumnWidth(7, 300);
    }

    // Ghi dữ liệu phụ huynh mới vào dòng tiếp theo
    sheetParent.appendRow([
      safeCell(timestamp),
      safeCell(name),
      safeCell(phone),
      safeCell(childAge),
      safeCell(email),
      safeCell(campus || cleanText(params.province, 120)),
      safeCell(notes)
    ]);

    return jsonResponse({ result: "success" });

  } catch (error) {
    return jsonResponse({ result: "error" });

  } finally {
    lock.releaseLock();
  }
}

function cleanText(value, maxLength) {
  return String(value == null ? "" : value).replace(/[\u0000-\u001F\u007F]/g, " ").trim().slice(0, maxLength);
}

// Force user-controlled values to be stored as plain text in Google Sheets.
function safeCell(value) {
  var text = String(value == null ? "" : value);
  return /^[\s]*[=+\-@]/.test(text) ? "'" + text : text;
}

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  return ContentService
    .createTextOutput("Princeton Academy Lead Collection Web App is active (Parent Enrollment Only).")
    .setMimeType(ContentService.MimeType.TEXT);
}
