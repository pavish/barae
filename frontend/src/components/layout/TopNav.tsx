import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/settings', label: 'Settings' },
] as const

export function TopNav() {
  return (
    <nav className="hidden md:flex items-center gap-1">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) =>
            cn(
              'px-3 py-1.5 rounded-md text-sm transition-colors',
              isActive
                ? 'font-medium text-foreground bg-accent'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/50',
            )
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
