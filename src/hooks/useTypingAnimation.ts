import type { Command } from "@utils/createTerminalCommands";
import { useState, useEffect, useMemo } from "react";

export const useTypingAnimation = (demoCommands: Record<string, Command>) => {
  const [text, setText] = useState("");
  const [commandIndex, setCommandIndex] = useState(0);
  const [hintIndex, setHintIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  const commandEntries = useMemo(() =>
    Object.entries(demoCommands).map(([key, command]) => {
      const hints = command.argsHint || [''];
      return {
        key,
        hints: hints.map(hint => `${key} ${hint}`.trim())
      };
    })
    , [demoCommands]);

  const currentCommand = commandEntries[commandIndex % commandEntries.length];
  const currentPlaceholder = currentCommand.hints[hintIndex % currentCommand.hints.length];

  useEffect(() => {
    const delay = isTyping ? 150 : text.length === 0 ? 500 : 50;

    const timer = setTimeout(() => {
      if (isTyping) {
        if (text.length < currentPlaceholder.length) {
          setText(currentPlaceholder.slice(0, text.length + 1));
        } else {
          setIsTyping(false);
        }
      } else {
        if (text.length === 0) {
          // Cycle through hints first, then move to next command
          if (hintIndex + 1 < currentCommand.hints.length) {
            setHintIndex(i => i + 1);
          } else {
            setHintIndex(0);
            setCommandIndex(i => i + 1);
          }
          setIsTyping(true);
        } else {
          setText(text.slice(0, -1));
        }
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [text, isTyping, currentPlaceholder, currentCommand.hints.length]);

  return text;
};
