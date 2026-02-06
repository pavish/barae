import type { ReactNode } from 'react'
import type { Session } from '@/lib/auth'
import { Header } from '@/components/layout/Header'
import { BottomTabs } from '@/components/layout/BottomTabs'
import { useSessionPolling } from '@/hooks/useSessionPolling'
import { useAuthExpiry } from '@/hooks/useAuthExpiry'

interface DashboardShellProps {
  children: ReactNode
  session: Session
}

export function DashboardShell({ children, session }: DashboardShellProps) {
  useSessionPolling()
  useAuthExpiry()

  return (
    <div className="min-h-screen flex flex-col">
      <Header session={session} />
      <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">{children}</main>
      <BottomTabs />
    </div>
  )
}
