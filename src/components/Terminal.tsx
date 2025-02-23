import React, { useEffect, useRef } from "react";
import { useTerminalCommands } from "@hooks/useTerminalCommands";
import { useTerminalInput } from "@hooks/useTerminalInput";
import { renderPrompt } from "@utils/terminalUtils";
import { useTypingAnimation } from "@hooks/useTypingAnimation";
import { LoadingDots } from "@components/LoadingDots";

interface Props {
  initialText?: (string | React.ReactNode)[];
}

const initText = `Welcome! This is an interactive terminal.

You can type commands below where you see the blinking cursor.
Don't see a blinking cursor? Click on typing placeholder text and start typing!

Not sure where to start? Try typing '/help' and press Enter.
`;

const Terminal: React.FC<Props> = ({ initialText = [initText] }) => {
  const {
    commands,
    history,
    commandHistory,
    executeCommand,
    setHistory,
    isExecuting,
  } = useTerminalCommands();
  const { input, setInput, handleKeyDown } = useTerminalInput(
    commandHistory,
    executeCommand,
    isExecuting,
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const typingAnimation = useTypingAnimation(commands);

  useEffect(() => {
    setHistory([...initialText]);
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  return (
    <div className="fixed inset-x-0 bottom-30 top-20 mx-auto max-w-5xl px-2 sm:px-6 md:px-8">
      <div className="h-full overflow-hidden rounded-lg bg-[rgba(28,28,28,0.85)] shadow-2xl">
        <div className="relative flex h-10 items-center rounded-t-lg bg-[rgba(28,28,28,0.85)] px-2 sm:px-4">
          <div className="absolute left-2 sm:left-4 flex gap-2">
            <div className="size-3 rounded-full bg-[#FF5F56]"></div>
            <div className="size-3 rounded-full bg-[#FFBD2E]"></div>
            <div className="size-3 rounded-full bg-[#27C93F]"></div>
          </div>
          <div className="flex-1">
            <span className="block text-center text-sm text-white/60">
              👨‍💻 - edwardvaisman.ca
            </span>
          </div>
        </div>

        <div className="flex h-[calc(100%-5rem)] flex-col">
          <div
            ref={terminalRef}
            className="flex-1 overflow-auto p-2 sm:p-4 font-mono text-sm text-white/90"
          >
            {history.map((line, i) => (
              <div
                key={i}
                className="mb-1 leading-relaxed break-words whitespace-pre-wrap"
              >
                {line === "..." ? <LoadingDots /> : line}
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 px-2 sm:pl-4 py-4">
            <div className="flex items-center font-mono text-sm">
              <div className="flex-shrink-0 flex items-center gap-2">
                {renderPrompt()}
              </div>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="ml-2 w-full min-w-0 bg-transparent outline-none text-white/90"
                autoFocus
                placeholder={
                  isExecuting ? "Command executing..." : typingAnimation
                }
                disabled={isExecuting}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terminal;
