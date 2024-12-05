"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { cn } from "@/app/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    const { theme } = useTheme()
    const isDark = theme === "dark"

    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md px-3 py-1 text-sm shadow-sm transition-colors",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "focus-visible:outline-none focus-visible:ring-1",
          "disabled:cursor-not-allowed disabled:opacity-50",
          isDark ? [
            "bg-gray-800",
            "border-gray-700",
            "text-gray-100",
            "placeholder:text-gray-500",
            "focus-visible:ring-gray-400",
            "file:text-gray-100",
            "hover:border-gray-600"
          ] : [
            "bg-white",
            "border-gray-200",
            "text-gray-900",
            "placeholder:text-gray-400",
            "focus-visible:ring-gray-300",
            "file:text-gray-700",
            "hover:border-gray-300"
          ],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }