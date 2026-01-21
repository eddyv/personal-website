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
  handleMouseDown: (e: React.MouseEvent) => void;
}

export function useWindowDrag(
  options: UseWindowDragOptions = {}
): UseWindowDragReturn {
  const { initialPosition = { x: 0, y: 0 } } = options;

  const [position, setPosition] = useState<Position>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef<Position>({ x: 0, y: 0 });

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Only allow dragging from left mouse button
      if (e.button !== 0) {
        return;
      }

      setIsDragging(true);
      dragOffset.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      };

      // Prevent text selection while dragging
      e.preventDefault();
    },
    [position]
  );

  useEffect(() => {
    if (!isDragging) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
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

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  return {
    position,
    isDragging,
    handleMouseDown,
  };
}
