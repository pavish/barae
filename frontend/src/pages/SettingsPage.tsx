import { authClient } from '@/lib/auth'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export function SettingsPage() {
  const { data: session } = authClient.useSession()

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your account and preferences.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Your account information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <p className="text-sm font-medium">Name</p>
            <p className="text-sm text-muted-foreground">
              {session?.user.name ?? '--'}
            </p>
          </div>
          <Separator />
          <div className="space-y-1">
            <p className="text-sm font-medium">Email</p>
            <p className="text-sm text-muted-foreground">
              {session?.user.email ?? '--'}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="opacity-60">
        <CardHeader>
          <div className="flex items-center gap-3">
            <CardTitle>GitHub Account</CardTitle>
            <Badge variant="secondary" className="text-xs">
              Coming soon
            </Badge>
          </div>
          <CardDescription>
            Connect your GitHub account to manage repositories and deploy sites.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
