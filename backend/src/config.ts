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
