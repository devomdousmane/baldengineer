"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-9 h-9" aria-hidden="true" />;

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300 cursor-pointer"
      style={{
        backgroundColor: "var(--color-accent-dim)",
        color: "var(--color-accent-hi)",
        border: "1px solid var(--color-border)",
      }}
      aria-label={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
    >
      {isDark ? (
        <Sun className="w-3.5 h-3.5" strokeWidth={1.5} />
      ) : (
        <Moon className="w-3.5 h-3.5" strokeWidth={1.5} />
      )}
    </button>
  );
}
