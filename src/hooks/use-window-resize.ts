import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

interface Size {
  width: number;
  height: number;
}

interface Position {
  x: number;
  y: number;
}

type ResizeDirection = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw" | null;

interface UseWindowResizeOptions {
  initialSize?: Size;
  minSize?: Size;
  currentPosition?: Position;
  onPositionChange?: (position: Position) => void;
}

interface UseWindowResizeReturn {
  size: Size;
  isResizing: boolean;
  resizeDirection: ResizeDirection;
  handleResizeStart: (
    direction: ResizeDirection
  ) => (e: React.PointerEvent) => void;
}

export function useWindowResize(
  options: UseWindowResizeOptions = {}
): UseWindowResizeReturn {
  const {
    initialSize = { width: 800, height: 600 },
    minSize = { width: 400, height: 300 },
    currentPosition = { x: 0, y: 0 },
    onPositionChange,
  } = options;

  const [size, setSize] = useState<Size>(initialSize);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<ResizeDirection>(null);

  const startPos = useRef<Position>({ x: 0, y: 0 });
  const startSize = useRef<Size>(initialSize);
  const startWindowPosition = useRef<Position>(currentPosition);
  const activePointerId = useRef<number | null>(null);

  const handleResizeStart = useCallback(
    (direction: ResizeDirection) => (e: React.PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) {
        return;
      }

      setIsResizing(true);
      setResizeDirection(direction);
      activePointerId.current = e.pointerId;
      startPos.current = { x: e.clientX, y: e.clientY };
      startSize.current = { ...size };
      startWindowPosition.current = { ...currentPosition };

      e.preventDefault();
      e.stopPropagation();
    },
    [currentPosition, size]
  );

  useEffect(() => {
    if (!(isResizing && resizeDirection)) {
      return;
    }

    const handlePointerMove = (e: PointerEvent) => {
      if (activePointerId.current !== e.pointerId) {
        return;
      }

      const deltaX = e.clientX - startPos.current.x;
      const deltaY = e.clientY - startPos.current.y;

      let newWidth = startSize.current.width;
      let newHeight = startSize.current.height;
      let nextPosition = startWindowPosition.current;

      // Handle horizontal resizing
      if (resizeDirection.includes("e")) {
        newWidth = Math.max(minSize.width, startSize.current.width + deltaX);
      } else if (resizeDirection.includes("w")) {
        const widthChange = Math.min(
          deltaX,
          startSize.current.width - minSize.width
        );
        newWidth = startSize.current.width - widthChange;
        nextPosition = {
          ...nextPosition,
          x: startWindowPosition.current.x + widthChange,
        };
      }

      // Handle vertical resizing
      if (resizeDirection.includes("s")) {
        newHeight = Math.max(minSize.height, startSize.current.height + deltaY);
      } else if (resizeDirection.includes("n")) {
        const heightChange = Math.min(
          deltaY,
          startSize.current.height - minSize.height
        );
        newHeight = startSize.current.height - heightChange;
        nextPosition = {
          ...nextPosition,
          y: startWindowPosition.current.y + heightChange,
        };
      }

      setSize({ width: newWidth, height: newHeight });

      // Notify parent about absolute position changes for north/west resizing
      if (onPositionChange && nextPosition !== startWindowPosition.current) {
        onPositionChange(nextPosition);
      }
    };

    const handlePointerEnd = (e: PointerEvent) => {
      if (activePointerId.current !== e.pointerId) {
        return;
      }

      activePointerId.current = null;
      setIsResizing(false);
      setResizeDirection(null);
    };

    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerEnd);
    document.addEventListener("pointercancel", handlePointerEnd);

    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerEnd);
      document.removeEventListener("pointercancel", handlePointerEnd);
      activePointerId.current = null;
    };
  }, [isResizing, resizeDirection, minSize, onPositionChange]);

  return {
    size,
    isResizing,
    resizeDirection,
    handleResizeStart,
  };
}
