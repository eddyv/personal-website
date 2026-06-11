import { expect, test } from "@playwright/test";

const NOTES_LABEL = /^Notes$/;

test.describe("desktop", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("opens the terminal window on load", async ({ page }) => {
    await expect(
      page.getByText("Ghostty Terminal - edwardvaisman.ca")
    ).toBeVisible();
  });

  test("renders the dock with link apps pointing at the right targets", async ({
    page,
  }) => {
    const dock = page.getByTestId("dock");

    await expect(dock.locator("a")).toHaveCount(4);
    await expect(dock.locator("button")).toHaveCount(2);

    await expect(
      dock.locator('a[href="mailto:vaismanedward@gmail.com"]')
    ).toHaveAttribute("rel", "noopener noreferrer");
    await expect(
      dock.locator('a[href="https://github.com/eddyv"]')
    ).toHaveAttribute("target", "_blank");
    await expect(
      dock.locator('a[href="https://www.linkedin.com/in/edwardvaisman/"]')
    ).toHaveAttribute("rel", "noopener noreferrer");
    await expect(dock.locator('a[href$="cv.pdf"]')).toBeVisible();
  });

  test("toggles the Notes window from the dock", async ({ page }) => {
    const dock = page.getByTestId("dock");
    const notesDockButton = dock.locator("button", {
      has: page.locator("span", { hasText: NOTES_LABEL }),
    });
    // Closed windows stay mounted at opacity-0; aria-hidden tracks open state.
    const notesWindow = page
      .locator("div[aria-hidden]")
      .filter({ has: page.locator("article") });

    await expect(notesWindow).toHaveAttribute("aria-hidden", "true");

    await notesDockButton.click();
    await expect(notesWindow).toHaveAttribute("aria-hidden", "false");

    await notesWindow.locator('button[aria-label="Close window"]').click();
    await expect(notesWindow).toHaveAttribute("aria-hidden", "true");

    await notesDockButton.click();
    await expect(notesWindow).toHaveAttribute("aria-hidden", "false");
  });
});
