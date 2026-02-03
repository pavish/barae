import type { FastifyRequest, FastifyReply } from 'fastify'
import type { AuthService } from './service.js'

export function createAuthHandler(auth: AuthService) {
  return async function authHandler(request: FastifyRequest, reply: FastifyReply) {
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
  }
}
