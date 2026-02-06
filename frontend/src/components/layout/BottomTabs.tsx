import { NavLink } from 'react-router-dom'
import { Home, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/settings', label: 'Settings', icon: Settings },
] as const

export function BottomTabs() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 border-t bg-background md:hidden">
      <div className="flex items-center justify-around pb-[env(safe-area-inset-bottom)]">
        {tabItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center gap-0.5 py-2 text-xs transition-colors',
                isActive
                  ? 'text-primary font-medium'
                  : 'text-muted-foreground',
              )
            }
          >
            <item.icon className="size-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
