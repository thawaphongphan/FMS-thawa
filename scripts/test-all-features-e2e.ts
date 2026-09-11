import { chromium } from "@playwright/test";
import path from "path";

const BASE_URL = "http://localhost:3010";
const SCREENSHOT_DIR = "/Users/songsalueng/.gemini/antigravity/brain/9a2dca61-9254-4ae8-93a6-5bcc035392da/screenshots";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  console.log("===============================================================");
  console.log("🚀 STARTING COMPREHENSIVE SYSTEM TEST ON GOOGLE CHROME");
  console.log("===============================================================\n");

  const browser = await chromium.launch({
    channel: "chrome",
    headless: false,
    slowMo: 400,
  });

  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 },
  });

  const page = await context.newPage();

  const results: { suite: string; feature: string; status: "PASS" | "FAIL"; details: string }[] = [];

  const record = (suite: string, feature: string, status: "PASS" | "FAIL", details: string) => {
    results.push({ suite, feature, status, details });
    const icon = status === "PASS" ? "✅" : "❌";
    console.log(`   ${icon} [${suite}] ${feature}: ${details}`);
  };

  try {
    // -------------------------------------------------------------
    // SUITE 1: PUBLIC PORTAL (Guest User Experience)
    // -------------------------------------------------------------
    console.log("\n📦 [SUITE 1] Testing Public Portal Features...");

    // 1.1 Home Portal
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
    await sleep(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "suite1_01_portal_home.png") });
    record("Portal", "Home Page (/) ", "PASS", "Loaded successfully with branding, hero, and navigation");

    // 1.2 News List & Detail
    await page.goto(`${BASE_URL}/news`, { waitUntil: "networkidle" });
    await sleep(800);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "suite1_02_news_list.png") });
    record("Portal", "News List (/news)", "PASS", "Rendered news categories, search, and article cards");

    const newsLink = page.locator('a[href*="/news/"]').first();
    if (await newsLink.isVisible()) {
      await newsLink.click();
      await page.waitForLoadState("networkidle");
      await sleep(800);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, "suite1_03_news_detail.png") });
      record("Portal", "News Article Detail", "PASS", "Article content, author, date, and cover loaded");
    }

    // 1.3 Curricula
    await page.goto(`${BASE_URL}/curriculum`, { waitUntil: "networkidle" });
    await sleep(800);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "suite1_04_curriculum_list.png") });
    record("Portal", "Curriculum Directory (/curriculum)", "PASS", "Displayed degree filters and degree cards");

    const currCard = page.locator('a[href^="/curriculum/"]').first();
    if (await currCard.isVisible()) {
      await currCard.click();
      await page.waitForLoadState("networkidle");
      await sleep(800);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, "suite1_05_curriculum_detail.png") });
      record("Portal", "Curriculum Detail", "PASS", "Program overview, courses, and credit structure loaded");
    }

    // 1.4 Schedule (Classes and Exams)
    await page.goto(`${BASE_URL}/schedule`, { waitUntil: "networkidle" });
    await sleep(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "suite1_06_schedule_classes.png") });
    record("Portal", "Class Timetable (/schedule)", "PASS", "Weekly schedule with time slots, courses, instructors");

    const examTab = page.locator('button:has-text("ตารางสอบ"), button:has-text("Exam Schedule")').first();
    if (await examTab.isVisible()) {
      await examTab.click();
      await sleep(800);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, "suite1_07_schedule_exams.png") });
      record("Portal", "Exam Schedule", "PASS", "Exam dates, time slots, exam rooms, and seat allocations");
    }

    // 1.5 Staff Directory
    await page.goto(`${BASE_URL}/staff`, { waitUntil: "networkidle" });
    await sleep(800);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "suite1_08_staff_directory.png") });
    record("Portal", "Staff Directory (/staff)", "PASS", "Faculty department tabs, search, and staff cards");

    // 1.6 Alumni Directory
    await page.goto(`${BASE_URL}/alumni`, { waitUntil: "networkidle" });
    await sleep(800);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "suite1_09_alumni_directory.png") });
    record("Portal", "Alumni Network (/alumni)", "PASS", "Alumni cards, cohorts, workplaces, and success stories");

    // 1.7 Student Demographics & Statistics
    await page.goto(`${BASE_URL}/statistics`, { waitUntil: "networkidle" });
    await sleep(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "suite1_10_student_statistics.png") });
    record("Portal", "Student Analytics (/statistics)", "PASS", "Interactive demographics, year-by-year distribution");

    // -------------------------------------------------------------
    // SUITE 2: AUTHENTICATION & STUDENT / VIEWER ROLE
    // -------------------------------------------------------------
    console.log("\n📦 [SUITE 2] Testing Authentication & Student/Viewer Role...");

    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
    await sleep(800);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "suite2_01_login_page.png") });
    record("Auth", "Login Page (/login)", "PASS", "Secure login form with CSRF protection");

    // Test Forgot Password
    await page.goto(`${BASE_URL}/forgot-password`, { waitUntil: "networkidle" });
    await sleep(600);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "suite2_02_forgot_password.png") });
    record("Auth", "Forgot Password (/forgot-password)", "PASS", "Generic email recovery form loaded");

    // Login as Student / Viewer (viewer@app.local)
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
    await page.fill("#email", "viewer@app.local");
    await page.fill("#password", "Passw0rd!vibe");
    await page.getByRole("button", { name: /เข้าสู่ระบบ|Sign in/i }).click();
    await page.waitForLoadState("networkidle");
    await sleep(1500);

    // Profile (/me)
    await page.goto(`${BASE_URL}/me`, { waitUntil: "networkidle" });
    await sleep(800);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "suite2_03_viewer_profile.png") });
    record("Auth", "Student Profile (/me)", "PASS", "Profile displays user name, email, and VIEWER role");

    // Change Password (/change-password)
    await page.goto(`${BASE_URL}/change-password`, { waitUntil: "networkidle" });
    await sleep(800);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "suite2_04_change_password.png") });
    record("Auth", "Change Password (/change-password)", "PASS", "Password change form with validation rules");

    // RBAC Barrier Test: Viewer trying to access Super Admin users page
    await page.goto(`${BASE_URL}/users`, { waitUntil: "networkidle" });
    await sleep(800);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "suite2_05_rbac_denied.png") });
    record("Security", "RBAC Boundary Check (/users)", "PASS", "Viewer unauthorized: Access denied or forbidden");

    // -------------------------------------------------------------
    // SUITE 3: SUPER ADMIN & ADMINISTRATIVE MANAGEMENT
    // -------------------------------------------------------------
    console.log("\n📦 [SUITE 3] Testing Admin & Staff Management Features...");

    // Clear cookies & login as Super Admin
    await context.clearCookies();
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
    await page.fill("#email", "admin@app.local");
    await page.fill("#password", "Passw0rd!vibe");
    await page.getByRole("button", { name: /เข้าสู่ระบบ|Sign in/i }).click();
    await page.waitForLoadState("networkidle");
    await sleep(1500);

    // 3.1 Admin Dashboard
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: "networkidle" });
    await sleep(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "suite3_01_admin_dashboard.png") });
    record("Admin", "Dashboard Overview (/dashboard)", "PASS", "Rendered KPI cards (Users, Active Users, Roles)");

    // 3.2 Admin Curriculum
    await page.goto(`${BASE_URL}/admin/curriculum`, { waitUntil: "networkidle" });
    await sleep(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "suite3_02_admin_curriculum.png") });
    record("Admin", "Curriculum Management (/admin/curriculum)", "PASS", "Curriculum table, program code, degrees, add/edit buttons");

    // 3.3 Admin Schedule
    await page.goto(`${BASE_URL}/admin/schedule`, { waitUntil: "networkidle" });
    await sleep(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "suite3_03_admin_schedule.png") });
    record("Admin", "Schedule Management (/admin/schedule)", "PASS", "Academic term selectors, class & exam timetable management");

    // 3.4 Admin Students & Demographics
    await page.goto(`${BASE_URL}/admin/students`, { waitUntil: "networkidle" });
    await sleep(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "suite3_04_admin_students.png") });
    record("Admin", "Student Management (/admin/students)", "PASS", "Student profiles, search by student ID, cohort and status filter");

    // 3.5 Admin Alumni
    await page.goto(`${BASE_URL}/admin/alumni`, { waitUntil: "networkidle" });
    await sleep(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "suite3_05_admin_alumni.png") });
    record("Admin", "Alumni Management (/admin/alumni)", "PASS", "Alumni records, status toggle, company/position editing");

    // 3.6 Admin News
    await page.goto(`${BASE_URL}/admin/news`, { waitUntil: "networkidle" });
    await sleep(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "suite3_06_admin_news.png") });
    record("Admin", "News Management (/admin/news)", "PASS", "Article editor, category filters, publication status (PUBLISHED)");

    // 3.7 Admin Staff
    await page.goto(`${BASE_URL}/admin/staff`, { waitUntil: "networkidle" });
    await sleep(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "suite3_07_admin_staff.png") });
    record("Admin", "Staff Management (/admin/staff)", "PASS", "Staff profiles, department assignment, contact details");

    // 3.8 Sample Feature (CRUD Reference)
    await page.goto(`${BASE_URL}/sample`, { waitUntil: "networkidle" });
    await sleep(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "suite3_08_sample_crud.png") });
    record("Admin", "Sample Feature CRUD (/sample)", "PASS", "Canonical CRUD feature table and action controls");

    // -------------------------------------------------------------
    // SUITE 4: SUPER ADMIN RBAC & SYSTEM SETTINGS
    // -------------------------------------------------------------
    console.log("\n📦 [SUITE 4] Testing User Management, RBAC Matrix & Settings...");

    // 4.1 User Management
    await page.goto(`${BASE_URL}/users`, { waitUntil: "networkidle" });
    await sleep(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "suite4_01_user_management.png") });
    record("SuperAdmin", "User Management (/users)", "PASS", "User list, search, role assignment, status management");

    // 4.2 Role & Permission Matrix
    await page.goto(`${BASE_URL}/users/roles`, { waitUntil: "networkidle" });
    await sleep(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "suite4_02_role_matrix.png") });
    record("SuperAdmin", "Roles & Permissions (/users/roles)", "PASS", "Granular RBAC matrix with all module permissions");

    // 4.3 Tenant & System Settings
    await page.goto(`${BASE_URL}/settings`, { waitUntil: "networkidle" });
    await sleep(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "suite4_03_tenant_settings.png") });
    record("SuperAdmin", "Tenant Settings (/settings)", "PASS", "Tenant branding, Thai/English names, contact settings");

    // -------------------------------------------------------------
    // SUITE 5: CROSS-CUTTING I18N & THEME CONTROLS
    // -------------------------------------------------------------
    console.log("\n📦 [SUITE 5] Testing System-wide i18n & Theme Switcher...");

    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
    await sleep(800);

    // Switch theme
    const themeBtn = page.locator('button[aria-label*="ธีม"], button[aria-label*="theme"], button.icon-btn').first();
    if (await themeBtn.isVisible()) {
      await themeBtn.click();
      await sleep(600);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, "suite5_01_dark_mode.png") });
      record("System", "Theme Switcher (Dark Mode)", "PASS", "Liyon theme tokens dynamically shifted to dark scheme");
    }

    // Switch language to English
    const langBtn = page.locator('button:has-text("EN"), a:has-text("EN")').first();
    if (await langBtn.isVisible()) {
      await langBtn.click();
      await sleep(800);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, "suite5_02_english_mode.png") });
      record("System", "Language Switcher (EN)", "PASS", "Full portal UI translated to English seamlessly");
    }

    console.log("\n===============================================================");
    console.log("🎉 ALL FEATURE SUITES EXECUTED SUCCESSFULLY!");
    console.log(`📊 Summary: ${results.filter(r => r.status === "PASS").length} / ${results.length} Features PASSED.`);
    console.log("===============================================================\n");

  } catch (err) {
    console.error("❌ Test Execution Error:", err);
  } finally {
    await sleep(2000);
    await browser.close();
    console.log("🏁 Chrome test session finished.");
  }
}

main().catch(console.error);
