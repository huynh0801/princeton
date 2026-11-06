/**
 * Princeton Academy - Unified Application Script (app.js)
 * Serves both Parents Landing Page (index.html) and Partner Landing Page (partner.html)
 * Lightweight, DOM-aware, zero-dependency.
 */

// =========================================================================
// 1. CONFIGURATION & CONSTANTS
// =========================================================================
const LEAD_API_URL = "/api/lead";

// 10 cơ sở chi nhánh toàn quốc (Dành cho trang Phụ huynh)
const CAMPUSES = [
  {
    id: 1,
    name: "Princeton Academy Ecopark Hải Phòng",
    address: "Số 6, Triệu Việt Vương, KĐT Ecopark, phường Tân Hưng, TP Hải Phòng",
    city: "Hải Phòng",
    phone: "0988.284.799",
    mapQuery: "Số 6 Triệu Việt Vương, KĐT Ecopark, Tân Hưng, Hải Phòng"
  },
  {
    id: 2,
    name: "Princeton Academy Kẻ Sặt Hải Phòng",
    address: "Số 76, Lạc Long Quân, Kẻ Sặt, Bình Giang, TP Hải Phòng",
    city: "Hải Phòng",
    phone: "0988.284.799",
    mapQuery: "76 Lạc Long Quân, Kẻ Sặt, Bình Giang, Hải Dương"
  },
  {
    id: 3,
    name: "Princeton Academy Lai Vu Hải Phòng",
    address: "Kiot 19-20, Lai Vu, Lai Khê, Hải Phòng",
    city: "Hải Phòng",
    phone: "0988.284.799",
    mapQuery: "Lai Vu, Kim Thành, Hải Dương"
  },
  {
    id: 4,
    name: "Princeton Academy Bắc Sơn Đà Nẵng",
    address: "88 Bắc Sơn, An Khê, Thanh Khê, TP. Đà Nẵng",
    city: "Đà Nẵng",
    phone: "0988.284.799",
    mapQuery: "88 Bắc Sơn, An Khê, Thanh Khê, Đà Nẵng"
  },
  {
    id: 5,
    name: "Princeton Academy Tây Nam Linh Đàm Hà Nội",
    address: "BT5-TT4A, KĐT Tây Nam Linh Đàm, Hoàng Mai, Hà Nội",
    city: "Hà Nội",
    phone: "0988.284.799",
    mapQuery: "BT5-TT4A KĐT Tây Nam Linh Đàm, Hoàng Mai, Hà Nội"
  },
  {
    id: 6,
    name: "Princeton Academy Lạc Hồng Phúc Hưng Yên",
    address: "Đường Nguyễn Bình (khu đô thị Lạc Hồng Phúc), Mỹ Hào, Hưng Yên",
    city: "Hưng Yên",
    phone: "0988.284.799",
    mapQuery: "Khu đô thị Lạc Hồng Phúc, Phường Nhân Hòa, Mỹ Hào, Hưng Yên"
  },
  {
    id: 7,
    name: "Princeton Academy Nam Viên Campus (Phú Mỹ Hưng)",
    address: "Nam Viên Campus: 33 Đường 16, Khu phố Nam Viên, Phường Tân Mỹ, TP.HCM",
    city: "TP. Hồ Chí Minh",
    phone: "0988.284.799",
    mapQuery: "33 Đường 16, Khu phố Nam Viên, Tân Phong, Quận 7, TP Hồ Chí Minh"
  },
  {
    id: 8,
    name: "Princeton Academy Mỹ Gia Campus (Phú Mỹ Hưng)",
    address: "Mỹ Gia Campus: 10 Đường 18, Khu phố Mỹ Gia, Phường Tân Mỹ, TP.HCM",
    city: "TP. Hồ Chí Minh",
    phone: "0988.284.799",
    mapQuery: "10 Đường 18, Khu phố Mỹ Gia, Tân Phong, Quận 7, TP Hồ Chí Minh"
  },
  {
    id: 9,
    name: "Princeton Academy Lê Quý Đôn Đà Nẵng",
    address: "Số 45–47 Lê Quý Đôn, phường Hòa Cường, quận Hải Châu, TP. Đà Nẵng",
    city: "Đà Nẵng",
    phone: "0988.284.799",
    mapQuery: "45 Lê Quý Đôn, Bình Thuận, Hải Châu, Đà Nẵng"
  },
  {
    id: 10,
    name: "Princeton Academy Hòa Xuân Đà Nẵng",
    address: "01 Nguyễn Ân, Hòa Xuân, Cẩm Lệ, TP. Đà Nẵng",
    city: "Đà Nẵng",
    phone: "0988.284.799",
    mapQuery: "01 Nguyễn Ân, Hòa Xuân, Cẩm Lệ, Đà Nẵng"
  }
];

