const API_BASE = '/api'

export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    credentials: 'include',
    ...options,
  })

  if (response.status === 401) {
    window.dispatchEvent(new CustomEvent('auth:expired'))
    throw new Error('Session expired')
  }

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: response.statusText }))
    throw new Error(
      (error as { message?: string }).message ??
        `API error: ${response.status}`,
    )
  }

  return response.json() as Promise<T>
}
