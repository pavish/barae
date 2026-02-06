import type { Session } from '@/lib/auth'
import { TopNav } from '@/components/layout/TopNav'
import { UserMenu } from '@/components/layout/UserMenu'

interface HeaderProps {
  session: Session
}

export function Header({ session }: HeaderProps) {
  return (
    <>
      {/* Desktop header */}
      <header className="hidden md:flex h-16 items-center justify-between border-b px-6">
        <div className="flex items-center gap-6">
          <span className="text-lg font-bold tracking-tight">Barae</span>
          <TopNav />
        </div>
        <UserMenu session={session} />
      </header>

      {/* Mobile header */}
      <header className="flex md:hidden h-14 items-center justify-between border-b px-4">
        <span className="text-base font-bold tracking-tight">Barae</span>
        <UserMenu session={session} />
      </header>
    </>
  )
}
