import { buildApp } from './app.js'

const app = await buildApp()

async function startServer() {
  await app.ready()
  await app.listen({ host: app.config.SERVER_HOST, port: app.config.SERVER_PORT })
}

async function gracefulShutdown(signal: string) {
  app.log.info(`${signal} received, starting graceful shutdown`)

  try {
    await app.close()
    app.log.info('Server stopped successfully')
    process.exit(0)
  } catch (err) {
    app.log.error({ err }, 'Error during graceful shutdown')
    process.exit(1)
  }
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'))
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))

try {
  await startServer()
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
