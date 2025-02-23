import type { JSX } from "react";

/**
 * Renders a command prompt with styling similar to a terminal interface
 * @param {string} cmd - The command to display in the prompt (defaults to empty string)
 * @returns {JSX.Element[]} An array of styled span elements representing different parts of the prompt:
 *  - Username (cyan)
 *  - Location connector (white)
 *  - Directory path (green)
 *  - Lambda symbol (yellow)
 *  - Command text (white)
 *
 * @note The component includes responsive design with different displays for mobile/desktop:
 *  - Mobile: Shows shortened username "ev" and path "~/web"
 *  - Desktop: Shows full username "edwardvaisman" and path "~/public_html"
 */
export const renderPrompt = (cmd: string = ""): JSX.Element[] => {
  return [
    <span key="user" className="text-cyan-400">
      <span className="hidden sm:inline">edwardvaisman</span>
      <span className="sm:hidden">ev</span>
    </span>,
    <span key="in" className="text-white/90">
      {" "}
      in{" "}
    </span>,
    <span key="path" className="text-green-400">
      <span className="hidden sm:inline">~/public_html</span>
      <span className="sm:hidden">~/web</span>{" "}
    </span>,
    <span key="lambda" className="text-yellow-400">
      λ{" "}
    </span>,
    <span key="cmd" className="text-white/90">
      {cmd}
    </span>,
  ];
};
