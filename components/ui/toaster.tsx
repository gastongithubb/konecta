"use client"

import { useToast } from "@/hooks/use-toast"
import { useTheme } from 'next-themes'
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

import { cn } from "@/app/lib/utils"

export function Toaster() {
  const { toasts } = useToast()
  const { theme } = useTheme()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className={cn(
              "grid gap-1",
              "text-slate-900 dark:text-slate-100"
            )}>
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}