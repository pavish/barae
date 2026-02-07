import { useState } from 'react'
import { Github, Loader2 } from 'lucide-react'
import { authClient } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface GitHubSignInButtonProps {
  githubAvailable: boolean
  isLoadingProviders: boolean
  onError: (message: string) => void
}

export function GitHubSignInButton({
  githubAvailable,
  isLoadingProviders,
  onError,
}: GitHubSignInButtonProps) {
  const [isRedirecting, setIsRedirecting] = useState(false)

  const isDisabled = !githubAvailable || isLoadingProviders || isRedirecting

  async function handleClick() {
    setIsRedirecting(true)
    try {
      await authClient.signIn.social({
        provider: 'github',
        callbackURL: '/',
        errorCallbackURL: '/auth',
      })
    } catch {
      setIsRedirecting(false)
      onError(
        'Could not connect to the server. Please check your connection and try again.',
      )
    }
  }

  function renderContent() {
    if (isRedirecting) {
      return (
        <>
          <Loader2 className="animate-spin" />
          Connecting to GitHub...
        </>
      )
    }

    return (
      <>
        <Github />
        Continue with GitHub
        {!isLoadingProviders && !githubAvailable && (
          <Badge variant="secondary" className="ml-1 text-[10px]">
            Not available
          </Badge>
        )}
      </>
    )
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      disabled={isDisabled}
      onClick={handleClick}
    >
      {renderContent()}
    </Button>
  )
}
