import fp from 'fastify-plugin'
import { eq, and, gt } from 'drizzle-orm'

const OTP_RATE_LIMIT_SECONDS = 60

export default fp(
  async (fastify) => {
    fastify.route({
      method: ['GET', 'POST'],
      url: '/v1/auth/*',
      preHandler: async (request, reply) => {
        const urlPath = request.url.split('?')[0]
        if (
          request.method !== 'POST' ||
          urlPath !== '/v1/auth/email-otp/send-verification-otp'
        ) return

        const body = request.body as Record<string, unknown> | undefined
        const email = typeof body?.email === 'string' ? body.email : undefined
        const type = typeof body?.type === 'string' ? body.type : undefined

        if (!email || !type) return

        const identifier = `${type}-otp-${email}`
        const cutoff = new Date(Date.now() - OTP_RATE_LIMIT_SECONDS * 1000)

        const [existing] = await fastify.db.do
          .select({ updatedAt: fastify.db.schema.verification.updatedAt })
          .from(fastify.db.schema.verification)
          .where(
            and(
              eq(fastify.db.schema.verification.identifier, identifier),
              gt(fastify.db.schema.verification.updatedAt, cutoff),
            ),
          )
          .limit(1)

        if (existing) {
          const elapsed = Math.floor(
            (Date.now() - existing.updatedAt.getTime()) / 1000,
          )
          const retryAfter = OTP_RATE_LIMIT_SECONDS - elapsed

          reply.status(429).send({
            message: 'Please wait before requesting a new code',
            retryAfter,
          })
          return
        }
      },
      onSend: async (request, reply, payload) => {
        const urlPath = request.url.split('?')[0]
        if (
          request.method !== 'POST' ||
          urlPath !== '/v1/auth/sign-in/email' ||
          reply.statusCode !== 403
        ) return payload

        if (typeof payload !== 'string') return payload

        try {
          const body = JSON.parse(payload) as Record<string, unknown>
          if (body.message === 'Email not verified') {
            return JSON.stringify({ ...body, code: 'EMAIL_NOT_VERIFIED' })
          }
        } catch {
          // Not JSON, forward as-is
        }

        return payload
      },
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
          // Let Fastify calculate content-length from the final payload after onSend
          if (key !== 'content-length') {
            reply.header(key, value)
          }
        })

        const text = await response.text()
        return reply.send(text || null)
      },
    })
  },
  { name: 'auth-routes', dependencies: ['auth', 'db'] }
)
