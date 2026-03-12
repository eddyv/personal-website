import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

interface Position {
  x: number;
  y: number;
}

interface UseWindowDragOptions {
  initialPosition?: Position;
}

interface UseWindowDragReturn {
  position: Position;
  isDragging: boolean;
  handlePointerDown: (e: React.PointerEvent) => void;
  setPosition: React.Dispatch<React.SetStateAction<Position>>;
}

export function useWindowDrag(
  options: UseWindowDragOptions = {}
): UseWindowDragReturn {
  const { initialPosition = { x: 0, y: 0 } } = options;

  const [position, setPosition] = useState<Position>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef<Position>({ x: 0, y: 0 });
  const activePointerId = useRef<number | null>(null);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) {
        return;
      }

      setIsDragging(true);
      activePointerId.current = e.pointerId;
      dragOffset.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      };

      document.body.style.cursor = "grabbing";
      document.body.style.userSelect = "none";

      // Prevent text selection while dragging
      e.preventDefault();
    },
    [position]
  );

  useEffect(() => {
    if (!isDragging) {
      return;
    }

    const handlePointerMove = (e: PointerEvent) => {
      if (activePointerId.current !== e.pointerId) {
        return;
      }

      const newX = e.clientX - dragOffset.current.x;
      const newY = e.clientY - dragOffset.current.y;

      // Keep window within viewport bounds (with some padding for the header)
      const minY = 40; // Below the header
      const maxY = window.innerHeight - 100;
      const minX = -200; // Allow some off-screen
      const maxX = window.innerWidth - 200;

      setPosition({
        x: Math.max(minX, Math.min(maxX, newX)),
        y: Math.max(minY, Math.min(maxY, newY)),
      });
    };

    const handlePointerEnd = (e: PointerEvent) => {
      if (activePointerId.current !== e.pointerId) {
        return;
      }

      activePointerId.current = null;
      setIsDragging(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerEnd);
    document.addEventListener("pointercancel", handlePointerEnd);

    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerEnd);
      document.removeEventListener("pointercancel", handlePointerEnd);
      activePointerId.current = null;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isDragging]);

  return {
    position,
    isDragging,
    handlePointerDown,
    setPosition,
  };
}
