// Cross-test helpers for the happy-path suite.

import { expect } from "@playwright/test";

export async function registerUser(page, user) {
  await page.goto("/register");
  await page.getByLabel("First name").fill(user.firstName);
  await page.getByLabel("Last name").fill(user.lastName);
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("User ID").fill(user.userId);
  // Required labels render as "Password*"; the eye-toggle button is also
  // aria-labelled "Show password" — anchor the regex to disambiguate.
  await page.getByLabel(/^Password\*?$/).fill(user.password);
  await page.getByLabel(/^Confirm password\*?$/).fill(user.password);
  await page.getByRole("button", { name: /Create account/i }).click();
  await expect(page).toHaveURL(/\/login$/, { timeout: 15_000 });
}

export async function loginAs(page, user, expectedDashboard) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("User ID").fill(user.userId);
  await page.getByLabel(/^Password\*?$/).fill(user.password);
  await page.getByRole("button", { name: /^Sign in$/ }).click();
  await expect(page).toHaveURL(new RegExp(expectedDashboard + "$"), {
    timeout: 15_000,
  });
}

// Scope queries to the desktop sidebar so we don't fight the mobile nav.
export function sidebar(page) {
  return page.locator(".app-sidebar__nav");
}

export async function clickNav(page, label) {
  await sidebar(page).getByRole("button", { name: label }).click();
}

export async function clickInDialog(page, name) {
  await page.getByRole("dialog").getByRole("button", { name }).click();
}

// Wait for a sonner toast containing the given text.
export async function expectToast(page, text) {
  await expect(
    page.locator("[data-sonner-toaster]").getByText(text, { exact: false }).first(),
  ).toBeVisible({ timeout: 10_000 });
}
