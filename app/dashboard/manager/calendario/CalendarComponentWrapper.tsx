// app/dashboard/manager/calendario/CalendarComponentWrapper.tsx

'use client'

import { useSession } from "next-auth/react"
import CalendarComponent from '@/components/generales/calendar'

const CalendarComponentWrapper = () => {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (status === "unauthenticated") {
    return <div>Access Denied</div>
  }

  return <CalendarComponent session={session} />
}

export default CalendarComponentWrapper