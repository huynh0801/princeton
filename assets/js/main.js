/**
 * Princeton Academy Landing Page Interactivity
 * Sharp architectural style, minimal icons, accessible.
 */

// =========================================================================
// CẤU HÌNH GOOGLE SHEETS TÍCH HỢP FORM ĐĂNG KÝ
// Hướng dẫn: Dán Web App URL của Google Apps Script vào biến dưới đây.
// Ví dụ: const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/.../exec";
// =========================================================================
const GOOGLE_SHEET_URL = "";

// 1. Dữ liệu 10 cơ sở chi nhánh toàn quốc
const CAMPUSES = [
  {
    id: 1,
    name: "Princeton Academy Ecopark Hải Phòng",
    address: "Số 6, Triệu Việt Vương, KĐT Ecopark, phường Tân Hưng, TP Hải Phòng",
    city: "Hải Phòng",
    phone: "0968.822.291",
    mapQuery: "Số 6 Triệu Việt Vương, KĐT Ecopark, Tân Hưng, Hải Phòng"
  },
  {
    id: 2,
    name: "Princeton Academy Kẻ Sặt Hải Phòng",
    address: "Số 76, Lạc Long Quân, Kẻ Sặt, Bình Giang, TP Hải Phòng",
    city: "Hải Phòng",
    phone: "0968.822.291",
    mapQuery: "76 Lạc Long Quân, Kẻ Sặt, Bình Giang, Hải Dương"
  },
  {
    id: 3,
    name: "Princeton Academy Lai Vu Hải Phòng",
    address: "Kiot 19-20, Lai Vu, Lai Khê, Hải Phòng",
    city: "Hải Phòng",
    phone: "0968.822.291",
    mapQuery: "Lai Vu, Kim Thành, Hải Dương"
  },
  {
    id: 4,
    name: "Princeton Academy Bắc Sơn Đà Nẵng",
    address: "88 Bắc Sơn, An Khê, Thanh Khê, TP. Đà Nẵng",
    city: "Đà Nẵng",
    phone: "0968.822.291",
    mapQuery: "88 Bắc Sơn, An Khê, Thanh Khê, Đà Nẵng"
  },
  {
    id: 5,
    name: "Princeton Academy Tây Nam Linh Đàm Hà Nội",
    address: "BT5-TT4A, KĐT Tây Nam Linh Đàm, Hoàng Mai, Hà Nội",
    city: "Hà Nội",
    phone: "0968.822.291",
    mapQuery: "BT5-TT4A KĐT Tây Nam Linh Đàm, Hoàng Mai, Hà Nội"
  },
  {
    id: 6,
    name: "Princeton Academy Lạc Hồng Phúc Hưng Yên",
    address: "Đường Nguyễn Bình (khu đô thị Lạc Hồng Phúc), Mỹ Hào, Hưng Yên",
    city: "Hưng Yên",
    phone: "0968.822.291",
    mapQuery: "Khu đô thị Lạc Hồng Phúc, Phường Nhân Hòa, Mỹ Hào, Hưng Yên"
  },
  {
    id: 7,
    name: "Princeton Academy Nam Viên Campus (Phú Mỹ Hưng)",
    address: "Nam Viên Campus: 33 Đường 16, Khu phố Nam Viên, Phường Tân Mỹ, TP.HCM",
    city: "TP. Hồ Chí Minh",
    phone: "0968.822.291",
    mapQuery: "33 Đường 16, Khu phố Nam Viên, Tân Phong, Quận 7, TP Hồ Chí Minh"
  },
  {
    id: 8,
    name: "Princeton Academy Mỹ Gia Campus (Phú Mỹ Hưng)",
    address: "Mỹ Gia Campus: 10 Đường 18, Khu phố Mỹ Gia, Phường Tân Mỹ, TP.HCM",
    city: "TP. Hồ Chí Minh",
    phone: "0968.822.291",
    mapQuery: "10 Đường 18, Khu phố Mỹ Gia, Tân Phong, Quận 7, TP Hồ Chí Minh"
  },
  {
    id: 9,
    name: "Princeton Academy Lê Quý Đôn Đà Nẵng",
    address: "Số 45–47 Lê Quý Đôn, phường Hòa Cường, quận Hải Châu, TP. Đà Nẵng",
    city: "Đà Nẵng",
    phone: "0968.822.291",
    mapQuery: "45 Lê Quý Đôn, Bình Thuận, Hải Châu, Đà Nẵng"
  },
  {
    id: 10,
    name: "Princeton Academy Hòa Xuân Đà Nẵng",
    address: "01 Nguyễn Ân, Hòa Xuân, Cẩm Lệ, TP. Đà Nẵng",
    city: "Đà Nẵng",
    phone: "0968.822.291",
    mapQuery: "01 Nguyễn Ân, Hòa Xuân, Cẩm Lệ, Đà Nẵng"
  }
];

