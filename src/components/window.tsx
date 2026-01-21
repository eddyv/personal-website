import { useWindowDrag } from "@hooks/use-window-drag";
import { useWindowResize } from "@hooks/use-window-resize";
import { useCallback, useEffect, useRef, useState } from "react";

interface WindowProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  defaultSize?: { width: number; height: number };
  minSize?: { width: number; height: number };
  children: React.ReactNode;
}

export function Window({
  title,
  isOpen,
  onClose,
  defaultSize = { width: 900, height: 600 },
  minSize = { width: 500, height: 400 },
  children,
}: WindowProps): React.ReactElement | null {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const positionRef = useRef(position);
  const initializedRef = useRef(false);

  // Keep ref in sync with state
  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  // Center window on first open
  useEffect(() => {
    if (isOpen && !initializedRef.current) {
      const x = Math.max(0, (window.innerWidth - defaultSize.width) / 2);
      const y = Math.max(60, (window.innerHeight - defaultSize.height) / 2);
      setPosition({ x, y });
      initializedRef.current = true;
    }
  }, [isOpen, defaultSize.width, defaultSize.height]);

  // Handle visibility animation
  useEffect(() => {
    if (isOpen) {
      // Small delay to trigger CSS transition
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  const handlePositionChange = useCallback(
    (delta: { x: number; y: number }) => {
      setPosition((prev) => ({
        x: prev.x + delta.x,
        y: prev.y + delta.y,
      }));
    },
    []
  );

  const { isDragging } = useWindowDrag({
    initialPosition: position,
  });

  // Sync drag position back to our state
  const handleDragMouseDown = useCallback((e: React.MouseEvent) => {
    const startX = e.clientX - positionRef.current.x;
    const startY = e.clientY - positionRef.current.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newX = moveEvent.clientX - startX;
      const newY = moveEvent.clientY - startY;

      // Keep window within viewport bounds
      const minY = 40;
      const maxY = window.innerHeight - 100;
      const minX = -200;
      const maxX = window.innerWidth - 200;

      setPosition({
        x: Math.max(minX, Math.min(maxX, newX)),
        y: Math.max(minY, Math.min(maxY, newY)),
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = "grabbing";
    document.body.style.userSelect = "none";

    e.preventDefault();
  }, []);

  const { size, isResizing, handleResizeStart } = useWindowResize({
    initialSize: defaultSize,
    minSize,
    onPositionChange: handlePositionChange,
  });

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={`fixed z-30 overflow-hidden rounded-xl bg-[#1e1e1e] shadow-2xl transition-opacity duration-200 ${
        isVisible ? "opacity-100" : "opacity-0"
      } ${isDragging || isResizing ? "select-none" : ""}`}
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
      }}
    >
      {/* Title bar */}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: Custom window drag handle */}
      {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: Custom window drag handle */}
      <div
        className="relative flex h-12 cursor-grab items-center bg-[#2a2a2a] px-4 active:cursor-grabbing"
        onMouseDown={handleDragMouseDown}
      >
        {/* Traffic light buttons */}
        <div className="absolute left-4 flex gap-2">
          <button
            aria-label="Close window"
            className="group size-3 rounded-full bg-[#FF5F56] transition-colors hover:bg-[#ff7b73]"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            type="button"
          >
            <span className="flex size-full items-center justify-center text-[8px] text-black/60 opacity-0 group-hover:opacity-100">
              ×
            </span>
          </button>
          <div className="size-3 rounded-full bg-[#FFBD2E]" />
          <div className="size-3 rounded-full bg-[#27C93F]" />
        </div>

        {/* Title */}
        <div className="flex-1 text-center">
          <span className="font-medium text-sm text-white/80">{title}</span>
        </div>
      </div>

      {/* Content */}
      <div className="h-[calc(100%-3rem)] overflow-hidden">{children}</div>

      {/* Resize handles */}
      {/* Right edge */}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: Custom window resize handle */}
      {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: Custom window resize handle */}
      <div
        className="absolute top-12 right-0 bottom-0 w-1 cursor-ew-resize"
        onMouseDown={handleResizeStart("e")}
      />
      {/* Bottom edge */}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: Custom window resize handle */}
      {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: Custom window resize handle */}
      <div
        className="absolute right-0 bottom-0 left-0 h-1 cursor-ns-resize"
        onMouseDown={handleResizeStart("s")}
      />
      {/* Bottom-right corner */}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: Custom window resize handle */}
      {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: Custom window resize handle */}
      <div
        className="absolute right-0 bottom-0 size-4 cursor-nwse-resize"
        onMouseDown={handleResizeStart("se")}
      />
      {/* Left edge */}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: Custom window resize handle */}
      {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: Custom window resize handle */}
      <div
        className="absolute top-12 bottom-0 left-0 w-1 cursor-ew-resize"
        onMouseDown={handleResizeStart("w")}
      />
      {/* Top edge (below title bar) */}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: Custom window resize handle */}
      {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: Custom window resize handle */}
      <div
        className="absolute top-12 right-0 left-0 h-1 cursor-ns-resize"
        onMouseDown={handleResizeStart("n")}
      />
      {/* Top-left corner */}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: Custom window resize handle */}
      {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: Custom window resize handle */}
      <div
        className="absolute top-12 left-0 size-4 cursor-nwse-resize"
        onMouseDown={handleResizeStart("nw")}
      />
      {/* Top-right corner */}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: Custom window resize handle */}
      {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: Custom window resize handle */}
      <div
        className="absolute top-12 right-0 size-4 cursor-nesw-resize"
        onMouseDown={handleResizeStart("ne")}
      />
      {/* Bottom-left corner */}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: Custom window resize handle */}
      {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: Custom window resize handle */}
      <div
        className="absolute bottom-0 left-0 size-4 cursor-nesw-resize"
        onMouseDown={handleResizeStart("sw")}
      />
    </div>
  );
}
