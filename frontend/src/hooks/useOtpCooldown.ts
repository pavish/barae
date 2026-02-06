import { useState, useEffect, useCallback } from 'react'

export function useOtpCooldown(cooldownSeconds = 60) {
  const [secondsLeft, setSecondsLeft] = useState(0)

  const startCooldown = useCallback(() => {
    setSecondsLeft(cooldownSeconds)
  }, [cooldownSeconds])

  useEffect(() => {
    if (secondsLeft <= 0) return
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [secondsLeft])

  return {
    canResend: secondsLeft === 0,
    secondsLeft,
    startCooldown,
  }
}
