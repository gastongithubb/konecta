"use client"

import * as React from "react"
import { useTheme } from 'next-themes'

import { cn } from "@/app/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[60px] w-full rounded-md",
          "border border-slate-200 dark:border-slate-800",
          "bg-transparent",
          "px-3 py-2 text-sm",
          "text-slate-900 dark:text-slate-100",
          "shadow-sm",
          "placeholder:text-slate-500 dark:placeholder:text-slate-400",
          "focus-visible:outline-none",
          "focus-visible:ring-1",
          "focus-visible:ring-slate-400 dark:focus-visible:ring-slate-800",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }