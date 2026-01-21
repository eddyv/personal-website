import { Window } from "@components/window";
import { useCallback, useEffect, useState } from "react";

interface BlogPost {
  slug: string;
  title: string;
  date: string;
  preview: string;
  tags: string[];
  content: string;
}

interface NotesAppProps {
  posts: BlogPost[];
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatDateShort(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function getYear(dateString: string): number {
  return new Date(dateString).getFullYear();
}

function groupPostsByYear(posts: BlogPost[]): Map<number, BlogPost[]> {
  const grouped = new Map<number, BlogPost[]>();

  for (const post of posts) {
    const year = getYear(post.date);
    const existing = grouped.get(year) || [];
    existing.push(post);
    grouped.set(year, existing);
  }

  // Sort years descending
  const sortedMap = new Map([...grouped.entries()].sort(([a], [b]) => b - a));

  return sortedMap;
}

export function NotesApp({
  posts: initialPosts,
}: NotesAppProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const [posts, setPosts] = useState(initialPosts);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(
    initialPosts.length > 0 ? initialPosts[0].slug : null
  );

  const selectedPost = posts.find((p) => p.slug === selectedSlug);
  const groupedPosts = groupPostsByYear(posts);

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Listen for toggle event from dock
  useEffect(() => {
    const handler = () => handleToggle();
    window.addEventListener("toggle-notes-app", handler);
    return () => window.removeEventListener("toggle-notes-app", handler);
  }, [handleToggle]);

  // Listen for hydrated blog content
  useEffect(() => {
    const handler = (e: CustomEvent<Record<string, string>>) => {
      const contentMap = e.detail;
      setPosts((prev) =>
        prev.map((post) => ({
          ...post,
          content: contentMap[post.slug] || post.content,
        }))
      );
    };

    window.addEventListener("blog-content-loaded", handler as EventListener);

    // Also try to load immediately if content is already in DOM
    const store = document.getElementById("blog-content-store");
    if (store) {
      const contentMap: Record<string, string> = {};
      for (const div of store.querySelectorAll("[data-slug]")) {
        const slug = div.getAttribute("data-slug");
        if (slug) {
          contentMap[slug] = div.innerHTML;
        }
      }
      if (Object.keys(contentMap).length > 0) {
        setPosts((prev) =>
          prev.map((post) => ({
            ...post,
            content: contentMap[post.slug] || post.content,
          }))
        );
      }
    }

    return () =>
      window.removeEventListener(
        "blog-content-loaded",
        handler as EventListener
      );
  }, []);

  return (
    <Window
      defaultSize={{ width: 900, height: 600 }}
      isOpen={isOpen}
      minSize={{ width: 600, height: 400 }}
      onClose={handleClose}
      title="Notes"
    >
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="flex w-72 shrink-0 flex-col border-white/10 border-r bg-[#2a2a2a]">
          {/* Sidebar header with fake toolbar */}
          <div className="flex h-10 items-center justify-between border-white/10 border-b px-3">
            <div className="flex gap-2">
              <button
                className="rounded p-1 text-white/50 hover:bg-white/10"
                type="button"
              >
                <svg
                  className="size-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <title>Menu</title>
                  <path
                    d="M4 6h16M4 12h16M4 18h16"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Posts list */}
          <div className="flex-1 overflow-y-auto">
            {[...groupedPosts.entries()].map(([year, yearPosts]) => (
              <div key={year}>
                {/* Year header */}
                <div className="sticky top-0 bg-[#2a2a2a] px-4 py-2">
                  <span className="font-semibold text-white/40 text-xs">
                    {year}
                  </span>
                </div>

                {/* Posts for this year */}
                {yearPosts.map((post) => (
                  <button
                    className={`w-full border-white/5 border-b px-4 py-3 text-left transition-colors ${
                      selectedSlug === post.slug
                        ? "bg-[#3a3a3a]"
                        : "hover:bg-[#333]"
                    }`}
                    key={post.slug}
                    onClick={() => setSelectedSlug(post.slug)}
                    type="button"
                  >
                    <div className="font-medium text-white/90">
                      {post.title}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-white/40 text-xs">
                      <span>{formatDateShort(post.date)}</span>
                      <span className="truncate">{post.preview}</span>
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Content area */}
        <div className="flex flex-1 flex-col bg-[#1e1e1e]">
          {/* Content toolbar */}
          <div className="flex h-10 items-center justify-between border-white/10 border-b px-4">
            <div className="flex gap-3">
              {/* Decorative toolbar icons */}
              <button
                className="rounded p-1 text-white/40 hover:bg-white/10"
                type="button"
              >
                <svg
                  className="size-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <title>New Note</title>
                  <path
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </button>
              <button
                className="rounded p-1 text-white/40 hover:bg-white/10"
                type="button"
              >
                <svg
                  className="size-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <title>List View</title>
                  <path
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </button>
            </div>

            {/* Date display */}
            {selectedPost && (
              <span className="text-white/40 text-xs">
                {formatDate(selectedPost.date)}
              </span>
            )}
          </div>

          {/* Post content */}
          <div className="flex-1 overflow-y-auto p-6">
            {selectedPost ? (
              <article
                className="prose prose-invert prose-sm max-w-none prose-a:text-blue-400 prose-headings:text-white/90 prose-li:text-white/70 prose-ol:text-white/70 prose-p:text-white/70 prose-strong:text-white/90 prose-ul:text-white/70"
                // biome-ignore lint/security/noDangerouslySetInnerHtml: Blog content is pre-rendered and trusted
                dangerouslySetInnerHTML={{ __html: selectedPost.content }}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-white/40">
                No posts yet
              </div>
            )}
          </div>
        </div>
      </div>
    </Window>
  );
}
