# Unified Landing Page Script Implementation Plan

> **Goal:** Consolidate `assets/js/main.js` and `assets/js/partner.js` into a single unified script `assets/js/app.js` serving both `index.html` (parents) and `partner.html` (partner/franchise), with DOM-aware execution and backward compatibility.

- **Spec:** `docs/superpowers/specs/2026-11-06-unified-landingpage-script-design.md`
- **Estimated Time:** 15 minutes

---

### Task 1: Create `assets/js/app.js`

**Files:**
- Create `assets/js/app.js`

**Key Components:**
1. Core Utilities (`LEAD_API_URL`, `escapeHtml`, `valueOf`, `nowInVietnam`, `sendToGoogleSheet`)
2. Shared UI (`initHeaderScroll`, `initMobileMenu`, `initBackToTop`, `showSuccessModal`, `closeSuccessModal`, `showPartnerModal`, `closePartnerModal`, `initSuccessModals`)
3. Parents Module (`CAMPUSES` 10 items, `renderCampusesList`, `selectCampus`, `initParentForm`)
4. Partner Module (`initProcessReveal`, `initModelPreselect`, `initPartnerForms`)
5. Bootstrapper (`initApp` on `DOMContentLoaded` or immediate if already interactive/complete)
6. Global exports (`window.selectCampus`, `window.closeSuccessModal`, `window.closePartnerModal`)

---

### Task 2: Update Tests in `test/security.test.js`

**Files:**
- Modify `test/security.test.js`

**Changes:**
- Add test verifying `assets/js/app.js` parses cleanly with zero syntax errors.
- Add test verifying `app.js` contains `escapeHtml` and sanitizes name/phone.
- Add test verifying `app.js` checks `sendToGoogleSheet` status.
- Keep tests passing for existing files.

---

### Task 3: Update `index.html` and `partner.html`

**Files:**
- Modify `index.html`
- Modify `partner.html`

**Changes:**
- In `index.html`: replace `<script src="assets/js/main.js?v=4"></script>` with `<script src="assets/js/app.js?v=1"></script>`.
- In `partner.html`: replace `<script src="assets/js/partner.js?v=3"></script>` with `<script src="assets/js/app.js?v=1"></script>`.

---

### Task 4: Backward Compatibility in Legacy Scripts

**Files:**
- Modify `assets/js/main.js`
- Modify `assets/js/partner.js`

**Changes:**
- Make `main.js` and `partner.js` thin stubs that load or mirror `app.js` functions so any legacy cached references do not fail.

---

### Task 5: Comprehensive Verification

**Commands:**
- `node -c assets/js/app.js`
- `node scripts/verify-assets.js`
- `node --test test/security.test.js`
- Git commit and push
