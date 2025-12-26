import { type JSX, useEffect, useState } from "react";

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

/**
 * A React component that displays the current date and time with responsive formatting.
 * The format changes based on the window width:
 * - < 640px: short format
 * - < 768px: medium format
 * - ≥ 768px: full format
 *
 * The time updates every second and the component automatically adjusts to window resize events.
 *
 * @returns {JSX.Element} A span element containing the formatted date and time
 * @example
 * <DateTime />
 */
export default function DateTime(): JSX.Element {
  const [time, setTime] = useState(new Date());
  const [windowWidth, setWindowWidth] = useState(0); // Initialize with 0

  useEffect(() => {
    // Set initial window width in useEffect
    setWindowWidth(window.innerWidth);

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
    if (windowWidth < 640) {
      return formatOptions.short;
    }
    if (windowWidth < 768) {
      return formatOptions.medium;
    }
    return formatOptions.full;
  };

  return (
    <span className="text-sm sm:text-base">
      {time.toLocaleString("en-US", getFormat())}
    </span>
  );
}
