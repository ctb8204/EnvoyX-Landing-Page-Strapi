'use strict'

module.exports = {
  async subscribe(ctx) {
    try {
      const payload = ctx.request.body || {}
      const service = strapi.service('api::newsletter-subscriber.newsletter-subscriber')
      const result = await service.subscribe({
        email: payload.email,
        fullName: payload.fullName,
        organization: payload.organization,
        source: payload.source,
        sourceStatus: payload.sourceStatus,
        connectedThrough: payload.connectedThrough,
        sourceMeta: payload.sourceMeta
      })

      ctx.body = {
        ok: true,
        status: result.status,
        subscriber: {
          email: result.subscriber.email,
          isSubscribed: result.subscriber.isSubscribed
        }
      }
    } catch (error) {
      ctx.status = error.status || 500
      ctx.body = {
        ok: false,
        message: error.message || 'Unable to subscribe right now.'
      }
    }
  },

  async unsubscribe(ctx) {
    try {
      const payload = ctx.request.body || {}
      const service = strapi.service('api::newsletter-subscriber.newsletter-subscriber')
      const result = await service.unsubscribeByToken(payload.token)

      if (result.status === 'not-found') {
        ctx.status = 404
        ctx.body = { ok: false, status: result.status, message: 'Subscriber not found.' }
        return
      }

      ctx.body = {
        ok: true,
        status: result.status
      }
    } catch (error) {
      ctx.status = error.status || 500
      ctx.body = {
        ok: false,
        message: error.message || 'Unable to unsubscribe right now.'
      }
    }
  }
}
