import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div>
        <h1>Barae</h1>
        <p>Dashboard coming in Phase 3</p>
      </div>
    </QueryClientProvider>
  )
}
