"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { CheckIcon } from "@radix-ui/react-icons"
import { useTheme } from "next-themes"
import { cn } from "@/app/lib/utils"

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  return (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        "peer h-4 w-4 shrink-0 rounded-sm border shadow focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50",
        isDark ? [
          "border-gray-600",
          "focus-visible:ring-gray-500",
          "data-[state=checked]:bg-blue-500",
          "data-[state=checked]:text-white",
          "hover:border-gray-500"
        ] : [
          "border-gray-300",
          "focus-visible:ring-blue-500",
          "data-[state=checked]:bg-blue-600",
          "data-[state=checked]:text-white",
          "hover:border-gray-400"
        ],
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className={cn(
          "flex items-center justify-center text-current",
          isDark ? "text-gray-100" : "text-white"
        )}
      >
        <CheckIcon className="h-4 w-4" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
})
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }