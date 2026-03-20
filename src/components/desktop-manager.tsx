import {
  createDesktopApps,
  isWindowDesktopApp,
} from "@components/desktop-apps";
import Dock from "@components/dock.tsx";
import type { BlogPost } from "@components/notes-app";
import { Window } from "@components/window";
import { useIsMobile } from "@hooks/use-is-mobile";
import type React from "react";
import { useCallback, useMemo, useState } from "react";

interface Props {
  posts: BlogPost[];
}

export function DesktopManager({ posts }: Props): React.ReactElement {
  const apps = useMemo(() => createDesktopApps(posts), [posts]);
  const windowApps = useMemo(() => apps.filter(isWindowDesktopApp), [apps]);
  const isMobile = useIsMobile();
  const [visibleStack, setVisibleStack] = useState<string[]>(() =>
    createDesktopApps(posts)
      .filter(isWindowDesktopApp)
      .filter((app) => app.initialOpen)
      .map((app) => app.id)
  );
  const openWindowIds = useMemo(() => new Set(visibleStack), [visibleStack]);

  const activeAppId = visibleStack.at(-1) ?? null;

  const closeApp = useCallback((appId: string) => {
    setVisibleStack((prev) => prev.filter((id) => id !== appId));
  }, []);

  const focusApp = useCallback((appId: string) => {
    setVisibleStack((prev) => {
      if (!prev.includes(appId)) {
        return prev;
      }

      return [...prev.filter((id) => id !== appId), appId];
    });
  }, []);

  const toggleApp = useCallback((appId: string) => {
    setVisibleStack((prev) => {
      if (prev.includes(appId)) {
        return prev.filter((id) => id !== appId);
      }

      return [...prev, appId];
    });
  }, []);

  return (
    <>
      <div
        className={`fixed inset-x-0 z-20 ${
          isMobile
            ? "top-10 bottom-24 px-2"
            : "top-20 bottom-30 px-2 sm:px-6 md:px-8"
        }`}
      >
        {windowApps.map((app) => {
          const isOpen = openWindowIds.has(app.id);
          const isActive = activeAppId === app.id;
          const zIndex = isOpen ? 20 + visibleStack.indexOf(app.id) : 10;

          // On mobile, only render the active window
          const mobileVisible = isMobile ? isOpen && isActive : isOpen;

          return (
            <Window
              defaultSize={app.defaultSize}
              isActive={isActive}
              isMobile={isMobile}
              isOpen={mobileVisible}
              key={app.id}
              minSize={app.minSize}
              onClose={() => closeApp(app.id)}
              onFocus={() => focusApp(app.id)}
              title={app.title}
              zIndex={zIndex}
            >
              {app.renderContent({ isActive })}
            </Window>
          );
        })}
      </div>

      <Dock
        activeWindowId={activeAppId}
        apps={apps}
        onWindowAppToggle={toggleApp}
        openWindowIds={openWindowIds}
      />
    </>
  );
}
