# Unified Landing Page Script Design (assets/js/app.js)

**Date:** 2026-11-06  
**Status:** Approved  
**Scope:** Consolidate `main.js` (Parents landing page) and `partner.js` (Partner landing page) into a single, cohesive script `assets/js/app.js` serving both `index.html` and `partner.html`.

---

## 1. Context & Motivation

Currently, the Princeton Academy repository maintains two independent JavaScript files:
- `assets/js/main.js` (Parents landing page / `index.html`)
- `assets/js/partner.js` (Partner & Franchise landing page / `partner.html`)

Both scripts share considerable duplicate code:
- Shared endpoint `LEAD_API_URL = "/api/lead"`
- Google Sheets / serverless API fetch wrapper (`sendToGoogleSheet`)
- HTML entity sanitization (`escapeHtml`)
- Sticky header scroll effect (switching `#header-logo` between `logo1.png` and `logo3.png`)
- Mobile navigation toggle (`#mobile-menu-toggle` and `#mobile-menu`)
- Back-to-top scroll button (`#back-to-top`)
- Success modal UX and keyboard/overlay dismiss handlers

Maintaining two scripts creates synchronization overhead, risks divergence, and caused issues like unanchored ignore rules and syntax differences. Consolidating into a single script ensures consistent behavior, reduced maintenance, and single-point testing.

---

## 2. Architecture & Design

### 2.1 Single Entry Script: `assets/js/app.js`

The unified script `assets/js/app.js` is structured into clean modular namespaces:

```
assets/js/app.js
 ├── Core Utilities & API
 │    ├── LEAD_API_URL = "/api/lead"
 │    ├── escapeHtml(value)
 │    ├── valueOf(id)
 │    ├── nowInVietnam()
 │    └── sendToGoogleSheet(payload)
 │
 ├── Shared UI Handlers (runs on both pages if elements exist)
 │    ├── initHeaderScroll()      (Header bg & logo switch)
 │    ├── initMobileMenu()        (Mobile dropdown toggle)
 │    ├── initBackToTop()         (Back to top button)
 │    └── initSuccessModal()      (Unified modal for parent & partner)
 │
 ├── Parents Feature Module (runs only if parent elements exist)
 │    ├── CAMPUSES dataset (10 campuses)
 │    ├── renderCampusesList()
 │    ├── selectCampus(index)
 │    └── initParentForm()
 │
 ├── Partner Feature Module (runs only if partner elements exist)
 │    ├── initProcessReveal()     (IntersectionObserver timeline)
 │    ├── initModelPreselect()    (Data-model button picker)
 │    └── initPartnerForms()      (Hero & Final franchise forms)
 │
 └── App Bootstrapper
      └── Safe DOMContentLoaded listener + immediate execution fallback
```

### 2.2 DOM Detection Strategy

To prevent errors on pages where certain elements do not exist:
- **Parents logic**: Checks `if (document.getElementById('parent-campus-select') || document.getElementById('campuses-list'))`
- **Partner logic**: Checks `if (document.getElementById('hero-partner-form') || document.getElementById('final-partner-form') || document.querySelector('[data-model]'))`
- **Shared logic**: Every shared handler (`initHeaderScroll`, `initMobileMenu`, `initBackToTop`, `initSuccessModal`) guards all DOM queries (`if (!header || !logo) return;`, etc.).

### 2.3 Global Function Compatibility

In `index.html`, elements have inline `onclick="selectCampus(0)"`.
Therefore:
- `selectCampus` must remain globally accessible on `window.selectCampus` so inline HTML handlers continue to function seamlessly.
- `closeSuccessModal` remains accessible on `window.closeSuccessModal`.

### 2.4 Modal Unification

The script supports both modal markup structures:
- `#success-modal` (Parent modal in `index.html`)
- `#partner-success-modal` (Partner modal in `partner.html`)

A unified helper `showModal({ title, message, isPartner })` or auto-detection handles displaying either modal, managing `aria-hidden`, `overflow: hidden` on `body`, Escape key dismissal, and backdrop click dismissal.

---

## 3. HTML Integration & Backward Compatibility

1. **`index.html`**:
   Replace:
   ```html
   <script src="assets/js/main.js?v=4"></script>
   ```
   With:
   ```html
   <script src="assets/js/app.js?v=1"></script>
   ```

2. **`partner.html`**:
   Replace:
   ```html
   <script src="assets/js/partner.js?v=3"></script>
   ```
   With:
   ```html
   <script src="assets/js/app.js?v=1"></script>
   ```

3. **Legacy Fallback Files**:
   - Keep `main.js` and `partner.js` lightweight or re-exporting/loading `app.js` to ensure any stale external bookmarks or cached references remain functional.

---

## 4. Verification & Testing Plan

1. **Syntax Check:**
   `node -c assets/js/app.js` passes with code 0.
2. **Security & Unit Tests:**
   Update `test/security.test.js` to test `app.js` syntax, sanitization, honeypot forwarding, and mock submissions.
3. **Asset Verification:**
   Run `node scripts/verify-assets.js` to ensure all script and asset references in both HTML files resolve.
4. **Functional Checklist:**
   - [ ] `index.html`: Header turns maroon on scroll, logo switches to `logo3.png`.
   - [ ] `index.html`: Campus selection switches active state and updates Google Maps iframe.
   - [ ] `index.html`: Parent registration form submits to `/api/lead` and displays modal.
   - [ ] `partner.html`: Header turns maroon on scroll, logo switches.
   - [ ] `partner.html`: Timeline animation triggers on scroll.
   - [ ] `partner.html`: Clicking franchise model buttons preselects model in final form.
   - [ ] `partner.html`: Both Hero and Final forms submit to `/api/lead` and display modal.
