"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"
import { useTheme } from 'next-themes'

import { cn } from "@/app/lib/utils"

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
  {
    variants: {
      variant: {
        default: "text-gray-900 dark:text-gray-100",
        secondary: "text-gray-500 dark:text-gray-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface LabelProps extends
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>,
  VariantProps<typeof labelVariants> {
  variant?: "default" | "secondary"
}

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  LabelProps
>(({ className, variant, ...props }, ref) => {
  const { theme } = useTheme()

  return (
    <LabelPrimitive.Root
      ref={ref}
      className={cn(labelVariants({ variant }), className)}
      data-theme={theme}
      {...props}
    />
  )
})
Label.displayName = LabelPrimitive.Root.displayName

export { Label }