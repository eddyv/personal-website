import { useEffect, useState } from "react";

export const LoadingDots: React.FC = () => {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : `${prev}.`));
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <span className="inline-block min-w-6 text-white/90">{dots || "."}</span>
  );
};
