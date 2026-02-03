import { useTheme } from '../../../shared/hooks/useTheme'
import { Card } from '../../../shared/components'

type Theme = 'light' | 'dark' | 'system'

export function AppearanceSection() {
  const { theme, setTheme } = useTheme()

  const options: { value: Theme; label: string; description: string }[] = [
    {
      value: 'light',
      label: 'Light',
      description: 'Light background with dark text',
    },
    {
      value: 'dark',
      label: 'Dark',
      description: 'Dark background with light text',
    },
    {
      value: 'system',
      label: 'System',
      description: 'Follows your operating system preference',
    },
  ]

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-[var(--color-foreground)] mb-4">
        Appearance
      </h2>

      <p className="text-sm text-[var(--color-muted-foreground)] mb-4">
        Choose how Barae looks to you. Select a single theme, or sync with your system settings.
      </p>

      <div className="space-y-2">
        {options.map((option) => (
          <label
            key={option.value}
            className={`
              flex items-start gap-3 p-3 rounded-lg border cursor-pointer
              transition-colors duration-150
              ${
                theme === option.value
                  ? 'border-[var(--color-primary)] bg-[var(--color-muted)]'
                  : 'border-[var(--color-border)] hover:bg-[var(--color-muted)]'
              }
            `.trim()}
          >
            <input
              type="radio"
              name="theme"
              value={option.value}
              checked={theme === option.value}
              onChange={() => setTheme(option.value)}
              className="mt-1 h-4 w-4 border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
            />
            <div>
              <div className="text-sm font-medium text-[var(--color-foreground)]">
                {option.label}
              </div>
              <div className="text-xs text-[var(--color-muted-foreground)]">
                {option.description}
              </div>
            </div>

            {/* Theme preview */}
            <div className="ml-auto flex-shrink-0">
              <ThemePreview theme={option.value} />
            </div>
          </label>
        ))}
      </div>
    </Card>
  )
}

function ThemePreview({ theme }: { theme: Theme }) {
  const isLight = theme === 'light'
  const isDark = theme === 'dark'
  const isSystem = theme === 'system'

  return (
    <div
      className={`
        w-16 h-10 rounded border overflow-hidden flex
        ${
          isDark
            ? 'bg-slate-900 border-slate-700'
            : isLight
              ? 'bg-white border-slate-200'
              : 'border-slate-300'
        }
      `.trim()}
    >
      {isSystem ? (
        // System preview - half light, half dark
        <>
          <div className="w-1/2 bg-white flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-slate-200" />
          </div>
          <div className="w-1/2 bg-slate-900 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-slate-700" />
          </div>
        </>
      ) : (
        // Single theme preview
        <div className="w-full flex items-center justify-center">
          <div
            className={`w-3 h-3 rounded-full ${
              isDark ? 'bg-slate-700' : 'bg-slate-200'
            }`}
          />
        </div>
      )}
    </div>
  )
}
