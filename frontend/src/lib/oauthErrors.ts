const userActionableErrors: Record<string, string> = {
  access_denied:
    'GitHub authorization was cancelled. You can try again whenever you\'re ready.',
  email_not_found:
    'Could not retrieve your email from GitHub. Please ensure your GitHub email is set to public or grant email access to the app, and try again.',
  account_not_linked:
    'An account with this email already exists. Please sign in with your email and password, then link GitHub from settings.',
  account_already_linked_to_different_user:
    'This GitHub account is already linked to another Barae account.',
}

const serverErrors = new Set([
  'unable_to_get_user_info',
  'internal_server_error',
])

const retryErrors = new Set([
  'invalid_code',
  'state_mismatch',
  'no_code',
  'please_restart_the_process',
  'no_callback_url',
  'unable_to_link_account',
  'unable_to_create_user',
  'unable_to_create_session',
])

export function getOAuthErrorMessage(errorCode: string): string {
  const actionable = userActionableErrors[errorCode]
  if (actionable) return actionable

  if (serverErrors.has(errorCode)) {
    return 'Could not reach GitHub. Please try again later.'
  }

  if (retryErrors.has(errorCode)) {
    return 'Authentication failed. Please try again.'
  }

  return 'Something went wrong during GitHub sign-in. Please try again.'
}
