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
  onPositionChange?: (delta: Position) => void;
}

interface UseWindowResizeReturn {
  size: Size;
  isResizing: boolean;
  resizeDirection: ResizeDirection;
  handleResizeStart: (
    direction: ResizeDirection
  ) => (e: React.MouseEvent) => void;
}

export function useWindowResize(
  options: UseWindowResizeOptions = {}
): UseWindowResizeReturn {
  const {
    initialSize = { width: 800, height: 600 },
    minSize = { width: 400, height: 300 },
    onPositionChange,
  } = options;

  const [size, setSize] = useState<Size>(initialSize);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<ResizeDirection>(null);

  const startPos = useRef<Position>({ x: 0, y: 0 });
  const startSize = useRef<Size>(initialSize);

  const handleResizeStart = useCallback(
    (direction: ResizeDirection) => (e: React.MouseEvent) => {
      if (e.button !== 0) {
        return;
      }

      setIsResizing(true);
      setResizeDirection(direction);
      startPos.current = { x: e.clientX, y: e.clientY };
      startSize.current = { ...size };

      e.preventDefault();
      e.stopPropagation();
    },
    [size]
  );

  useEffect(() => {
    if (!(isResizing && resizeDirection)) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startPos.current.x;
      const deltaY = e.clientY - startPos.current.y;

      let newWidth = startSize.current.width;
      let newHeight = startSize.current.height;
      let positionDeltaX = 0;
      let positionDeltaY = 0;

      // Handle horizontal resizing
      if (resizeDirection.includes("e")) {
        newWidth = Math.max(minSize.width, startSize.current.width + deltaX);
      } else if (resizeDirection.includes("w")) {
        const widthChange = Math.min(
          deltaX,
          startSize.current.width - minSize.width
        );
        newWidth = startSize.current.width - widthChange;
        positionDeltaX = widthChange;
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
        positionDeltaY = heightChange;
      }

      setSize({ width: newWidth, height: newHeight });

      // Notify parent about position changes for north/west resizing
      if ((positionDeltaX !== 0 || positionDeltaY !== 0) && onPositionChange) {
        onPositionChange({ x: positionDeltaX, y: positionDeltaY });
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeDirection(null);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, resizeDirection, minSize, onPositionChange]);

  return {
    size,
    isResizing,
    resizeDirection,
    handleResizeStart,
  };
}
