'use client';

import * as React from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PropsWithChildren {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: PropsWithChildren) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
    >
      {children}
    </NextThemesProvider>
  );
}

export const ThemeToggle = () => {
  const [mounted, setMounted] = React.useState(false);
  const { theme, setTheme } = useTheme();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="rounded-full hover:bg-blue-600 dark:hover:bg-blue-600 transition-all"
    >
      {theme === "light" ? (
        <Moon className="h-5 w-5 text-white dark:text-gray-400" />
      ) : (
        <Sun className="h-5 w-5 text-white dark:text-gray-300" />
      )}
    </Button>
  );
};