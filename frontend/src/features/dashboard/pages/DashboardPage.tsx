import { EmptyState } from '../components/EmptyState'

export function DashboardPage() {
  // In Phase 1, users have no sites yet, so always show empty state
  // This will be updated in Phase 3 to check for existing sites
  const hasSites = false

  if (!hasSites) {
    return <EmptyState />
  }

  // Future: Render site list when user has sites
  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--color-foreground)]">
        Your Sites
      </h1>
      {/* Site list will be rendered here in Phase 3 */}
    </div>
  )
}
