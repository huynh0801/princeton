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
  // Khóa 10 giây để chống xung đột ghi dữ liệu đồng thời nếu nhiều phụ huynh gửi cùng lúc
  lock.tryLock(10000);

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

    var timestamp = params.createdAt || Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm:ss");

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
      timestamp,
      params.name || '',
      params.phone ? "'" + params.phone : '', // Thêm nháy đơn phía trước để Google Sheet không làm mất số 0 đầu
      params.childAge || '',
      params.email || '',
      params.campus || '',
      params.notes || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ result: "success" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput("Princeton Academy Lead Collection Web App is active (Parent Enrollment Only).")
    .setMimeType(ContentService.MimeType.TEXT);
}
