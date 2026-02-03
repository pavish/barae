import { Link } from 'react-router-dom'
import { ThemeToggle } from '../../../shared/components'
import { UserMenu } from './UserMenu'

interface HeaderProps {
  onMobileMenuToggle?: () => void
}

export function Header({ onMobileMenuToggle }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 border-b border-[var(--color-border)] bg-[var(--color-background)]">
      <div className="flex h-full items-center justify-between px-4">
        {/* Left: Logo and mobile menu toggle */}
        <div className="flex items-center gap-3">
          {/* Mobile menu toggle - visible on md and below */}
          <button
            onClick={onMobileMenuToggle}
            className="rounded-md p-2 text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] md:hidden"
            aria-label="Toggle menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Logo */}
          <Link
            to="/dashboard"
            className="text-xl font-bold text-[var(--color-foreground)]"
          >
            Barae
          </Link>
        </div>

        {/* Center: Search bar - hidden on small screens */}
        <div className="hidden flex-1 max-w-md mx-8 lg:block">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg
                className="h-4 w-4 text-[var(--color-muted-foreground)]"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="search"
              placeholder="Search... (Coming soon)"
              disabled
              className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-muted)] py-2 pl-10 pr-4 text-sm text-[var(--color-muted-foreground)] placeholder-[var(--color-muted-foreground)] cursor-not-allowed opacity-60"
              title="Search functionality coming soon"
            />
          </div>
        </div>

        {/* Right: Theme toggle and user menu */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
