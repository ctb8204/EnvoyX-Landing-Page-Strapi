'use strict'

module.exports = {
  async preview(ctx) {
    try {
      const service = strapi.service('api::newsletter-issue.newsletter-issue')
      const result = await service.previewIssue(ctx.params.documentId)
      ctx.body = {
        ok: true,
        ...result
      }
    } catch (error) {
      ctx.status = error.status || 500
      ctx.body = {
        ok: false,
        message: error.message || 'Unable to render newsletter preview.'
      }
    }
  },

  async sendTest(ctx) {
    try {
      const service = strapi.service('api::newsletter-issue.newsletter-issue')
      const result = await service.sendTest(ctx.params.documentId, ctx.request.body?.to)
      ctx.body = {
        ok: true,
        ...result
      }
    } catch (error) {
      ctx.status = error.status || 500
      ctx.body = {
        ok: false,
        message: error.message || 'Unable to send newsletter test email.'
      }
    }
  },

  async send(ctx) {
    try {
      const service = strapi.service('api::newsletter-issue.newsletter-issue')
      const result = await service.sendIssue(ctx.params.documentId)
      ctx.body = {
        ok: true,
        ...result
      }
    } catch (error) {
      ctx.status = error.status || 500
      ctx.body = {
        ok: false,
        message: error.message || 'Unable to send newsletter issue.',
        details: error.details || null
      }
    }
  }
}
