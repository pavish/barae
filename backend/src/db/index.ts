import { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as dbSchema from './schema/index.js'

function createDbHandler(fastify: FastifyInstance) {
  const client = postgres({
    host: fastify.config.POSTGRES_HOST,
    port: fastify.config.POSTGRES_PORT,
    database: fastify.config.POSTGRES_DB,
    username: fastify.config.POSTGRES_USER,
    password: fastify.config.POSTGRES_PASSWORD,
  })

  return {
    client,
    schema: dbSchema,
    do: drizzle(client, { schema: dbSchema }),
  }
}

export default fp(
  async (fastify) => {
    fastify.decorate('db', createDbHandler(fastify))

    fastify.addHook('onClose', async (instance) => {
      instance.log.info('Closing database connection')
      await instance.db.client.end()
      instance.log.info('Database connection closed gracefully')
    })
  },
  { name: 'db', dependencies: ['config'] }
)

declare module 'fastify' {
  interface FastifyInstance {
    db: ReturnType<typeof createDbHandler>
  }
}
