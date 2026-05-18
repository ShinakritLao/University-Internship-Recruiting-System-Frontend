// End-to-end happy-path suite for the University Internship Recruiting System.
//
// Mirrors the 8 critical paths documented in TESTING.md §6. Tests run serially
// because each step builds on data created by the previous one.
//
// Prerequisites:
//   - Local Go backend on http://localhost:8080 (checked by global-setup.js)
//   - Vite dev server (auto-started via playwright.config.js webServer)

import { test, expect } from "@playwright/test";
import { state } from "./helpers/state.js";
import { pdfFile } from "./fixtures/pdf.js";
import {
  registerUser,
  loginAs,
  clickNav,
  clickInDialog,
  expectToast,
} from "./helpers/flow.js";

test.describe.configure({ mode: "serial" });

test.describe("URS — 8 critical happy paths", () => {
  // ──────────────────────────────────────────────────────────────────────
  // 1. Register all three roles
  // ──────────────────────────────────────────────────────────────────────
  test("1. Register student, company, and staff accounts", async ({
    browser,
  }) => {
    for (const user of [state.student, state.company, state.staff]) {
      const ctx = await browser.newContext();
      const page = await ctx.newPage();
      await registerUser(page, user);
      await ctx.close();
    }
  });

  // ──────────────────────────────────────────────────────────────────────
  // 2. Company submits MOU → staff approves → company sees approved status
  // ──────────────────────────────────────────────────────────────────────
  test("2. Company MOU flow: submit → staff approve → status approved", async ({
    browser,
  }) => {
    // 2a. Company submits the MOU.
    const companyCtx = await browser.newContext();
    const companyPage = await companyCtx.newPage();
    await loginAs(companyPage, state.company, "/company-dashboard");
    await clickNav(companyPage, "MOU Status");

    await companyPage
      .locator(".file-zone__input")
      .setInputFiles(pdfFile("mou.pdf"));
    await companyPage
      .getByLabel("Message to university (optional)")
      .fill("Partnership request from Playwright test run " + state.runId);
    await companyPage
      .getByRole("button", { name: /Submit MOU request/i })
      .click();

    await expectToast(companyPage, "MOU request submitted");
    await expect(companyPage.getByText("Pending review")).toBeVisible();
    await companyCtx.close();

    // 2b. Staff approves the MOU.
    const staffCtx = await browser.newContext();
    const staffPage = await staffCtx.newPage();
    await loginAs(staffPage, state.staff, "/staff-dashboard");
    await clickNav(staffPage, "MOU Requests");

    const companyDisplayName = `${state.company.firstName} ${state.company.lastName}`;
    const row = staffPage
      .locator("tr", { hasText: companyDisplayName })
      .first();
    await expect(row).toBeVisible({ timeout: 15_000 });
    await row.getByRole("button", { name: "Approve" }).click();
    await clickInDialog(staffPage, "Approve");
    await expectToast(staffPage, "MOU approved");
    await staffCtx.close();

    // 2c. Company verifies approved status with 1-year validity.
    const verifyCtx = await browser.newContext();
    const verifyPage = await verifyCtx.newPage();
    await loginAs(verifyPage, state.company, "/company-dashboard");
    await clickNav(verifyPage, "MOU Status");
    await expect(verifyPage.getByText("MOU approved")).toBeVisible({
      timeout: 15_000,
    });
    await expect(verifyPage.getByText("Valid until")).toBeVisible();
    await verifyCtx.close();
  });

  // ──────────────────────────────────────────────────────────────────────
  // 3. Company posts internship → staff approves → goes live
  // ──────────────────────────────────────────────────────────────────────
  test("3. Internship posting: company creates → staff approves → live", async ({
    browser,
  }) => {
    const companyCtx = await browser.newContext();
    const companyPage = await companyCtx.newPage();
    await loginAs(companyPage, state.company, "/company-dashboard");
    await clickNav(companyPage, "Post Internship");

    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 60);
    const deadlineISO = deadline.toISOString().slice(0, 10);

    await companyPage.getByLabel("Job title").fill(state.internshipTitle);
    await companyPage.getByLabel("Duration").fill("3 months");
    await companyPage.getByLabel("Location").fill("Bangkok, Thailand");
    await companyPage.getByLabel("Application deadline").fill(deadlineISO);
    await companyPage.getByLabel("Payment per day (THB)").fill("750");
    await companyPage
      .getByLabel("Description")
      .fill(
        "Hands-on full-stack internship covering React on the frontend and Go on the backend.",
      );
    await companyPage
      .getByLabel("Required qualifications")
      .fill("Basic programming background, willingness to learn, good communication.");
    await companyPage
      .getByRole("button", { name: /Submit for approval/i })
      .click();

    await expectToast(companyPage, "Internship submitted for staff approval");

    await clickNav(companyPage, "My Postings");
    const pendingCard = companyPage
      .locator(".posting-card", { hasText: state.internshipTitle })
      .first();
    await expect(pendingCard).toBeVisible({ timeout: 15_000 });
    await expect(pendingCard.getByText("Pending")).toBeVisible();
    await companyCtx.close();

    const staffCtx = await browser.newContext();
    const staffPage = await staffCtx.newPage();
    await loginAs(staffPage, state.staff, "/staff-dashboard");
    await clickNav(staffPage, "Internship Approvals");

    const row = staffPage
      .locator("tr", { hasText: state.internshipTitle })
      .first();
    await expect(row).toBeVisible({ timeout: 15_000 });
    await row.getByRole("button", { name: "Approve" }).click();
    await clickInDialog(staffPage, "Approve");
    await expectToast(staffPage, "Internship approved");
    await staffCtx.close();
  });

  // ──────────────────────────────────────────────────────────────────────
  // 4. Student browses and applies with CV (+ optional transcript)
  // ──────────────────────────────────────────────────────────────────────
  test("4. Student application: browse → apply with CV → appears in My Applications", async ({
    browser,
  }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await loginAs(page, state.student, "/student-dashboard");

    const card = page
      .locator(".posting-card", { hasText: state.internshipTitle })
      .first();
    await expect(card).toBeVisible({ timeout: 15_000 });
    await card.getByRole("button", { name: /Apply now/i }).click();

    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("Why are you interested?").fill(
      "Eager to gain hands-on full-stack experience and contribute to a real product.",
    );
    // FileZone replaces its <input> with a filename chip after a file is set,
    // so after the first upload only the transcript input remains in the DOM.
    await dialog
      .locator(".file-zone__input")
      .first()
      .setInputFiles(pdfFile("cv.pdf"));
    await dialog
      .locator(".file-zone__input")
      .first()
      .setInputFiles(pdfFile("transcript.pdf"));
    await dialog.getByRole("button", { name: /Submit application/i }).click();

    await expectToast(page, "Application submitted");

    await clickNav(page, "My Applications");
    const row = page
      .locator("tr", { hasText: state.internshipTitle })
      .first();
    await expect(row).toBeVisible({ timeout: 15_000 });
    await expect(row.getByText("Submitted")).toBeVisible();

    await ctx.close();
  });

  // ──────────────────────────────────────────────────────────────────────
  // 5. Company sets application under review → accepts
  // ──────────────────────────────────────────────────────────────────────
  test("5. Company review: Under review → Accept", async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await loginAs(page, state.company, "/company-dashboard");
    await clickNav(page, "Applications");

    await page
      .getByLabel("Select internship posting")
      .selectOption({ label: state.internshipTitle });

    const studentDisplay = `${state.student.firstName} ${state.student.lastName}`;
    const row = page.locator("tr", { hasText: studentDisplay }).first();
    await expect(row).toBeVisible({ timeout: 15_000 });

    await row.getByRole("button", { name: /Under review/i }).click();
    await clickInDialog(page, "Mark");
    await expectToast(page, "updated");
    await expect(row.getByText("Under review")).toBeVisible({
      timeout: 10_000,
    });

    await row.getByRole("button", { name: /^Accept$/ }).click();
    await clickInDialog(page, "Accept");
    await expectToast(page, "updated");
    await expect(row.getByText("Accepted")).toBeVisible({ timeout: 10_000 });

    await ctx.close();
  });

  // ──────────────────────────────────────────────────────────────────────
  // 6. Student receives a notification within the 10s poll interval
  // ──────────────────────────────────────────────────────────────────────
  test("6. Student notification: unread badge appears, opens panel", async ({
    browser,
  }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await loginAs(page, state.student, "/student-dashboard");

    const dot = page.locator(".notif-bell__dot");
    await expect(dot).toBeVisible({ timeout: 20_000 });

    await page.getByRole("button", { name: /Notifications/i }).click();
    const panel = page.locator(".notif-bell__panel");
    await expect(panel).toBeVisible();
    await expect(
      panel.getByText(state.internshipTitle, { exact: false }).first(),
    ).toBeVisible();

    await ctx.close();
  });

  // ──────────────────────────────────────────────────────────────────────
  // 7. Student confirms the accepted internship before the 30-Jun-2026 cutoff
  // ──────────────────────────────────────────────────────────────────────
  test("7. Student confirms accepted application", async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await loginAs(page, state.student, "/student-dashboard");
    await clickNav(page, "My Applications");

    const row = page
      .locator("tr", { hasText: state.internshipTitle })
      .first();
    await expect(row).toBeVisible({ timeout: 15_000 });
    await expect(row.getByText("Accepted")).toBeVisible();
    await row.click(); // opens the detail modal

    // Click "Confirm internship" inside the detail modal.
    await page
      .getByRole("button", { name: /^Confirm internship$/ })
      .click();
    // ConfirmDialog opens on top — "Yes, confirm" appears only once on the page.
    await page
      .getByRole("button", { name: /Yes, confirm/i })
      .click();
    await expectToast(page, "Internship confirmed");

    await expect(row.getByText("Confirmed")).toBeVisible({ timeout: 10_000 });

    await clickNav(page, "Profile");
    await expect(
      page.getByText(state.internshipTitle, { exact: false }).first(),
    ).toBeVisible({ timeout: 10_000 });

    await ctx.close();
  });

  // ──────────────────────────────────────────────────────────────────────
  // 8. Staff oversight: All Applications shows the row, expandable details
  // ──────────────────────────────────────────────────────────────────────
  test("8. Staff oversight: All Applications shows row with documents", async ({
    browser,
  }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await loginAs(page, state.staff, "/staff-dashboard");
    await clickNav(page, "All Applications");

    const row = page
      .locator("tr", { hasText: state.internshipTitle })
      .first();
    await expect(row).toBeVisible({ timeout: 15_000 });
    await expect(row.getByText("Confirmed")).toBeVisible();

    const studentDisplay = `${state.student.firstName} ${state.student.lastName}`;
    await row.getByRole("button", { name: studentDisplay }).click();

    await expect(page.getByRole("link", { name: /View CV/ })).toBeVisible({
      timeout: 10_000,
    });

    await ctx.close();
  });
});
