import { useEffect, useState } from "react";

const ThemeToggle = () => {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    const theme = darkMode ? "dark" : "light";

    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [darkMode]);

  return (
    <button
      type="button"
      className="theme-toggle-btn"
      onClick={() => setDarkMode((previous) => !previous)}
    >
      {darkMode ? "☀ Light" : "🌙 Dark"}
    </button>
  );
};

export default ThemeToggle;