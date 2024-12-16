"use client";

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
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full hover:bg-blue-600 dark:hover:bg-blue-600 transition-all"
      >
        <Sun className="h-5 w-5 text-gray-400" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="rounded-full hover:bg-blue-600 dark:hover:bg-blue-600 transition-all"
    >
      {theme === "light" ? (
        <Moon className="h-5 w-5 text-gray-400" />
      ) : (
        <Sun className="h-5 w-5 text-gray-400" />
      )}
    </Button>
  );
}