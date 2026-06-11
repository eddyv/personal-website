/**
 * The cross-phase content contract.
 *
 * These values pin the user-visible blog behavior (slugs, titles, ordering,
 * headings, images) so the Astro 6 upgrade and the EmDash migration can prove
 * they introduced no regressions. Posts are listed in expected display order
 * (date descending).
 */
export const expectedPosts = [
  {
    slug: "ai-agents-anthropic-mcp-confluent",
    title:
      "Powering AI Agents with Real-Time Data Using Anthropic's MCP and Confluent",
    // Rendered markdown applies smartypants (straight quote -> curly), so
    // in-content h1 assertions use an apostrophe-free fragment.
    h1Fragment: "Powering AI Agents with Real-Time Data",
    year: 2025,
    formattedDate: "March 25, 2025",
    imagePathPrefix: "/blog/ai-agents-anthropic-mcp/",
    expectedHeading: "What Is Model Context Protocol?",
  },
  {
    slug: "deciding-to-become-event-driven-enterprise",
    title: "Deciding to Become an Event Driven Enterprise",
    h1Fragment: "Deciding to Become an Event Driven Enterprise",
    year: 2021,
    formattedDate: "August 23, 2021",
    imagePathPrefix: "/blog/event-driven-enterprise/",
    expectedHeading: "EDA - A definition",
  },
] as const;
