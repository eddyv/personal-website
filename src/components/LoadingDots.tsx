import { useEffect, useState } from "react";

export const LoadingDots: React.FC = () => {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <span className="text-white/90 inline-block min-w-[24px]">
      {dots || "."}
    </span>
  );
};
