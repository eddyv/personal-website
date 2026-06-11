import { expect, test } from "@playwright/test";
import { expectedPosts } from "../fixtures/expected-posts";

const [newestPost, olderPost] = expectedPosts;
const NOTES_LABEL = /^Notes$/;
const YEAR_HEADER_PATTERN = /^(2025|2021)$/;

test.describe("notes app", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page
      .getByTestId("dock")
      .locator("button", {
        has: page.locator("span", { hasText: NOTES_LABEL }),
      })
      .click();
  });

  test("lists both posts grouped by year, newest first", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: newestPost.title })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: olderPost.title })
    ).toBeVisible();

    // Year group headers, newest year first.
    const yearHeaders = page.locator("span", {
      hasText: YEAR_HEADER_PATTERN,
    });
    await expect(yearHeaders.first()).toHaveText(String(newestPost.year));
    await expect(yearHeaders.last()).toHaveText(String(olderPost.year));
  });

  test("hydrates and renders the newest post by default", async ({ page }) => {
    const article = page.locator("article");
    await expect(article).toBeVisible();

    // Server-side `content` is empty - a populated article proves the
    // blog-content-loaded hydration handshake worked.
    await expect(article.locator("h1")).toContainText(newestPost.h1Fragment);
    await expect(
      article.locator("h2", { hasText: newestPost.expectedHeading })
    ).toBeVisible();
    await expect(page.getByText(newestPost.formattedDate)).toBeVisible();

    const image = article
      .locator(`img[src^="${newestPost.imagePathPrefix}"]`)
      .first();
    await image.scrollIntoViewIfNeeded();
    await expect(image).toBeVisible();
    // Poll: naturalWidth is 0 until the browser has fetched the image bytes.
    await expect
      .poll(() => image.evaluate((img: HTMLImageElement) => img.naturalWidth))
      .toBeGreaterThan(0);
  });

  test("switches to the older post on selection", async ({ page }) => {
    await page.locator("button", { hasText: olderPost.title }).click();

    const article = page.locator("article");
    await expect(article.locator("h1")).toContainText(olderPost.h1Fragment);
    await expect(
      article.locator("h2", { hasText: olderPost.expectedHeading })
    ).toBeVisible();
    await expect(page.getByText(olderPost.formattedDate)).toBeVisible();

    const image = article
      .locator(`img[src^="${olderPost.imagePathPrefix}"]`)
      .first();
    await image.scrollIntoViewIfNeeded();
    await expect(image).toBeVisible();
    await expect
      .poll(() => image.evaluate((img: HTMLImageElement) => img.naturalWidth))
      .toBeGreaterThan(0);
  });
});
