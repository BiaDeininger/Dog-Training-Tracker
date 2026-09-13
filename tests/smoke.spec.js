// Smoke test: doesn't check every detail, just that the app isn't
// fundamentally broken. Walks through the one path every visitor takes
// on a fresh device (add a dog, add a training, log a session) and
// checks the data survives a reload. See CLAUDE.md for the manual
// checks this doesn't replace.

const { test, expect } = require("@playwright/test");

test("core flow: add dog, add training, log a session, and it survives a reload", async ({ page }) => {
  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(err.message));

  await page.goto("/");

  await expect(page.getByText("Something failed to load")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Training tracker" })).toBeVisible();

  // Fresh install: no dogs yet.
  await page.getByRole("button", { name: "+ Add your first dog" }).click();
  await page.getByPlaceholder("New dog's name").fill("Rex");
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await page.getByRole("button", { name: "Close" }).click();

  await expect(page.getByRole("button", { name: "Rex", exact: true })).toBeVisible();

  // Build a custom training from scratch (avoids depending on template wording).
  await page.getByRole("button", { name: "+ New training for Rex" }).click();
  await page.getByRole("button", { name: "+ Build your own training" }).click();
  await page.getByPlaceholder("Recall training").fill("Recall");
  await page.getByPlaceholder("e.g. Recall speed, Distraction level").fill("Speed");
  await page.getByRole("button", { name: "Create training" }).click();

  const card = page.getByRole("button", { name: "Recall", exact: false });
  await expect(card).toBeVisible();
  await card.click();

  // Log a session against it.
  await page.getByRole("button", { name: "+ Log a session" }).click();
  await page.locator('input[type="number"]').fill("12"); // the "Speed" field
  await page.getByRole("button", { name: "Save entry" }).click();

  await expect(page.getByText("Session logged")).toBeVisible();

  // Data must survive a reload — it's the only persistence this app has.
  await page.reload();
  await expect(page.getByRole("button", { name: "Rex", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Recall", exact: false }).click();
  await expect(page.getByText("1 entry")).toBeVisible();

  expect(consoleErrors, `Unexpected console errors:\n${consoleErrors.join("\n")}`).toEqual([]);
});
