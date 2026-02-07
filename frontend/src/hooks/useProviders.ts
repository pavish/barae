import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'

interface ProvidersResponse {
  github: boolean
}

export function useProviders() {
  const { data, isLoading } = useQuery({
    queryKey: ['auth', 'providers'],
    queryFn: () => apiFetch<ProvidersResponse>('/v1/auth/providers'),
  })

  return {
    githubAvailable: data?.github ?? false,
    isLoading,
  }
}
