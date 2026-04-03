'use strict'

module.exports = {
  async preview(ctx) {
    try {
      const configuredSecret = process.env.PREVIEW_SECRET || 'your-preview-secret-token'
      const requestSecret = String(ctx.query.secret || '').trim()
      const documentId = String(ctx.params.documentId || '').trim()

      if (!documentId) {
        ctx.status = 400
        ctx.body = {
          ok: false,
          message: 'Missing newsletter issue documentId.'
        }
        return
      }

      if (!requestSecret || requestSecret !== configuredSecret) {
        ctx.status = 401
        ctx.body = {
          ok: false,
          message: 'Invalid preview secret.'
        }
        return
      }

      const service = strapi.service('api::newsletter-issue.newsletter-issue')
      const result = await service.previewIssue(documentId)

      if (String(ctx.query.format || '').trim().toLowerCase() === 'html') {
        ctx.type = 'html'
        ctx.body = result.html
        return
      }

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
