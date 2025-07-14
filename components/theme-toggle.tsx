"use client";

import { Switch } from "@/components/ui/switch";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  // Alterna entre light e dark
  const handleToggle = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <div className="flex items-center gap-2">
      <Sun
        className={`h-5 w-5 ${
          !isDark ? "text-yellow-500" : "text-muted-foreground"
        }`}
      />
      <Switch
        checked={isDark}
        onCheckedChange={handleToggle}
        aria-label="Alternar tema"
        className="data-[state=checked]:bg-blue-900 data-[state=unchecked]:bg-yellow-400"
      />
      <Moon
        className={`h-5 w-5 ${
          isDark ? "text-blue-400" : "text-muted-foreground"
        }`}
      />
    </div>
  );
}
