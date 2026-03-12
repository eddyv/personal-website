import type { BlogPost } from "@components/notes-app";
import { NotesApp } from "@components/notes-app";
import Terminal from "@components/terminal";
import GhosttyIcon from "@icons/ghostty.svg?react";
import GitHubIcon from "@icons/github.svg?react";
import LinkedInIcon from "@icons/linkedin.svg?react";
import MailIcon from "@icons/mail.svg?react";
import NotesIcon from "@icons/notes.svg?react";
import ResumeIcon from "@icons/resume.svg?react";
import type React from "react";

interface WindowSize {
  width: number;
  height: number;
}

interface BaseDesktopApp {
  id: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  iconClassName: string;
  name: string;
  noBorder?: boolean;
  dockBgClassName: string;
}

export interface WindowDesktopApp extends BaseDesktopApp {
  defaultSize: WindowSize;
  initialOpen?: boolean;
  kind: "window";
  minSize: WindowSize;
  renderContent: (options: { isActive: boolean }) => React.ReactNode;
  title: string;
}

export interface LinkDesktopApp extends BaseDesktopApp {
  href: string;
  kind: "link";
  newWindow?: boolean;
}

export type DesktopApp = LinkDesktopApp | WindowDesktopApp;

export function isWindowDesktopApp(app: DesktopApp): app is WindowDesktopApp {
  return app.kind === "window";
}

export function createDesktopApps(posts: BlogPost[]): DesktopApp[] {
  return [
    {
      dockBgClassName: "bg-[#FF0000]",
      href: "https://raw.githubusercontent.com/eddyv/awesome_cv/main/cv.pdf",
      icon: ResumeIcon,
      iconClassName: "text-white",
      id: "resume",
      kind: "link",
      name: "Resume",
    },
    {
      dockBgClassName: "bg-gradient-to-b from-[#2175F5] to-[#3C95FF]",
      href: "mailto:vaismanedward@gmail.com",
      icon: MailIcon,
      iconClassName: "text-white",
      id: "mail",
      kind: "link",
      name: "Mail",
      newWindow: true,
    },
    {
      dockBgClassName: "bg-[#24292f]",
      href: "https://github.com/eddyv",
      icon: GitHubIcon,
      iconClassName: "text-white",
      id: "github",
      kind: "link",
      name: "GitHub",
      newWindow: true,
    },
    {
      dockBgClassName: "bg-gradient-to-b from-[#3C95FF] to-[#2175F5]",
      href: "https://www.linkedin.com/in/edwardvaisman/",
      icon: LinkedInIcon,
      iconClassName: "text-white",
      id: "linkedin",
      kind: "link",
      name: "LinkedIn",
      newWindow: true,
    },
    {
      defaultSize: { width: 900, height: 600 },
      dockBgClassName: "bg-transparent",
      icon: NotesIcon,
      iconClassName: "text-white",
      id: "notes",
      kind: "window",
      minSize: { width: 600, height: 400 },
      name: "Notes",
      noBorder: true,
      renderContent: () => <NotesApp posts={posts} />,
      title: "Notes",
    },
    {
      defaultSize: { width: 960, height: 640 },
      dockBgClassName: "bg-transparent",
      icon: GhosttyIcon,
      iconClassName: "text-white",
      id: "terminal",
      initialOpen: true,
      kind: "window",
      minSize: { width: 560, height: 420 },
      name: "Ghostty Terminal",
      noBorder: true,
      renderContent: ({ isActive }) => <Terminal isActive={isActive} />,
      title: "Ghostty Terminal - edwardvaisman.ca",
    },
  ];
}
