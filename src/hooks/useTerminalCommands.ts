import { useState } from "react";
import { renderPrompt } from "../utils/terminalUtils";

const personalInfo = `Hi! I'm Edward Vaisman 👋
Role: Software Developer
Location: 🍁 Toronto, ON

Want to get in touch?
Email: vaismanedward@gmail.com
Github: github.com/eddyv`;

type CommandOutput = string | React.ReactNode;

export const useTerminalCommands = () => {
  const [history, setHistory] = useState<CommandOutput[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);

  const commands: Record<string, () => CommandOutput> = {
    "/help": () =>
      `Available commands: /help, /about, /clear, /contact, /projects, /whoami`,
    "/about": () => "I am a Software Engineer...",
    "/clear": () => {
      setHistory([]);
      return "";
    },
    "/projects": () => "Check out my work...",
    "/whoami": () => personalInfo,
  };

  const executeCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim().toLowerCase();
    if (trimmedCmd === "") return;

    const output = commands[trimmedCmd]
      ? commands[trimmedCmd]()
      : `Command not found: ${trimmedCmd}. Type 'help' for available commands.`;

    setHistory((prev) => [...prev, renderPrompt(cmd), output]);
    setCommandHistory((prev) => [...prev, cmd]);

    return output;
  };

  return {
    history,
    commandHistory,
    executeCommand,
    setHistory,
  };
};
