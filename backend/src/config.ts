import env from '@fastify/env'
import { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import { Static, Type } from '@fastify/type-provider-typebox'

export const DEFAULT_PORT = 3000

const envVarsSchema = Type.Object({
  SERVER_HOST: Type.Optional(Type.String()),
  SERVER_PORT: Type.Number({ default: DEFAULT_PORT }),
  POSTGRES_HOST: Type.String(),
  POSTGRES_PORT: Type.Number(),
  POSTGRES_DB: Type.String(),
  POSTGRES_USER: Type.String(),
  POSTGRES_PASSWORD: Type.String(),
  APP_SECRET: Type.String(),
  // Auth - GitHub OAuth (optional, GitHub login disabled if not set)
  GITHUB_CLIENT_ID: Type.Optional(Type.String()),
  GITHUB_CLIENT_SECRET: Type.Optional(Type.String()),
  // Frontend URL for CORS
  FRONTEND_URL: Type.Optional(Type.String({ default: 'http://localhost:5173' })),
  // Email - SMTP (optional, emails logged to console if not set)
  SMTP_HOST: Type.Optional(Type.String()),
  SMTP_PORT: Type.Optional(Type.Number({ default: 587 })),
  SMTP_USER: Type.Optional(Type.String()),
  SMTP_PASSWORD: Type.Optional(Type.String()),
  SMTP_SECURE: Type.Optional(Type.Boolean({ default: false })),
  EMAIL_FROM: Type.Optional(Type.String({ default: 'Barae <noreply@barae.app>' })),
})

async function config(fastify: FastifyInstance) {
  await fastify.register(env, {
    schema: envVarsSchema,
  })
}

export default fp(config, { name: 'config' })

declare module 'fastify' {
  export interface FastifyInstance {
    config: Static<typeof envVarsSchema>
  }
}
