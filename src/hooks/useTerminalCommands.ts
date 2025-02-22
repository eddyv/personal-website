import { useState } from "react";
import { renderPrompt } from "@utils/terminalUtils";
import {
  createTerminalCommands,
  type CommandOutput,
} from "@utils/createTerminalCommands";

export const useTerminalCommands = () => {
  const [history, setHistory] = useState<CommandOutput[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);

  const commands = createTerminalCommands({ setHistory });

  const executeCommand = (input: string) => {
    const [command, ...args] = input.trim().toLowerCase().split(" ");
    if (!command) return;

    const cmdKey = command.startsWith("/") ? command : `/${command}`;
    const output = commands[cmdKey]
      ? commands[cmdKey].handle(args)
      : `Command not found: ${command}. Type '/help' for available commands.`;

    setHistory((prev) => [...prev, renderPrompt(input), output]);
    setCommandHistory((prev) => [...prev, input]);

    return output;
  };

  return {
    commands,
    history,
    commandHistory,
    executeCommand,
    setHistory,
  };
};
