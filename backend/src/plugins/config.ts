import fp from 'fastify-plugin'
import fastifyEnv from '@fastify/env'
import { Type, type Static } from '@sinclair/typebox'

const schema = Type.Object({
  SERVER_HOST: Type.String({ default: '0.0.0.0' }),
  SERVER_PORT: Type.Number({ default: 3000 }),
  NODE_ENV: Type.String({ default: 'development' }),
  POSTGRES_HOST: Type.String(),
  POSTGRES_PORT: Type.Number(),
  POSTGRES_DB: Type.String(),
  POSTGRES_USER: Type.String(),
  POSTGRES_PASSWORD: Type.String(),
  APP_SECRET: Type.String({ minLength: 32 }),
  AUTH_BASE_URL: Type.String(),
  SMTP_HOST: Type.String({ default: '' }),
  SMTP_PORT: Type.Number({ default: 587 }),
  SMTP_USER: Type.String({ default: '' }),
  SMTP_PASSWORD: Type.String({ default: '' }),
  SMTP_SECURE: Type.Boolean({ default: false }),
  EMAIL_FROM: Type.String({ default: 'Barae <noreply@barae.app>' }),
  GITHUB_CLIENT_ID: Type.String({ default: '' }),
  GITHUB_CLIENT_SECRET: Type.String({ default: '' }),
})

export type Config = Static<typeof schema>

declare module 'fastify' {
  interface FastifyInstance {
    config: Config
  }
}

export default fp(
  async (fastify) => {
    await fastify.register(fastifyEnv, { schema, dotenv: true })
  },
  { name: 'config' }
)
