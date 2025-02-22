import { useEffect, useState } from "react";

const formatOptions: Record<string, Intl.DateTimeFormatOptions> = {
  short: {
    hour: "numeric",
    minute: "numeric",
  },
  medium: {
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
  },
  full: {
    dateStyle: "full",
    timeStyle: "full",
  },
};

export default function DateTime() {
  const [time, setTime] = useState(new Date());
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0,
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearInterval(timer);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const getFormat = () => {
    if (windowWidth < 640) return formatOptions.short;
    if (windowWidth < 768) return formatOptions.medium;
    return formatOptions.full;
  };

  return (
    <span className="text-sm sm:text-base">
      {time.toLocaleString("en-US", getFormat())}
    </span>
  );
}
