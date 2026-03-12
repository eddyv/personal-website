import Dock from "@components/dock.tsx";
import type { BlogPost } from "@components/notes-app";
import { NotesApp } from "@components/notes-app";
import Terminal from "@components/terminal";
import { Window } from "@components/window";
import type React from "react";
import { useCallback, useMemo, useState } from "react";

type AppId = "notes" | "terminal";

interface Props {
  posts: BlogPost[];
}

interface WindowConfig {
  defaultSize: { width: number; height: number };
  minSize: { width: number; height: number };
  title: string;
}

const initialVisibleStack: AppId[] = ["terminal"];

const windowConfigs: Record<AppId, WindowConfig> = {
  notes: {
    defaultSize: { width: 900, height: 600 },
    minSize: { width: 600, height: 400 },
    title: "Notes",
  },
  terminal: {
    defaultSize: { width: 960, height: 640 },
    minSize: { width: 560, height: 420 },
    title: "Ghostty Terminal - edwardvaisman.ca",
  },
};

export function DesktopManager({ posts }: Props): React.ReactElement {
  const [visibleStack, setVisibleStack] =
    useState<AppId[]>(initialVisibleStack);

  const activeAppId = visibleStack.at(-1) ?? null;

  const closeApp = useCallback((appId: AppId) => {
    setVisibleStack((prev) => prev.filter((id) => id !== appId));
  }, []);

  const focusApp = useCallback((appId: AppId) => {
    setVisibleStack((prev) => {
      if (!prev.includes(appId)) {
        return prev;
      }

      return [...prev.filter((id) => id !== appId), appId];
    });
  }, []);

  const toggleApp = useCallback((appId: AppId) => {
    setVisibleStack((prev) => {
      if (prev.includes(appId)) {
        return prev.filter((id) => id !== appId);
      }

      return [...prev, appId];
    });
  }, []);

  const appState = useMemo(
    () => ({
      notes: {
        isActive: activeAppId === "notes",
        isOpen: visibleStack.includes("notes"),
        zIndex: visibleStack.includes("notes")
          ? 20 + visibleStack.indexOf("notes")
          : 10,
      },
      terminal: {
        isActive: activeAppId === "terminal",
        isOpen: visibleStack.includes("terminal"),
        zIndex: visibleStack.includes("terminal")
          ? 20 + visibleStack.indexOf("terminal")
          : 10,
      },
    }),
    [activeAppId, visibleStack]
  );

  return (
    <>
      <div className="fixed inset-x-0 top-20 bottom-30 z-20 px-2 sm:px-6 md:px-8">
        <Window
          defaultSize={windowConfigs.terminal.defaultSize}
          isActive={appState.terminal.isActive}
          isOpen={appState.terminal.isOpen}
          minSize={windowConfigs.terminal.minSize}
          onClose={() => closeApp("terminal")}
          onFocus={() => focusApp("terminal")}
          title={windowConfigs.terminal.title}
          zIndex={appState.terminal.zIndex}
        >
          <Terminal isActive={appState.terminal.isActive} />
        </Window>

        <Window
          defaultSize={windowConfigs.notes.defaultSize}
          isActive={appState.notes.isActive}
          isOpen={appState.notes.isOpen}
          minSize={windowConfigs.notes.minSize}
          onClose={() => closeApp("notes")}
          onFocus={() => focusApp("notes")}
          title={windowConfigs.notes.title}
          zIndex={appState.notes.zIndex}
        >
          <NotesApp posts={posts} />
        </Window>
      </div>

      <Dock
        activeAppId={activeAppId}
        isOpen={(appId) => visibleStack.includes(appId)}
        onAppClick={toggleApp}
      />
    </>
  );
}
