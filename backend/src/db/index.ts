import fp from 'fastify-plugin'
import { createDbClient, schema as dbSchema } from './client.js'

type DbClient = ReturnType<typeof createDbClient>

interface DbHandler {
  client: DbClient['client']
  schema: typeof dbSchema
  do: DbClient['db']
}

export default fp(
  async (fastify) => {
    const { client, db } = createDbClient({
      host: fastify.config.POSTGRES_HOST,
      port: fastify.config.POSTGRES_PORT,
      database: fastify.config.POSTGRES_DB,
      username: fastify.config.POSTGRES_USER,
      password: fastify.config.POSTGRES_PASSWORD,
    })

    const dbHandler: DbHandler = { client, schema: dbSchema, do: db }
    fastify.decorate('db', dbHandler)

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
    db: DbHandler
  }
}
