import GhosttyIcon from "@icons/ghostty.svg?react";
import GitHubIcon from "@icons/github.svg?react";
import LinkedInIcon from "@icons/linkedin.svg?react";
import MailIcon from "@icons/mail.svg?react";
import NotesIcon from "@icons/notes.svg?react";
import ResumeIcon from "@icons/resume.svg?react";
import type React from "react";

type AppId = "notes" | "terminal";

interface AppButtonConfig {
  appId?: AppId;
  bgClassName: string;
  href?: string;
  icon: React.ReactNode;
  iconClassName: string;
  name: string;
  newWindow?: boolean;
  noBorder?: boolean;
}

interface Props {
  activeAppId: AppId | null;
  isOpen: (appId: AppId) => boolean;
  onAppClick: (appId: AppId) => void;
}

const apps: AppButtonConfig[] = [
  {
    bgClassName: "bg-[#FF0000]",
    href: "https://raw.githubusercontent.com/eddyv/awesome_cv/main/cv.pdf",
    icon: <ResumeIcon aria-hidden="true" className="size-full" />,
    iconClassName: "text-white",
    name: "Resume",
  },
  {
    bgClassName: "bg-gradient-to-b from-[#2175F5] to-[#3C95FF]",
    href: "mailto:vaismanedward@gmail.com",
    icon: <MailIcon aria-hidden="true" className="size-full" />,
    iconClassName: "text-white",
    name: "Mail",
    newWindow: true,
  },
  {
    bgClassName: "bg-[#24292f]",
    href: "https://github.com/eddyv",
    icon: <GitHubIcon aria-hidden="true" className="size-full" />,
    iconClassName: "text-white",
    name: "GitHub",
    newWindow: true,
  },
  {
    bgClassName: "bg-gradient-to-b from-[#3C95FF] to-[#2175F5]",
    href: "https://www.linkedin.com/in/edwardvaisman/",
    icon: <LinkedInIcon aria-hidden="true" className="size-full" />,
    iconClassName: "text-white",
    name: "LinkedIn",
    newWindow: true,
  },
  {
    appId: "notes",
    bgClassName: "bg-transparent",
    icon: <NotesIcon aria-hidden="true" className="size-full" />,
    iconClassName: "text-white",
    name: "Notes",
    noBorder: true,
  },
  {
    appId: "terminal",
    bgClassName: "bg-transparent",
    icon: <GhosttyIcon aria-hidden="true" className="size-full" />,
    iconClassName: "text-white",
    name: "Ghostty Terminal",
    noBorder: true,
  },
];

export default function Dock({
  activeAppId,
  isOpen,
  onAppClick,
}: Props): React.ReactElement {
  return (
    <div className="fixed bottom-0 left-1/2 z-50 -translate-x-1/2 pb-4">
      <div className="flex items-end gap-2 rounded-2xl bg-white/10 px-2 pt-2 pb-2 backdrop-blur-2xl">
        {apps.map((app) => {
          const appIsOpen = app.appId ? isOpen(app.appId) : false;
          const isActive = app.appId ? activeAppId === app.appId : false;
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
                  } ${app.bgClassName} ${app.iconClassName}`}
                >
                  <div className={app.noBorder ? "size-full" : "size-8"}>
                    {app.icon}
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

          if (app.appId) {
            return (
              <button
                className="group relative transition-all duration-150 ease-in-out hover:-translate-y-2"
                key={app.name}
                onClick={() => onAppClick(app.appId as AppId)}
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
              key={app.name}
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
