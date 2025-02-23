export const renderPrompt = (cmd = "") => {
  return [
    <span key="user" className="text-cyan-400">
      edwardvaisman
    </span>,
    <span key="in" className="text-white/90">
      {" "}
      in{" "}
    </span>,
    <span key="path" className="text-green-400">
      ~/public_html{" "}
    </span>,
    <span key="lambda" className="text-yellow-400">
      λ{" "}
    </span>,
    <span key="cmd" className="text-white/90">
      {cmd}
    </span>,
  ];
};
