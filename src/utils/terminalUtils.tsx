export const renderPrompt = (cmd = "") => {
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
