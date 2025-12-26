import { LoadingDots } from "@components/loading-dots";
import { useTerminalCommands } from "@hooks/use-terminal-commands";
import { useTerminalInput } from "@hooks/use-terminal-input";
import { useTypingAnimation } from "@hooks/use-typing-animation";
import { renderPrompt } from "@utils/terminal-utils";
import type React from "react";
import { useEffect, useRef } from "react";

interface Props {
  initialText?: (string | React.ReactNode)[];
}

const initText = `Welcome! This is an interactive terminal.

You can type commands below where you see the blinking cursor.
Don't see a blinking cursor? Click on typing placeholder text and start typing!

Not sure where to start? Try typing '/help' and press Enter.
`;

const Terminal: React.FC<Props> = ({ initialText = [initText] }) => {
  const { commands, history, commandHistory, executeCommand, isExecuting } =
    useTerminalCommands(initialText);
  const { input, setInput, handleKeyDown } = useTerminalInput(
    commandHistory,
    executeCommand,
    isExecuting
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const typingAnimation = useTypingAnimation(commands);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, []);

  return (
    <div className="fixed inset-x-0 top-20 bottom-30 mx-auto max-w-5xl px-2 sm:px-6 md:px-8">
      <div className="h-full overflow-hidden rounded-lg bg-[rgba(28,28,28,0.85)] shadow-2xl">
        <div className="relative flex h-10 items-center rounded-t-lg bg-[rgba(28,28,28,0.85)] px-2 sm:px-4">
          <div className="absolute left-2 flex gap-2 sm:left-4">
            <div className="size-3 rounded-full bg-[#FF5F56]" />
            <div className="size-3 rounded-full bg-[#FFBD2E]" />
            <div className="size-3 rounded-full bg-[#27C93F]" />
          </div>
          <div className="flex-1">
            <span className="block text-center text-sm text-white/60">
              👨‍💻 - edwardvaisman.ca
            </span>
          </div>
        </div>

        <div className="flex h-[calc(100%-5rem)] flex-col">
          <div
            className="flex-1 overflow-auto p-2 font-mono text-sm text-white/90 sm:p-4"
            ref={terminalRef}
          >
            {history.map((line, i) => (
              <div
                className="wrap-break-word mb-1 whitespace-pre-wrap leading-relaxed"
                key={`${i}-${typeof line === "string" ? line : "node"}`}
              >
                {line === "..." ? <LoadingDots /> : line}
              </div>
            ))}
          </div>

          <div className="border-white/10 border-t px-2 py-4 sm:pl-4">
            <div className="flex items-center font-mono text-sm">
              <div className="flex shrink-0 items-center gap-2">
                {renderPrompt()}
              </div>
              <input
                autoFocus
                className="ml-2 w-full min-w-0 bg-transparent text-white/90 outline-none"
                disabled={isExecuting}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isExecuting ? "Command executing..." : typingAnimation
                }
                ref={inputRef}
                type="text"
                value={input}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terminal;
