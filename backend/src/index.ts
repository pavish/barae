import fastify from 'fastify'
import cors from '@fastify/cors'
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import config from './config.js'
import db from './db/index.js'

const server = fastify({
  logger: true,
}).withTypeProvider<TypeBoxTypeProvider>()

async function setupServer() {
  // Register plugins
  await server.register(config)
  await server.register(db)
  await server.register(cors, {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  })
}

async function startServer() {
  await server.ready()
  await server.listen({ host: server.config.SERVER_HOST, port: server.config.SERVER_PORT })
}

async function gracefulShutdown(signal: string) {
  server.log.info(`${signal} received, starting graceful shutdown`)

  try {
    await server.close()
    server.log.info('Server stopped successfully')
    process.exit(0)
  } catch (err) {
    server.log.error({ err }, 'Error during graceful shutdown')
    process.exit(1)
  }
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'))
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))

try {
  await setupServer()
  await startServer()
} catch (err) {
  server.log.error(err)
  process.exit(1)
}
