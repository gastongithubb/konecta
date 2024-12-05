"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { useTheme } from 'next-themes'

import { cn } from "@/app/lib/utils"

interface ProgressProps extends
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  variant?: "default" | "secondary"
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, variant = "default", ...props }, ref) => {
  const { theme } = useTheme()

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full",
        variant === "default" && "bg-blue-500/20 dark:bg-blue-500/10",
        variant === "secondary" && "bg-gray-200 dark:bg-gray-800",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          "h-full w-full flex-1 transition-all",
          variant === "default" && "bg-blue-500 dark:bg-blue-400",
          variant === "secondary" && "bg-gray-500 dark:bg-gray-400"
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }