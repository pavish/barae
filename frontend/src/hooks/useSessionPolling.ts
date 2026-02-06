import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { authClient } from '@/lib/auth'

const POLL_INTERVAL = 5 * 60 * 1000 // 5 minutes

export function useSessionPolling() {
  const navigate = useNavigate()
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined)

  useEffect(() => {
    intervalRef.current = setInterval(async () => {
      const { data, error } = await authClient.getSession()
      if (error || !data) {
        navigate('/auth', { state: { expired: true } })
      }
    }, POLL_INTERVAL)

    return () => clearInterval(intervalRef.current)
  }, [navigate])
}
