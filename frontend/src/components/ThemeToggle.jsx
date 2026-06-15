import { useState, useEffect } from "react";
import { MoonIcon, SunIcon } from "lucide-react";

export function ThemeToggle() {
  // Default to night theme
  const [theme, setTheme] = useState("night");

  // On mount, read the saved theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("app-theme");
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    } else {
      // Check system preference
      const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
      const initialTheme = prefersLight ? "winter" : "night";
      setTheme(initialTheme);
      document.documentElement.setAttribute("data-theme", initialTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "night" ? "winter" : "night";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("app-theme", newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className="btn btn-ghost btn-circle btn-sm"
      aria-label="Toggle theme"
    >
      {theme === "night" ? (
        <SunIcon className="size-5 text-base-content/80 hover:text-base-content transition-colors" />
      ) : (
        <MoonIcon className="size-5 text-base-content/80 hover:text-base-content transition-colors" />
      )}
    </button>
  );
}
