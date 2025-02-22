import { useState, useEffect } from "react";

const demoCommands = ["/whoami", "/projects", "/about", "/help", "/contact"];

export const useTypingAnimation = () => {
  const [currentText, setCurrentText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    const command = demoCommands[currentIndex];

    if (isTyping) {
      if (currentText.length < command.length) {
        // Typing effect
        const timeoutId = setTimeout(() => {
          setCurrentText(command.slice(0, currentText.length + 1));
        }, 150); // Typing speed
        return () => clearTimeout(timeoutId);
      } else {
        // Pause at the end of typing
        const timeoutId = setTimeout(() => {
          setIsTyping(false);
        }, 1000); // Wait time after typing
        return () => clearTimeout(timeoutId);
      }
    } else {
      // Pause before erasing
      const timeoutId = setTimeout(
        () => {
          if (currentText.length === 0) {
            // Move to next command
            setCurrentIndex((prev) => (prev + 1) % demoCommands.length);
            setIsTyping(true);
          } else {
            // Erasing effect
            setCurrentText(currentText.slice(0, -1));
          }
        },
        currentText.length === 0 ? 500 : 50,
      ); // Erasing speed
      return () => clearTimeout(timeoutId);
    }
  }, [currentText, currentIndex, isTyping]);

  return currentText;
};
