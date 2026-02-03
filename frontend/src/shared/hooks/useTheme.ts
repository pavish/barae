import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'system'
    return (localStorage.getItem('theme') as Theme) || 'system'
  })

  useEffect(() => {
    const root = document.documentElement

    const applyTheme = (t: Theme) => {
      if (t === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        root.classList.toggle('dark', isDark)
      } else {
        root.classList.toggle('dark', t === 'dark')
      }
    }

    applyTheme(theme)
    localStorage.setItem('theme', theme)

    // Listen for system preference changes when theme is 'system'
    if (theme === 'system') {
      const media = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = () => applyTheme('system')
      media.addEventListener('change', handler)
      return () => media.removeEventListener('change', handler)
    }
  }, [theme])

  return { theme, setTheme }
}
