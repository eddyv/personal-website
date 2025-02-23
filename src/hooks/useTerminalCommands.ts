import { useState } from "react";
import { renderPrompt } from "@utils/terminalUtils";
import {
  createTerminalCommands,
  type CommandOutput,
} from "@utils/createTerminalCommands";

/**
 * Custom hook for managing terminal commands and their execution.
 *
 * @returns An object containing:
 * - commands: Object containing all available terminal commands
 * - history: Array of command outputs and prompts
 * - commandHistory: Array of previously executed command strings
 * - executeCommand: Function to execute a terminal command
 * - setHistory: Function to update the command history
 * - isExecuting: Boolean indicating if a command is currently executing
 *
 * The hook handles two types of commands:
 * 1. Commands starting with '/' (e.g., /help) which are treated as system commands
 * 2. Regular text input which is processed as an AI command
 *
 * Each command execution updates the history with the command prompt and its output,
 * while also maintaining a separate history of executed commands.
 */
export const useTerminalCommands = () => {
  const [history, setHistory] = useState<CommandOutput[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);

  const commands = createTerminalCommands({ setHistory });

  const updateHistoryAndExecute = async (
    input: string,
    handler: () => Promise<CommandOutput>,
  ) => {
    setHistory((prev) => [...prev, renderPrompt(input), "..."]);
    setCommandHistory((prev) => [...prev, input]);
    setIsExecuting(true);

    const output = await handler();

    setHistory((prev) =>
      prev[prev.length - 1] === "..."
        ? [...prev.slice(0, -1), output]
        : [...prev, output],
    );
    setIsExecuting(false);
    return output;
  };

  const executeCommand = async (input: string) => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    const [firstWord, ...args] = trimmedInput.toLowerCase().split(" ");

    if (firstWord.startsWith("/")) {
      return updateHistoryAndExecute(input, async () =>
        commands[firstWord]
          ? commands[firstWord].handle(args)
          : Promise.resolve(
              `Command not found: ${firstWord}. Type '/help' for available commands.`,
            ),
      );
    }

    return updateHistoryAndExecute(input, async () =>
      commands["/ai"].handle([trimmedInput]),
    );
  };

  return {
    commands,
    history,
    commandHistory,
    executeCommand,
    setHistory,
    isExecuting,
  };
};
