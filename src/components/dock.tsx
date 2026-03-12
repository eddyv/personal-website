import type { DesktopApp } from "@components/desktop-apps";
import { isWindowDesktopApp } from "@components/desktop-apps";
import type React from "react";

interface Props {
  activeWindowId: string | null;
  apps: DesktopApp[];
  onWindowAppToggle: (appId: string) => void;
  openWindowIds: Set<string>;
}

export default function Dock({
  activeWindowId,
  apps,
  onWindowAppToggle,
  openWindowIds,
}: Props): React.ReactElement {
  return (
    <div className="fixed bottom-0 left-1/2 z-50 -translate-x-1/2 pb-4">
      <div className="flex items-end gap-2 rounded-2xl bg-white/10 px-2 pt-2 pb-2 backdrop-blur-2xl">
        {apps.map((app) => {
          const Icon = app.icon;
          const appIsOpen = isWindowDesktopApp(app)
            ? openWindowIds.has(app.id)
            : false;
          const isActive = isWindowDesktopApp(app)
            ? activeWindowId === app.id
            : false;
          let indicatorClassName =
            "bg-white/50 opacity-0 group-hover:opacity-100";

          if (appIsOpen) {
            indicatorClassName = isActive ? "bg-white" : "bg-white/70";
          }

          const content = (
            <>
              <div className="relative pb-2">
                <div
                  className={`flex items-center justify-center overflow-hidden rounded-xl shadow-lg transition-all duration-150 group-hover:scale-105 ${
                    app.noBorder ? "size-12" : "size-12 p-2"
                  } ${app.dockBgClassName} ${app.iconClassName}`}
                >
                  <div className={app.noBorder ? "size-full" : "size-8"}>
                    <Icon aria-hidden="true" className="size-full" />
                  </div>
                </div>
                <div
                  className={`absolute bottom-0 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full transition-opacity ${indicatorClassName}`}
                />
              </div>
              <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded-md bg-black/80 px-2 py-1 text-white text-xs opacity-0 transition-opacity group-hover:opacity-100">
                {app.name}
              </span>
            </>
          );

          if (isWindowDesktopApp(app)) {
            return (
              <button
                className="group relative transition-all duration-150 ease-in-out hover:-translate-y-2"
                key={app.id}
                onClick={() => onWindowAppToggle(app.id)}
                type="button"
              >
                {content}
              </button>
            );
          }

          return (
            <a
              className="group relative transition-all duration-150 ease-in-out hover:-translate-y-2"
              href={app.href}
              key={app.id}
              rel={app.newWindow ? "noopener noreferrer" : undefined}
              target={app.newWindow ? "_blank" : undefined}
            >
              {content}
            </a>
          );
        })}
      </div>
    </div>
  );
}
