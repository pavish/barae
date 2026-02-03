import { ProfileSection } from '../components/ProfileSection'
import { SecuritySection } from '../components/SecuritySection'
import { AppearanceSection } from '../components/AppearanceSection'
import { DangerZone } from '../components/DangerZone'

export function SettingsPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-[var(--color-foreground)] mb-6">
        Settings
      </h1>

      <div className="space-y-6">
        <ProfileSection />
        <SecuritySection />
        <AppearanceSection />
        <DangerZone />
      </div>
    </div>
  )
}
