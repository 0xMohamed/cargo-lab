import { createSignal, onMount } from "solid-js";

export function useTheme() {
  const [theme, setTheme] = createSignal("light");

  onMount(() => {
    const saved = localStorage.getItem("theme");
    if (saved) setTheme(saved);
    document.documentElement.classList.add(theme());
  });

  const toggleTheme = () => {
    const newTheme = theme() === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("theme", newTheme);
  };

  return [theme, toggleTheme] as const;
}