let currentCampusIndex = 0;

// Khởi tạo trang khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
  renderCampusesList();
  selectCampus(0);
  initFormTabs();
  initFormSubmissions();
  initMobileMenu();
  initBackToTop();
  initHeaderScroll();
});

// Render danh sách 10 cơ sở - Phong cách vuông vức, tinh giản
function renderCampusesList() {
  const container = document.getElementById('campuses-list');
  if (!container) return;

  container.innerHTML = CAMPUSES.map((c, idx) => `
    <div 
      onclick="selectCampus(${idx})" 
      class="campus-item p-3.5 bg-white mb-2 border border-gray-200 cursor-pointer ${idx === 0 ? 'active' : ''}"
      id="campus-btn-${idx}"
    >
      <div class="flex items-start gap-3">
        <div class="w-6 h-6 bg-[#8C1823] text-white flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
          ${idx + 1}
        </div>
        <div class="flex-1">
          <div class="flex items-center justify-between">
            <h4 class="font-bold text-sm text-[#8C1823]">${c.name}</h4>
            <span class="text-[10px] px-2 py-0.5 bg-gray-100 text-[#8C1823] font-semibold border border-gray-300 uppercase">${c.city}</span>
          </div>
          <p class="text-xs text-gray-600 mt-1">
            ${c.address}
          </p>
        </div>
      </div>
    </div>
  `).join('');

  // Populate options vào dropdown của Form Phụ Huynh
  const selectEl = document.getElementById('parent-campus-select');
  if (selectEl) {
    selectEl.innerHTML = `
      <option value="">-- Chọn cơ sở gần bạn nhất --</option>
      ${CAMPUSES.map(c => `<option value="${c.name}">${c.name} (${c.city})</option>`).join('')}
    `;
  }
}

