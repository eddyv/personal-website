import { useWindowDrag } from "@hooks/use-window-drag";
import { useWindowResize } from "@hooks/use-window-resize";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

interface WindowProps {
  title: string;
  isOpen: boolean;
  isActive?: boolean;
  isMobile?: boolean;
  onClose: () => void;
  onFocus?: () => void;
  zIndex?: number;
  defaultSize?: { width: number; height: number };
  minSize?: { width: number; height: number };
  children: React.ReactNode;
}

export function Window({
  title,
  isOpen,
  isActive = false,
  isMobile = false,
  onClose,
  onFocus,
  zIndex = 30,
  defaultSize = { width: 900, height: 600 },
  minSize = { width: 500, height: 400 },
  children,
}: WindowProps): React.ReactElement | null {
  const [isVisible, setIsVisible] = useState(false);
  const initializedRef = useRef(false);
  const { handlePointerDown, isDragging, position, setPosition } =
    useWindowDrag();

  // Center window on first open (desktop only)
  useEffect(() => {
    if (isMobile || !isOpen || initializedRef.current) {
      return;
    }

    // Clamp default size to viewport
    const maxWidth = window.innerWidth - 48;
    const maxHeight = window.innerHeight - 160; // header + dock space
    const clampedWidth = Math.min(defaultSize.width, maxWidth);
    const clampedHeight = Math.min(defaultSize.height, maxHeight);

    const x = Math.max(0, (window.innerWidth - clampedWidth) / 2);
    const y = Math.max(60, (window.innerHeight - clampedHeight) / 2);
    setPosition({ x, y });
    initializedRef.current = true;
  }, [isOpen, isMobile, defaultSize.width, defaultSize.height, setPosition]);

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
    (nextPosition: { x: number; y: number }) => {
      setPosition(nextPosition);
    },
    [setPosition]
  );

  const handleDragPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (isMobile) {
        return;
      }
      onFocus?.();
      handlePointerDown(e);
    },
    [handlePointerDown, onFocus, isMobile]
  );

  const { size, isResizing, handleResizeStart } = useWindowResize({
    currentPosition: position,
    initialSize: defaultSize,
    minSize,
    onPositionChange: handlePositionChange,
  });

  const createResizePointerDownHandler = useCallback(
    (direction: "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw") =>
      (e: React.PointerEvent) => {
        onFocus?.();
        handleResizeStart(direction)(e);
      },
    [handleResizeStart, onFocus]
  );

  // Mobile: fullscreen mode
  if (isMobile) {
    return (
      <div
        aria-hidden={!isOpen}
        className={`absolute inset-0 overflow-hidden rounded-xl bg-[#1e1e1e] shadow-2xl transition-[opacity,transform,filter] duration-200 ${
          isVisible && isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        style={{ zIndex }}
      >
        {/* Title bar */}
        <div
          className={`relative flex h-12 items-center px-4 ${
            isActive ? "bg-[#2a2a2a]" : "bg-[#252525]"
          }`}
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
            <span
              className={`font-medium text-sm ${
                isActive ? "text-white/80" : "text-white/55"
              }`}
            >
              {title}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="h-[calc(100%-3rem)] overflow-hidden">{children}</div>
      </div>
    );
  }

  // Desktop: floating window mode
  return (
    <div
      aria-hidden={!isOpen}
      className={`fixed overflow-hidden rounded-xl bg-[#1e1e1e] shadow-2xl transition-[opacity,transform,filter] duration-200 ${
        isVisible && isOpen ? "opacity-100" : "pointer-events-none opacity-0"
      } ${isDragging || isResizing ? "select-none" : ""}`}
      onPointerDown={onFocus}
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        zIndex,
      }}
    >
      {/* Title bar */}
      <div
        className={`relative flex h-12 cursor-grab touch-none items-center px-4 active:cursor-grabbing ${
          isActive ? "bg-[#2a2a2a]" : "bg-[#252525]"
        }`}
        onPointerDown={handleDragPointerDown}
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
          <span
            className={`font-medium text-sm ${
              isActive ? "text-white/80" : "text-white/55"
            }`}
          >
            {title}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="h-[calc(100%-3rem)] overflow-hidden">{children}</div>

      {/* Resize handles */}
      {/* Right edge */}
      <div
        className="absolute top-12 right-0 bottom-0 w-1 cursor-ew-resize touch-none"
        onPointerDown={createResizePointerDownHandler("e")}
      />
      {/* Bottom edge */}
      <div
        className="absolute right-0 bottom-0 left-0 h-1 cursor-ns-resize touch-none"
        onPointerDown={createResizePointerDownHandler("s")}
      />
      {/* Bottom-right corner */}
      <div
        className="absolute right-0 bottom-0 size-4 cursor-nwse-resize touch-none"
        onPointerDown={createResizePointerDownHandler("se")}
      />
      {/* Left edge */}
      <div
        className="absolute top-12 bottom-0 left-0 w-1 cursor-ew-resize touch-none"
        onPointerDown={createResizePointerDownHandler("w")}
      />
      {/* Top edge (below title bar) */}
      <div
        className="absolute top-12 right-0 left-0 h-1 cursor-ns-resize touch-none"
        onPointerDown={createResizePointerDownHandler("n")}
      />
      {/* Top-left corner */}
      <div
        className="absolute top-12 left-0 size-4 cursor-nwse-resize touch-none"
        onPointerDown={createResizePointerDownHandler("nw")}
      />
      {/* Top-right corner */}
      <div
        className="absolute top-12 right-0 size-4 cursor-nesw-resize touch-none"
        onPointerDown={createResizePointerDownHandler("ne")}
      />
      {/* Bottom-left corner */}
      <div
        className="absolute bottom-0 left-0 size-4 cursor-nesw-resize touch-none"
        onPointerDown={createResizePointerDownHandler("sw")}
      />
    </div>
  );
}
