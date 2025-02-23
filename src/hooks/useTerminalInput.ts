import { useState, useCallback, type KeyboardEvent } from "react";

export const useTerminalInput = (
  commandHistory: string[],
  onExecuteCommand: (cmd: string) => void,
  isExecuting: boolean,
) => {
  const [input, setInput] = useState("");
  const [historyIndex, setHistoryIndex] = useState(-1);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // prevent command execution while another command is executing
      if (isExecuting) {
        e.preventDefault();
        return;
      }

      switch (e.key) {
        case "Enter":
          onExecuteCommand(input);
          setInput("");
          setHistoryIndex(-1);
          break;
        case "ArrowUp":
          e.preventDefault();
          if (historyIndex < commandHistory.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            setInput(
              commandHistory[commandHistory.length - 1 - newIndex] || "",
            );
          }
          break;
        case "ArrowDown":
          e.preventDefault();
          if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            setInput(
              commandHistory[commandHistory.length - 1 - newIndex] || "",
            );
          } else {
            setHistoryIndex(-1);
            setInput("");
          }
          break;
      }
    },
    [historyIndex, commandHistory, input, onExecuteCommand, isExecuting],
  );

  return {
    input,
    setInput,
    handleKeyDown,
  };
};
