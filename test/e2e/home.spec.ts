import { expect, test } from "@playwright/test";
import { expectedPosts } from "../fixtures/expected-posts";

const DESCRIPTION_PATTERN = /Software Engineer based in Toronto/;

test.describe("home page", () => {
  test("serves the page with SEO metadata", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);

    await expect(page).toHaveTitle("Edward Vaisman - Software Engineer");
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      DESCRIPTION_PATTERN
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://edwardvaisman.ca"
    );
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      "content",
      "Edward Vaisman - Software Engineer"
    );
    // The sitemap file itself only exists in build output; dev serves the tag.
    await expect(page.locator('link[rel="sitemap"]')).toHaveAttribute(
      "href",
      "/sitemap-index.xml"
    );
  });

  test("embeds both blog posts in the content store, newest first", async ({
    page,
  }) => {
    await page.goto("/");

    const store = page.locator("#blog-content-store > [data-slug]");
    await expect(store).toHaveCount(expectedPosts.length);

    const slugs = await store.evaluateAll((divs) =>
      divs.map((div) => div.getAttribute("data-slug"))
    );
    expect(slugs).toEqual(expectedPosts.map((post) => post.slug));

    for (const post of expectedPosts) {
      const postStore = page.locator(
        `#blog-content-store > [data-slug="${post.slug}"]`
      );
      await expect(postStore.locator("h1")).toContainText(post.h1Fragment);
      expect(
        await postStore.locator(`img[src^="${post.imagePathPrefix}"]`).count()
      ).toBeGreaterThan(0);
    }
  });
});
