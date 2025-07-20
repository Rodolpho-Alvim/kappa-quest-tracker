"use client";

import { Switch } from "@/components/ui/switch";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const isDark = theme === "dark";

  // Alterna entre light e dark
  const handleToggle = () => {
    setTheme(isDark ? "light" : "dark");
  };

  if (!mounted) return null;

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
        className="data-[state=checked]:bg-gray-700 data-[state=unchecked]:bg-yellow-500"
      />
      <Moon
        className={`h-5 w-5 ${
          isDark ? "text-gray-300" : "text-muted-foreground"
        }`}
      />
    </div>
  );
}
