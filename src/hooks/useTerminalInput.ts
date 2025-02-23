import { useState, useCallback, type KeyboardEvent } from "react";

/**
 * A custom hook that manages terminal input state and command history navigation.
 *
 * @param commandHistory - An array of previously executed commands
 * @param onExecuteCommand - Callback function to execute when Enter key is pressed
 * @param isExecuting - Boolean flag indicating if a command is currently executing
 *
 * @returns An object containing:
 * - input: The current input value
 * - setInput: Function to update the input value
 * - handleKeyDown: Event handler for keyboard interactions
 *
 * @remarks
 * This hook provides the following functionality:
 * - Enter key executes the current command
 * - Arrow Up navigates to previous commands in history
 * - Arrow Down navigates to more recent commands in history
 * - Prevents command execution while another command is running
 */
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
