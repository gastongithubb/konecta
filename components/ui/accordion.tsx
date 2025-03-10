"use client"

import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDownIcon } from "@radix-ui/react-icons"
import { useTheme } from "next-themes"
import { cn } from "@/app/lib/utils"

const Accordion = AccordionPrimitive.Root

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => {
  const { theme } = useTheme()
  return (
    <AccordionPrimitive.Item
      ref={ref}
      className={cn(
        theme === "dark" ? "border-b border-gray-700" : "border-b border-gray-200",
        className
      )}
      {...props}
    />
  )
})
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => {
  const { theme } = useTheme()
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        ref={ref}
        className={cn(
          "flex flex-1 items-center justify-between py-4 text-sm font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
          theme === "dark" ? [
            "text-gray-100",
            "hover:text-gray-300"
          ] : [
            "text-gray-900",
            "hover:text-gray-600"
          ],
          className
        )}
        {...props}
      >
        {children}
        <ChevronDownIcon 
          className={cn(
            "h-4 w-4 shrink-0 transition-transform duration-200",
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          )} 
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
})
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  const { theme } = useTheme()
  return (
    <AccordionPrimitive.Content
      ref={ref}
      className={cn(
        "overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
        theme === "dark" ? "text-gray-300" : "text-gray-600"
      )}
      {...props}
    >
      <div className={cn("pb-4 pt-0", className)}>{children}</div>
    </AccordionPrimitive.Content>
  )
})
AccordionContent.displayName = AccordionPrimitive.Content.displayName

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }