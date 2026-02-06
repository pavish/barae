import { useNavigate } from 'react-router-dom'
import { LogOut, Settings } from 'lucide-react'
import { authClient, type Session } from '@/lib/auth'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface UserMenuProps {
  session: Session
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]
  if (!first) return '?'
  if (parts.length === 1) return first[0]?.toUpperCase() ?? '?'
  const last = parts[parts.length - 1]
  return `${first[0]?.toUpperCase() ?? ''}${last?.[0]?.toUpperCase() ?? ''}`
}

export function UserMenu({ session }: UserMenuProps) {
  const navigate = useNavigate()

  async function handleSignOut() {
    await authClient.signOut()
    navigate('/auth')
  }

  const userName = session.user.name
  const userEmail = session.user.email
  const initials = getInitials(userName)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Avatar size="default">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium leading-none">{userName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {userEmail}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => navigate('/settings')}>
          <Settings />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => void handleSignOut()}>
          <LogOut />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