let currentCampusIndex = 0;
let lastFocusedElement = null;

// =========================================================================
// 2. HELPER UTILITIES
// =========================================================================

function escapeHtml(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function valueOf(id) {
  const element = document.getElementById(id);
  return element ? element.value.trim() : "";
}

function nowInVietnam() {
  return new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
}

/**
 * Gửi dữ liệu đăng ký bất đồng bộ lên Serverless Lead API & Google Sheets
 */
async function sendToGoogleSheet(data) {
  try {
    const body = new URLSearchParams();
    Object.entries(data).forEach(([key, value]) => {
      body.append(key, value == null ? "" : String(value));
    });

    const response = await fetch(LEAD_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString()
    });

    const result = await response.json();
    return response.ok && result.result === "success";
  } catch (error) {
    console.error("Lỗi gửi dữ liệu tới Lead API / Google Sheets:", error);
    return false;
  }
}

// =========================================================================
// 3. SHARED UI: HEADER SCROLL, MOBILE MENU, BACK TO TOP, MODALS
// =========================================================================

/**
 * Hiệu ứng chuyển màu Header khi cuộn trang
 * - Đổi background từ trắng sang #8C1823
 * - Đổi logo1.png sang logo3.png (phiên bản nền đỏ)
 */
function initHeaderScroll() {
  const header = document.getElementById("main-header");
  const logo = document.getElementById("header-logo");
  const hotlineBtn = document.getElementById("header-hotline-btn");
  const ctaBtn = document.getElementById("header-cta-btn");
  const mobileToggle = document.getElementById("mobile-menu-toggle");
  const navLinks = document.querySelectorAll("#main-header nav .nav-item");

  if (!header || !logo) return;

  const handleScroll = () => {
    const scrollPos = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;

    if (scrollPos > 15) {
      header.classList.add("scrolled");
      header.style.backgroundColor = "#8C1823";
      header.style.borderBottomColor = "rgba(255, 255, 255, 0.15)";
      header.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.25)";

      if (!logo.src.includes("logo3.png")) {
        logo.src = "assets/logo/logo3.png";
      }

      navLinks.forEach((link) => {
        link.style.color = "#FFFFFF";
      });

      if (hotlineBtn) {
        hotlineBtn.style.borderColor = "rgba(255, 255, 255, 0.85)";
        hotlineBtn.style.color = "#FFFFFF";
        hotlineBtn.style.backgroundColor = "transparent";
      }

      if (ctaBtn) {
        ctaBtn.style.backgroundColor = "#C89D35";
        ctaBtn.style.color = "#FFFFFF";
      }

      if (mobileToggle) {
        mobileToggle.style.color = "#FFFFFF";
      }
    } else {
      header.classList.remove("scrolled");
      header.style.backgroundColor = "#FFFFFF";
      header.style.borderBottomColor = "#E8E2D5";
      header.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.05)";

      if (!logo.src.includes("logo1.png")) {
        logo.src = "assets/logo/logo1.png";
      }

      navLinks.forEach((link) => {
        link.style.color = "";
      });

      if (hotlineBtn) {
        hotlineBtn.style.borderColor = "#8C1823";
        hotlineBtn.style.color = "#8C1823";
        hotlineBtn.style.backgroundColor = "";
      }

      if (ctaBtn) {
        ctaBtn.style.backgroundColor = "#8C1823";
        ctaBtn.style.color = "#FFFFFF";
      }

      if (mobileToggle) {
        mobileToggle.style.color = "";
      }
    }
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  document.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();
}

/**
 * Đóng mở menu trên thiết bị di động
 */
function initMobileMenu() {
  const toggleBtn = document.getElementById("mobile-menu-toggle");
  const menu = document.getElementById("mobile-menu");
  if (!toggleBtn || !menu) return;

  toggleBtn.addEventListener("click", () => {
    menu.classList.toggle("hidden");
  });

  const links = document.querySelectorAll(".mobile-nav-link, #main-header a[href^='#']");
  links.forEach((link) => {
    link.addEventListener("click", () => {
      menu.classList.add("hidden");
    });
  });
}

/**
 * Nút cuộn về đầu trang (Back to top)
 */
