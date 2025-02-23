import { useState } from "react";
import { renderPrompt } from "@utils/terminalUtils";
import {
  createTerminalCommands,
  type CommandOutput,
} from "@utils/createTerminalCommands";

export const useTerminalCommands = () => {
  const [history, setHistory] = useState<CommandOutput[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);

  const commands = createTerminalCommands({ setHistory });

  const executeCommand = async (input: string) => {
    const [command, ...args] = input.trim().toLowerCase().split(" ");
    if (!command) return;

    const cmdKey = command.startsWith("/") ? command : `/${command}`;

    setHistory((prev) => [...prev, renderPrompt(input), "..."]);
    setCommandHistory((prev) => [...prev, input]);

    setIsExecuting(true);
    const output = commands[cmdKey]
      ? await commands[cmdKey].handle(args)
      : `Command not found: ${command}. Type '/help' for available commands.`;
    // Remove loading indicator if it exists and add response
    setHistory((prev) =>
      prev[prev.length - 1] === "..."
        ? [...prev.slice(0, -1), output]
        : [...prev, output],
    );
    setIsExecuting(false);
    return output;
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
