import { useEffect } from "react";

interface DownloadLinkProps {
  href: string;
  label: string;
  shortcut?: string;
}

/**
 * A component that renders a download link with optional keyboard shortcut functionality.
 *
 * @component
 * @param {Object} props - The component props
 * @param {string} props.href - The URL that the link points to
 * @param {string} props.label - The text content of the link
 * @param {string} [props.shortcut] - Optional keyboard shortcut (e.g., "⌘S") that triggers the download when pressed
 *
 * @returns A styled anchor element with keyboard shortcut functionality
 */
export default function DownloadLink({
  href,
  label,
  shortcut,
}: DownloadLinkProps) {
  useEffect(() => {
    if (!shortcut) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = shortcut?.toLowerCase().replace("⌘", "");
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === key) {
        event.preventDefault();
        window.open(href, "_blank", "noopener,noreferrer");
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [shortcut, href]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.href = href;
  };

  return (
    <a
      className="flex justify-between px-4 py-1 text-white/90 hover:bg-blue-500"
      href={href}
      onClick={handleClick}
      rel="noopener noreferrer"
      target="_blank"
    >
      <span>{label}</span>
      {shortcut && <span className="text-white/60">{shortcut}</span>}
    </a>
  );
}