function initBackToTop() {
  const btn = document.getElementById("back-to-top");
  if (!btn) return;

  window.addEventListener("scroll", () => {
    if (window.scrollY > 400) {
      btn.classList.remove("opacity-0", "pointer-events-none");
      btn.classList.add("opacity-100");
    } else {
      btn.classList.add("opacity-0", "pointer-events-none");
      btn.classList.remove("opacity-100");
    }
  });

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/**
 * Quản lý Modal thông báo thành công cho cả 2 trang
 */
function initSuccessModals() {
  // Modal đối tác (partner.html)
  const partnerModal = document.getElementById("partner-success-modal");
  if (partnerModal) {
    partnerModal.addEventListener("click", (event) => {
      if (event.target === partnerModal) closePartnerModal();
    });
  }

  // Modal phụ huynh (index.html)
  const parentModal = document.getElementById("success-modal");
  if (parentModal) {
    parentModal.addEventListener("click", (event) => {
      if (event.target === parentModal) closeSuccessModal();
    });
  }

  // Nút đóng modal có thuộc tính data-close-modal
  document.querySelectorAll("[data-close-modal]").forEach((button) => {
    button.addEventListener("click", () => {
      closePartnerModal();
      closeSuccessModal();
    });
  });

  // Đóng modal khi bấm phím Escape
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (partnerModal && !partnerModal.classList.contains("hidden")) {
        closePartnerModal();
      }
      if (parentModal && !parentModal.classList.contains("hidden")) {
        closeSuccessModal();
      }
    }
  });
}

// Modal phụ huynh
function showSuccessModal(title, message) {
  const modal = document.getElementById("success-modal");
  const modalTitle = document.getElementById("modal-title");
  const modalMsg = document.getElementById("modal-message");

  if (!modal) return;
  if (modalTitle) modalTitle.innerHTML = title;
  if (modalMsg) modalMsg.innerHTML = message;

  modal.classList.remove("hidden");
  modal.classList.add("flex");
  document.body.style.overflow = "hidden";
}

function closeSuccessModal() {
  const modal = document.getElementById("success-modal");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    document.body.style.overflow = "";
  }
}

// Modal đối tác
function showPartnerModal(title, message) {
  const modal = document.getElementById("partner-success-modal");
  const titleElement = document.getElementById("partner-modal-title");
  const messageElement = document.getElementById("partner-modal-message");
  const closeButton = document.getElementById("partner-modal-close");

  if (!modal) return;
  lastFocusedElement = document.activeElement;

  if (titleElement) titleElement.textContent = title;
  if (messageElement) messageElement.innerHTML = message;

  modal.classList.remove("hidden");
  modal.classList.add("flex");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  if (closeButton) closeButton.focus();
}

function closePartnerModal() {
  const modal = document.getElementById("partner-success-modal");
  if (!modal) return;

  modal.classList.add("hidden");
  modal.classList.remove("flex");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";

  if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
    lastFocusedElement.focus();
  }
}

// =========================================================================
// 4. MODULE TRANG PHỤ HUYNH (PARENTS LANDING PAGE - index.html)
// =========================================================================

/**
 * Khởi tạo danh sách 10 cơ sở & đồng bộ dropdown form
 */
function renderCampusesList() {
  const container = document.getElementById("campuses-list");
  const selectEl = document.getElementById("parent-campus-select");

  if (container) {
    container.innerHTML = CAMPUSES.map((c, idx) => `
      <div 
        onclick="selectCampus(${idx})" 
        class="campus-item p-3.5 bg-white mb-2 border border-gray-200 cursor-pointer ${idx === 0 ? "active" : ""}"
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
            <p class="text-xs text-gray-600 mt-1">${c.address}</p>
          </div>
        </div>
      </div>
    `).join("");
  }

  if (selectEl && selectEl.options.length <= 1) {
    selectEl.innerHTML = `
      <option value="">-- Chọn cơ sở gần bạn nhất --</option>
      ${CAMPUSES.map((c) => `<option value="${c.name}">${c.name} (${c.city})</option>`).join("")}
    `;
  }
}

/**
 * Chọn cơ sở và cập nhật Google Maps
 */
