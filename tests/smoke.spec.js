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
  // Includes a text field to cover the "suggest previously typed values" flow.
  await page.getByRole("button", { name: "+ New training for Rex" }).click();
  await page.getByRole("button", { name: "+ Build your own training" }).click();
  await page.getByPlaceholder("Recall training").fill("Recall");
  await page.getByPlaceholder("e.g. Recall speed, Distraction level").first().fill("Speed");
  await page.getByRole("button", { name: "+ Add another thing to track" }).click();
  await page.getByPlaceholder("e.g. Recall speed, Distraction level").nth(1).fill("Where");
  await page.locator("select").nth(1).selectOption("text");
  await page.getByRole("button", { name: "Create training" }).click();

  const card = page.getByRole("button", { name: "Recall", exact: false });
  await expect(card).toBeVisible();
  await card.click();

  // Log a session against it. The "When" timestamp should auto-populate to
  // right now (no interaction needed), collapsed as plain text, with an
  // "Edit" link to expand it for backfilling an older date/time.
  await page.getByRole("button", { name: "+ Log a session" }).click();
  await expect(page.getByText(/^Today at \d{2}:\d{2}$/)).toBeVisible();
  await page.getByRole("button", { name: "Edit" }).click();
  await page.locator('input[placeholder="HH:MM"]').fill("09:15");
  await page.locator('input[type="number"]').fill("12"); // the "Speed" field
  await page.locator('input[list^="suggestions-"]').fill("Park"); // the "Where" field
  await page.getByRole("button", { name: "Save entry" }).click();

  await expect(page.getByText("Session logged")).toBeVisible();
  await expect(page.getByText("09:15")).toBeVisible();

  // Data must survive a reload — it's the only persistence this app has.
  await page.reload();
  await expect(page.getByRole("button", { name: "Rex", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Recall", exact: false }).click();
  await expect(page.getByText("1 entry")).toBeVisible();
  await expect(page.getByText("09:15")).toBeVisible();

  // Logging a second session should suggest the previously typed "Where" value.
  await page.getByRole("button", { name: "+ Log a session" }).click();
  const whereInput = page.locator('input[list^="suggestions-"]');
  const suggestions = await page
    .locator(`datalist#${await whereInput.getAttribute("list")} option`)
    .evaluateAll((opts) => opts.map((o) => o.value));
  expect(suggestions).toContain("Park");

  expect(consoleErrors, `Unexpected console errors:\n${consoleErrors.join("\n")}`).toEqual([]);
});

test("multi-dog logging: one session can be logged for two dogs at once", async ({ page }) => {
  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(err.message));

  await page.goto("/");
  await page.getByRole("button", { name: "+ Add your first dog" }).click();
  await page.getByPlaceholder("New dog's name").fill("Rex");
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await page.getByRole("button", { name: "Close" }).click();

  // Adding a second dog switches the active dog to it and seeds it with the
  // same built-in trainings (incl. "Loose leash walking") as Rex.
  await page.getByRole("button", { name: "Add dog" }).click();
  await page.getByPlaceholder("New dog's name").fill("Luna");
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await page.getByRole("button", { name: "Close" }).click();

  // Switch back to Rex and log a "Loose leash walking" session for both dogs.
  await page.getByRole("button", { name: "Rex", exact: true }).click();
  await page.getByRole("button", { name: "Loose leash walking", exact: false }).click();
  await page.getByRole("button", { name: "+ Log a session" }).click();

  await expect(page.getByText("Dogs", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Luna", exact: true }).last().click();
  await expect(page.getByText("Logs this session for 2 dogs at once.")).toBeVisible();

  await page.locator('input[type="number"]').fill("20");
  await page.getByRole("button", { name: "Save for Rex & Luna" }).click();
  await expect(page.getByText("Session logged for Rex & Luna")).toBeVisible();

  // The session should now show up under Luna's own "Loose leash walking" too.
  await page.getByRole("button", { name: "Luna", exact: true }).click();
  await page.getByRole("button", { name: "Loose leash walking", exact: false }).click();
  await expect(page.getByText("1 entry")).toBeVisible();

  expect(consoleErrors, `Unexpected console errors:\n${consoleErrors.join("\n")}`).toEqual([]);
});

test("gamification: a personal best shows a banner and unlocks an achievement badge", async ({ page }) => {
  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(err.message));

  await page.goto("/");
  await page.getByRole("button", { name: "+ Add your first dog" }).click();
  await page.getByPlaceholder("New dog's name").fill("Fido");
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await page.getByRole("button", { name: "Close" }).click();

  // "Loose leash walking" is a built-in training with a numeric "Duration (min)" field.
  await page.getByRole("button", { name: "Loose leash walking", exact: false }).click();
  await page.getByRole("button", { name: "+ Log a session" }).click();
  await page.locator('input[type="number"]').fill("10");
  await page.getByRole("button", { name: "Save entry" }).click();
  await expect(page.getByText("Session logged")).toBeVisible();

  // A second, higher value beats the first and should trigger the personal-best banner.
  await page.getByRole("button", { name: "+ Log a session" }).click();
  await page.locator('input[type="number"]').fill("25");
  await page.getByRole("button", { name: "Save entry" }).click();
  await expect(page.getByText("New record: 25 min Duration!")).toBeVisible();

  // Editing that same entry afterward must not re-trigger the banner.
  // Sessions are collapsed to date + rating by default, so expand it first.
  await page.getByRole("button", { name: "Expand entry" }).first().click();
  await page.getByRole("button", { name: "Edit", exact: true }).click();
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("Changes saved")).toBeVisible();
  await expect(page.getByText("New record:")).toHaveCount(0);

  // The dog's Achievements section should show this training's "first session" badge unlocked.
  await page.getByRole("button", { name: "Fido's profile" }).click();
  await expect(page.getByText("Achievements")).toBeVisible();
  await expect(page.getByText("First session logged")).toBeVisible();

  expect(consoleErrors, `Unexpected console errors:\n${consoleErrors.join("\n")}`).toEqual([]);
});

