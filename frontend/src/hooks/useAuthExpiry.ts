import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export function useAuthExpiry() {
  const navigate = useNavigate()

  useEffect(() => {
    function handleExpired() {
      navigate('/auth', { state: { expired: true } })
    }

    window.addEventListener('auth:expired', handleExpired)
    return () => window.removeEventListener('auth:expired', handleExpired)
  }, [navigate])
}
