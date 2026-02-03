import fp from 'fastify-plugin'
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { auth } from '../auth/index.js'

async function authPlugin(fastify: FastifyInstance) {
  fastify.all('/api/auth/*', async (request: FastifyRequest, reply: FastifyReply) => {
    // Construct the full URL
    const url = new URL(request.url, `http://${request.headers.host}`)

    // Convert Fastify headers to Web Headers
    const headers = new Headers()
    for (const [key, value] of Object.entries(request.headers)) {
      if (value) {
        headers.append(key, Array.isArray(value) ? value.join(', ') : value)
      }
    }

    // Create Web Request from Fastify request
    const webRequest = new Request(url.toString(), {
      method: request.method,
      headers,
      body:
        request.method !== 'GET' && request.method !== 'HEAD'
          ? JSON.stringify(request.body)
          : undefined,
    })

    // Handle the request with better-auth
    const response = await auth.handler(webRequest)

    // Forward response status
    reply.status(response.status)

    // Forward response headers (especially cookies)
    response.headers.forEach((value, key) => {
      reply.header(key, value)
    })

    // Send response body
    const body = await response.text()
    return reply.send(body)
  })

  fastify.log.info('Auth plugin registered at /api/auth/*')
}

export default fp(authPlugin, {
  name: 'auth',
  dependencies: ['db'], // Auth plugin depends on db being available
})
