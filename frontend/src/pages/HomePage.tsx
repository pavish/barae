import { Github, Layout, Rocket } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const steps = [
  {
    number: 1,
    title: 'Connect GitHub',
    description: 'Link your GitHub account to get started with Barae.',
    icon: Github,
  },
  {
    number: 2,
    title: 'Choose a template',
    description:
      'Pick a template for your site -- blog, portfolio, or product page.',
    icon: Layout,
  },
  {
    number: 3,
    title: 'Create your site',
    description:
      'Launch your Astro site on GitHub Pages with a single click.',
    icon: Rocket,
  },
] as const

export function HomePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Welcome to Barae
        </h1>
        <p className="text-muted-foreground">
          Your GitHub-native CMS for Astro sites. Follow the steps below to get
          started.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Getting Started</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step) => (
            <Card key={step.number} className="relative opacity-60">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <step.icon className="size-4 text-muted-foreground" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <CardTitle className="text-sm">
                      {step.number}. {step.title}
                    </CardTitle>
                  </div>
                </div>
                <CardDescription>{step.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary" className="text-xs">
                  Coming soon
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