// Chuyển đổi cơ sở và cập nhật Google Maps
function selectCampus(index) {
  if (index < 0 || index >= CAMPUSES.length) return;
  currentCampusIndex = index;
  const campus = CAMPUSES[index];

  // Cập nhật UI item active
  document.querySelectorAll('.campus-item').forEach((item, idx) => {
    if (idx === index) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Cập nhật Google Map iframe
  const mapIframe = document.getElementById('campus-map-iframe');
  if (mapIframe) {
    const encoded = encodeURIComponent(campus.mapQuery);
    mapIframe.src = `https://maps.google.com/maps?q=${encoded}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
  }

  // Cập nhật label chi nhánh hiện tại
  const labelEl = document.getElementById('current-campus-display');
  if (labelEl) {
    labelEl.innerHTML = `
      <span class="font-bold text-[#8C1823] text-sm">${campus.name}</span>
      <span class="text-xs text-gray-500 block mt-0.5">${campus.address}</span>
    `;
  }

  // Đồng bộ chọn select trong form
  const selectEl = document.getElementById('parent-campus-select');
  if (selectEl) {
    selectEl.value = campus.name;
  }
}

// Chuyển đổi tab Phụ Huynh vs Đối Tác
function initFormTabs() {
  const tabParent = document.getElementById('tab-btn-parent');
  const tabPartner = document.getElementById('tab-btn-partner');
  const formParent = document.getElementById('form-parent-content');
  const formPartner = document.getElementById('form-partner-content');

  if (!tabParent || !tabPartner) return;

  tabParent.addEventListener('click', () => {
    tabParent.classList.add('active');
    tabPartner.classList.remove('active');
    formParent.classList.remove('hidden');
    formPartner.classList.add('hidden');
  });

  tabPartner.addEventListener('click', () => {
    tabPartner.classList.add('active');
    tabParent.classList.remove('active');
    formPartner.classList.remove('hidden');
    formParent.classList.add('hidden');
  });
}

// Xử lý gửi Form & Tích hợp Google Sheets
function initFormSubmissions() {
  const formParent = document.getElementById('form-parent');
  const formPartner = document.getElementById('form-partner');

  // Hàm gửi dữ liệu bất đồng bộ lên Google Sheets Web App
  async function sendToGoogleSheet(data) {
    if (!GOOGLE_SHEET_URL) {
      console.info("💡 Lưu ý: GOOGLE_SHEET_URL chưa được điền. Dữ liệu chỉ hiển thị demo trên trình duyệt.");
      return true;
    }

    try {
      const formData = new FormData();
      for (const [key, value] of Object.entries(data)) {
        formData.append(key, value);
      }

      // Gửi POST request dạng no-cors để tương thích hoàn toàn với Google Apps Script Web App
      await fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: formData
      });
      return true;
    } catch (err) {
      console.error("Lỗi kết nối tới Google Sheets:", err);
      return false;
    }
  }

  // 1. Xử lý Form Phụ Huynh
  if (formParent) {
    formParent.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = formParent.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : '';

      const name = document.getElementById('parent-name').value.trim();
      const phone = document.getElementById('parent-phone').value.trim();
      const childAge = document.getElementById('parent-child-age') ? document.getElementById('parent-child-age').value : '';
      const email = document.getElementById('parent-email') ? document.getElementById('parent-email').value.trim() : '';
      const campus = document.getElementById('parent-campus-select') ? document.getElementById('parent-campus-select').value : '';
      const notes = document.getElementById('parent-notes') ? document.getElementById('parent-notes').value.trim() : '';

      if (!name || !phone) {
        alert('Vui lòng điền họ tên và số điện thoại liên hệ!');
        return;
      }

      // Trạng thái loading
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'ĐANG GỬI THÔNG TIN...';
      }

      const payload = {
        formType: 'Phụ Huynh',
        name: name,
        phone: phone,
        childAge: childAge,
        email: email,
        campus: campus,
        notes: notes,
        createdAt: new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
      };

      await sendToGoogleSheet(payload);

      showSuccessModal(
        'Đăng Ký Tham Quan Thành Công!',
        `Cảm ơn Quý phụ huynh <strong>${name}</strong> đã quan tâm tới Princeton Academy. Ban tuyển sinh ${campus ? `cơ sở <strong>${campus}</strong>` : 'nhà trường'} sẽ liên hệ với Quý phụ huynh qua số điện thoại <strong>${phone}</strong> trong vòng 24 giờ làm việc.`
      );
      formParent.reset();

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  }

  // 2. Xử lý Form Đối Tác & Nhà Đầu Tư
  if (formPartner) {
    formPartner.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = formPartner.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : '';

      const name = document.getElementById('partner-name').value.trim();
      const phone = document.getElementById('partner-phone').value.trim();
      const email = document.getElementById('partner-email') ? document.getElementById('partner-email').value.trim() : '';
      const province = document.getElementById('partner-province') ? document.getElementById('partner-province').value.trim() : '';
      const model = document.getElementById('partner-model') ? document.getElementById('partner-model').value : '';
      const notes = document.getElementById('partner-notes') ? document.getElementById('partner-notes').value.trim() : '';

      if (!name || !phone) {
        alert('Vui lòng điền họ tên và số điện thoại của Quý đối tác!');
        return;
      }

      // Trạng thái loading
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'ĐANG GỬI THÔNG TIN...';
      }

      const payload = {
        formType: 'Đối Tác',
        name: name,
        phone: phone,
        email: email,
        province: province,
        model: model,
        notes: notes,
        createdAt: new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
      };

      await sendToGoogleSheet(payload);

      showSuccessModal(
        'Đăng Ký Hợp Tác Chiến Lược Thành Công!',
        `Cảm ơn Quý đối tác / Nhà đầu tư <strong>${name}</strong>. Đại diện Ban Phát Triển Nhượng Quyền Toàn Quốc của Princeton Academy sẽ liên hệ trực tiếp qua số <strong>${phone}</strong> để gửi hồ sơ chuyển giao và tư vấn kế hoạch phát triển tại <strong>${province || 'khu vực của bạn'}</strong>.`
      );
      formPartner.reset();

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  }
}

// Modal thông báo thành công
function showSuccessModal(title, message) {
  const modal = document.getElementById('success-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalMsg = document.getElementById('modal-message');

  if (!modal) return;
  modalTitle.innerHTML = title;
  modalMsg.innerHTML = message;
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeSuccessModal() {
  const modal = document.getElementById('success-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

// Mobile Menu Toggle
function initMobileMenu() {
  const btn = document.getElementById('mobile-menu-toggle');
  const menu = document.getElementById('mobile-menu');
  const links = document.querySelectorAll('.mobile-nav-link');

  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    menu.classList.toggle('hidden');
  });

  links.forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.add('hidden');
    });
  });
}

// Back to top & Scroll behavior
function initBackToTop() {
  const btt = document.getElementById('back-to-top');
  if (!btt) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btt.classList.remove('opacity-0', 'pointer-events-none');
      btt.classList.add('opacity-100');
    } else {
      btt.classList.add('opacity-0', 'pointer-events-none');
      btt.classList.remove('opacity-100');
    }
  });

  btt.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Header scroll effect: chuyển sang màu đỏ và đổi sang logo3.png
function initHeaderScroll() {
  const header = document.getElementById('main-header');
  const logo = document.getElementById('header-logo');
  const hotlineBtn = document.getElementById('header-hotline-btn');
  const ctaBtn = document.getElementById('header-cta-btn');
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const navLinks = document.querySelectorAll('#main-header nav .nav-item');

  if (!header || !logo) return;

  const handleScroll = () => {
    const scrollPos = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    
    // Ngưỡng cuộn nhạy (15px) ngay khi cuộn qua đầu trang
    if (scrollPos > 15) {
      header.classList.add('scrolled');
      header.style.backgroundColor = '#8C1823';
      header.style.borderBottomColor = 'rgba(255, 255, 255, 0.15)';
      header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.25)';
      
      if (!logo.src.includes('logo3.png')) {
        logo.src = 'assets/logo/logo3.png';
      }

      navLinks.forEach(link => {
        link.style.color = '#FFFFFF';
      });

      if (hotlineBtn) {
        hotlineBtn.style.borderColor = 'rgba(255, 255, 255, 0.85)';
        hotlineBtn.style.color = '#FFFFFF';
        hotlineBtn.style.backgroundColor = 'transparent';
      }

      if (ctaBtn) {
        ctaBtn.style.backgroundColor = '#C89D35';
        ctaBtn.style.color = '#FFFFFF';
      }

      if (mobileToggle) {
        mobileToggle.style.color = '#FFFFFF';
      }
    } else {
      header.classList.remove('scrolled');
      header.style.backgroundColor = '#FFFFFF';
      header.style.borderBottomColor = '#E8E2D5';
      header.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';

      if (!logo.src.includes('logo1.png')) {
        logo.src = 'assets/logo/logo1.png';
      }

      navLinks.forEach(link => {
        link.style.color = '';
      });

      if (hotlineBtn) {
        hotlineBtn.style.borderColor = '#8C1823';
        hotlineBtn.style.color = '#8C1823';
        hotlineBtn.style.backgroundColor = '';
      }

      if (ctaBtn) {
        ctaBtn.style.backgroundColor = '#8C1823';
        ctaBtn.style.color = '#FFFFFF';
      }

      if (mobileToggle) {
        mobileToggle.style.color = '';
      }
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  document.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}
