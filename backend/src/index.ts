import closeWithGrace from 'close-with-grace'
import { buildApp } from './app.js'

const app = await buildApp()

closeWithGrace({ delay: 10000 }, async ({ signal, err }) => {
  if (err) {
    app.log.error({ err }, 'Server closing due to error')
  } else {
    app.log.info({ signal }, 'Server closing due to signal')
  }
  await app.close()
})

try {
  await app.listen({ host: app.config.SERVER_HOST, port: app.config.SERVER_PORT })
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