function selectCampus(index) {
  if (index < 0 || index >= CAMPUSES.length) return;
  currentCampusIndex = index;
  const campus = CAMPUSES[index];

  // Cập nhật UI item active trong danh sách
  document.querySelectorAll(".campus-item").forEach((item, idx) => {
    if (idx === index) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });

  // Cập nhật Google Map iframe
  const mapIframe = document.getElementById("campus-map-iframe");
  if (mapIframe) {
    const encoded = encodeURIComponent(campus.mapQuery);
    mapIframe.src = `https://maps.google.com/maps?q=${encoded}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
  }

  // Cập nhật label chi nhánh đang hiển thị
  const labelEl = document.getElementById("current-campus-display");
  if (labelEl) {
    labelEl.innerHTML = `
      <span class="font-bold text-[#8C1823] text-sm">${campus.name}</span>
      <span class="text-xs text-gray-500 block mt-0.5">${campus.address}</span>
    `;
  }

  // Đồng bộ chọn select trong form
  const selectEl = document.getElementById("parent-campus-select");
  if (selectEl) {
    selectEl.value = campus.name;
  }
}

/**
 * Xử lý submit Form Đăng Ký Phụ Huynh
 */
function initParentForm() {
  const formParent = document.getElementById("form-parent");
  if (!formParent) return;

  formParent.addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitBtn = formParent.querySelector('button[type="submit"]');
    const originalText = submitBtn ? submitBtn.innerHTML : "";

    const name = valueOf("parent-name");
    const phone = valueOf("parent-phone");
    const childAge = valueOf("parent-child-age");
    const email = valueOf("parent-email");
    const campus = valueOf("parent-campus-select");
    const notes = valueOf("parent-notes");
    const hpField = valueOf("parent-hp-field");

    if (!name || !phone) {
      alert("Vui lòng điền họ tên và số điện thoại liên hệ!");
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = "ĐANG GỬI THÔNG TIN...";
    }

    const payload = {
      formType: "Phụ Huynh",
      name: name,
      phone: phone,
      childAge: childAge,
      email: email,
      campus: campus,
      notes: notes,
      _hp_field: hpField,
      createdAt: nowInVietnam()
    };

    const sent = await sendToGoogleSheet(payload);

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }

    if (!sent) {
      alert("Kết nối đang gián đoạn. Vui lòng thử lại hoặc gọi trực tiếp hotline 0988.284.799.");
      return;
    }

    showSuccessModal(
      "Đăng Ký Tham Quan Thành Công!",
      `Cảm ơn Quý phụ huynh <strong>${escapeHtml(name)}</strong> đã quan tâm tới Princeton Academy. Ban tuyển sinh ${campus ? `cơ sở <strong>${escapeHtml(campus)}</strong>` : "nhà trường"} sẽ liên hệ với Quý phụ huynh qua số điện thoại <strong>${escapeHtml(phone)}</strong> trong vòng 24 giờ làm việc.`
    );
    formParent.reset();
  });
}

// =========================================================================
// 5. MODULE TRANG ĐỐI TÁC (PARTNER LANDING PAGE - partner.html)
// =========================================================================

/**
 * Hiệu ứng timeline tiến trình hợp tác khi cuộn trang
 */
function initProcessReveal() {
  const timeline = document.querySelector(".process-timeline");
  if (!timeline) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion || !("IntersectionObserver" in window)) return;

  timeline.classList.add("process-anim");

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        timeline.classList.add("is-visible");
        obs.disconnect();
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
  );

  observer.observe(timeline);
}

/**
 * Bấm chọn mô hình kinh doanh tự động preselect vào form cuối trang
 */
function initModelPreselect() {
  const modelButtons = document.querySelectorAll("[data-model]");
  const modelSelect = document.getElementById("final-model");
  const finalCard = document.getElementById("final-form-card");

  if (!modelButtons.length || !modelSelect) return;

  modelButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const model = button.getAttribute("data-model");
      const matchingOption = Array.from(modelSelect.options).find((option) => option.value === model);

      if (matchingOption) {
        modelSelect.value = model;
      }

      if (finalCard) {
        finalCard.classList.add("form-attention");
        window.setTimeout(() => finalCard.classList.remove("form-attention"), 1800);
      }
    });
  });
}

/**
 * Xử lý submit 2 Form Nhượng Quyền Đối Tác
 */
function initPartnerForms() {
  const heroForm = document.getElementById("hero-partner-form");
  const finalForm = document.getElementById("final-partner-form");

  async function handlePartnerFormSubmit(form, payload, successTitle, successMessage) {
    const submitButton = form.querySelector('button[type="submit"]');
    if (!submitButton) return;

    const originalHtml = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = "ĐANG GỬI THÔNG TIN...";

    const sent = await sendToGoogleSheet(payload);

    submitButton.disabled = false;
    submitButton.innerHTML = originalHtml;

    if (!sent) {
      alert("Kết nối đang gián đoạn. Vui lòng thử lại hoặc gọi trực tiếp hotline 0988.284.799.");
      return;
    }

    form.reset();
    showPartnerModal(successTitle, successMessage);
  }

  // 1. Form Hero đối tác
  if (heroForm) {
    heroForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const name = valueOf("hero-name");
      const phone = valueOf("hero-phone");
      const province = valueOf("hero-province");
      const budget = valueOf("hero-budget");

      if (!name || !phone) {
        alert("Vui lòng điền họ tên và số điện thoại / Zalo của Quý nhà đầu tư.");
        return;
      }

      const payload = {
        formType: "Đối Tác",
        name,
        phone,
        email: "",
        province,
        model: "Tư vấn theo ngân sách đầu tư",
        budget,
        notes: `Nguồn: Hero Form | Ngân sách đầu tư dự kiến: ${budget || "Chưa xác định"}`,
        _hp_field: valueOf("hero-hp-field"),
        createdAt: nowInVietnam()
      };

      const successMessage = `Cảm ơn Quý nhà đầu tư <strong>${escapeHtml(name)}</strong>. Bộ phận Phát triển Hệ thống Princeton Academy sẽ liên hệ qua số <strong>${escapeHtml(phone)}</strong> trong 24 giờ làm việc để gửi Franchise Kit và bảng tính dòng tiền cho khu vực <strong>${escapeHtml(province || "Quý đối tác")}</strong>.`;

      await handlePartnerFormSubmit(heroForm, payload, "Đăng Ký Nhận Franchise Kit Thành Công!", successMessage);
    });
  }

  // 2. Form chi tiết cuối trang đối tác
  if (finalForm) {
    finalForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const name = valueOf("final-name");
      const phone = valueOf("final-phone");
      const province = valueOf("final-province");
      const model = valueOf("final-model");

      if (!name || !phone) {
        alert("Vui lòng điền họ tên và số điện thoại / Zalo của Quý đối tác.");
        return;
      }

      const payload = {
        formType: "Đối Tác",
        name,
        phone,
        email: "",
        province,
        model,
        notes: "Nguồn: Form CTA cuối trang - Nhận Franchise Kit & Bảng dòng tiền",
        _hp_field: valueOf("final-hp-field"),
        createdAt: nowInVietnam()
      };

      const successMessage = `Cảm ơn Quý đối tác <strong>${escapeHtml(name)}</strong>. Hồ sơ mô hình <strong>${escapeHtml(model || "đang quan tâm")}</strong> và bảng dự toán dòng tiền sẽ được Bộ phận Phát triển Hệ thống Princeton Academy gửi tới Quý đối tác qua số <strong>${escapeHtml(phone)}</strong> trong 24 giờ làm việc.`;

      await handlePartnerFormSubmit(finalForm, payload, "Yêu Cầu Đã Được Tiếp Nhận!", successMessage);
    });
  }
}

// =========================================================================
// 6. KHỞI TẠO ỨNG DỤNG (BOOTSTRAPPER)
// =========================================================================

function initApp() {
  // 1. Khởi tạo các thành phần dùng chung
  initHeaderScroll();
  initMobileMenu();
  initBackToTop();
  initSuccessModals();

  // 2. Tự động phát hiện & khởi tạo trang Phụ huynh nếu có các phần tử tương ứng
  const isParentsPage = Boolean(
    document.getElementById("campuses-list") ||
    document.getElementById("parent-campus-select") ||
    document.getElementById("form-parent")
  );

  if (isParentsPage) {
    renderCampusesList();
    selectCampus(0);
    initParentForm();
  }

  // 3. Tự động phát hiện & khởi tạo trang Đối tác nếu có các phần tử tương ứng
  const isPartnerPage = Boolean(
    document.getElementById("hero-partner-form") ||
    document.getElementById("final-partner-form") ||
    document.querySelector("[data-model]") ||
    document.querySelector(".process-timeline")
  );

  if (isPartnerPage) {
    initProcessReveal();
    initModelPreselect();
    initPartnerForms();
  }
}

// Chạy an toàn khi DOM sẵn sàng hoặc ngay lập tức nếu DOM đã được tải
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}

// Gán các hàm gọi từ inline onclick ra window scope
window.selectCampus = selectCampus;
window.closeSuccessModal = closeSuccessModal;
window.closePartnerModal = closePartnerModal;