test("editing a training: adding/removing tracked fields doesn't wipe already-logged data", async ({ page }) => {
  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(err.message));

  await page.goto("/");
  await page.getByRole("button", { name: "+ Add your first dog" }).click();
  await page.getByPlaceholder("New dog's name").fill("Rex");
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await page.getByRole("button", { name: "Close" }).click();

  await page.getByRole("button", { name: "+ New training for Rex" }).click();
  await page.getByRole("button", { name: "+ Build your own training" }).click();
  await page.getByPlaceholder("Recall training").fill("Recall");
  await page.getByPlaceholder("e.g. Recall speed, Distraction level").first().fill("Speed");
  await page.getByRole("button", { name: "Create training" }).click();

  await page.getByRole("button", { name: "Recall", exact: false }).click();
  await page.getByRole("button", { name: "+ Log a session" }).click();
  await page.locator('input[type="number"]').fill("12");
  await page.getByRole("button", { name: "Save entry" }).click();
  await expect(page.getByText("Session logged")).toBeVisible();

  // Edit the training: add a field, and remove the one that already has history.
  await page.getByRole("button", { name: "Update training" }).click();
  await expect(page.getByText("Logged in 1 session")).toBeVisible();
  await page.getByRole("button", { name: "+ Add another thing to track" }).click();
  await page.getByPlaceholder("e.g. Recall speed, Distraction level").nth(1).fill("Distance");
  await page.getByRole("button", { name: "Remove field" }).first().click();
  await expect(page.getByText("Not tracked anymore")).toBeVisible();
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("Training updated")).toBeVisible();

  // The removed field shouldn't appear on new sessions, but the new one should.
  await page.getByRole("button", { name: "+ Log a session" }).click();
  await expect(page.getByText("Distance", { exact: true })).toBeVisible();
  await expect(page.getByText("Speed", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Close" }).click();

  // The already-logged session should still show the removed field's value.
  await page.getByRole("button", { name: "Expand entry" }).first().click();
  await expect(page.getByText("Speed: 12")).toBeVisible();

  expect(consoleErrors, `Unexpected console errors:\n${consoleErrors.join("\n")}`).toEqual([]);
});
