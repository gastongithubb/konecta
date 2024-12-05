"use client"

import * as React from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons"
import { DayPicker } from "react-day-picker"
import { useTheme } from "next-themes"
import { cn } from "@/app/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: cn(
          "text-sm font-medium",
          isDark ? "text-gray-100" : "text-gray-900"
        ),
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
          isDark ? "text-gray-100 hover:bg-gray-800" : "text-gray-900 hover:bg-gray-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: cn(
          "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
          isDark ? "text-gray-400" : "text-gray-500"
        ),
        row: "flex w-full mt-2",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
          isDark ? "[&:has([aria-selected])]:bg-gray-700" : "[&:has([aria-selected])]:bg-gray-100",
          isDark ? "[&:has([aria-selected].day-outside)]:bg-gray-700/50" : "[&:has([aria-selected].day-outside)]:bg-gray-100/50",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            : "[&:has([aria-selected])]:rounded-md"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 p-0 font-normal aria-selected:opacity-100",
          isDark ? "text-gray-100" : "text-gray-900"
        ),
        day_range_start: "day-range-start",
        day_range_end: "day-range-end",
        day_selected: cn(
          isDark
            ? "bg-blue-500 text-white hover:bg-blue-600 focus:bg-blue-600"
            : "bg-blue-600 text-white hover:bg-blue-700 focus:bg-blue-700"
        ),
        day_today: cn(
          isDark
            ? "bg-gray-700 text-gray-100"
            : "bg-gray-100 text-gray-900"
        ),
        day_outside: cn(
          "day-outside opacity-50",
          isDark
            ? "text-gray-500 aria-selected:bg-gray-700/50 aria-selected:text-gray-400"
            : "text-gray-400 aria-selected:bg-gray-100/50 aria-selected:text-gray-500"
        ),
        day_disabled: cn(
          "text-muted-foreground opacity-50",
          isDark ? "text-gray-600" : "text-gray-400"
        ),
        day_range_middle: cn(
          isDark
            ? "aria-selected:bg-gray-700 aria-selected:text-gray-100"
            : "aria-selected:bg-gray-100 aria-selected:text-gray-900"
        ),
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeftIcon className={cn("h-4 w-4", isDark ? "text-gray-100" : "text-gray-900")} />,
        IconRight: ({ ...props }) => <ChevronRightIcon className={cn("h-4 w-4", isDark ? "text-gray-100" : "text-gray-900")} />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }