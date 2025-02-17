import { useEffect } from 'react';

interface DownloadLinkProps {
  href: string;
  label: string;
  shortcut?: string;
}

export default function DownloadLink({ href, label, shortcut }: DownloadLinkProps) {
  useEffect(() => {
    if (!shortcut) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = shortcut?.toLowerCase().replace('⌘', '');
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === key) {
        event.preventDefault();
        window.location.href = href;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcut, href]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.href = href;
  };

  return (
    <a
      href={href}
      className="flex justify-between px-4 py-1 text-white/90 hover:bg-blue-500"
      onClick={handleClick}
    >
      <span>{label}</span>
      {shortcut && <span className="text-white/60">{shortcut}</span>}
    </a>
  );
}
