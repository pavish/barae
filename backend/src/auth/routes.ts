import fp from 'fastify-plugin'

export default fp(
  async (fastify) => {
    fastify.route({
      method: ['GET', 'POST'],
      url: '/v1/auth/*',
      handler: async (request, reply) => {
        // Caddy strips /api/ prefix, but better-auth needs the full public URL
        // to match its baseURL (http://localhost:8100/api/auth)
        const url = new URL(`/api${request.url}`, `http://${request.headers.host}`)

        const headers = new Headers()
        for (const [key, value] of Object.entries(request.headers)) {
          if (value !== undefined) {
            headers.append(key, Array.isArray(value) ? value.join(', ') : value)
          }
        }

        const req = new Request(url.toString(), {
          method: request.method,
          headers,
          ...(request.body ? { body: JSON.stringify(request.body) } : {}),
        })

        const response = await fastify.auth.handler(req)

        reply.status(response.status)
        response.headers.forEach((value, key) => {
          reply.header(key, value)
        })

        const text = await response.text()
        return reply.send(text || null)
      },
    })
  },
  { name: 'auth-routes', dependencies: ['auth'] }
)
