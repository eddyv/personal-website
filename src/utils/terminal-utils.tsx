import type { JSX } from "react";

/**
 * Renders a command prompt with styling similar to a terminal interface
 *
 * Returns an array of styled span elements representing different parts of the prompt:
 * - Username (cyan)
 * - Location connector (white)
 * - Directory path (green)
 * - Lambda symbol (yellow)
 * - Command text (white)
 *
 * The component includes responsive design with different displays for mobile/desktop:
 * - Mobile: Shows shortened username "ev" and path "~/web"
 * - Desktop: Shows full username "edwardvaisman" and path "~/public_html"
 */
export const renderPrompt = (cmd = ""): JSX.Element[] => {
  return [
    <span className="text-cyan-400" key="user">
      <span className="hidden sm:inline">edwardvaisman</span>
      <span className="sm:hidden">ev</span>
    </span>,
    <span className="text-white/90" key="in">
      {" "}
      in{" "}
    </span>,
    <span className="text-green-400" key="path">
      <span className="hidden sm:inline">~/public_html</span>
      <span className="sm:hidden">~/web</span>{" "}
    </span>,
    <span className="text-yellow-400" key="lambda">
      λ{" "}
    </span>,
    <span className="text-white/90" key="cmd">
      {cmd}
    </span>,
  ];
};
