'use strict';

/**
 *  article controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::article.article', ({ strapi }) => ({
  async preview(ctx) {
    try {
      const configuredSecret = process.env.PREVIEW_SECRET || 'your-preview-secret-token'
      const requestSecret = String(ctx.query.secret || '').trim()
      const documentId = String(ctx.params.documentId || '').trim()

      if (!documentId) {
        ctx.status = 400
        ctx.body = {
          ok: false,
          message: 'Missing article documentId.'
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

      const service = strapi.service('api::article.article')
      const article = await service.getArticle(documentId, {
        locale: ctx.query.locale,
        status: ctx.query.status
      })

      ctx.type = 'html'
      ctx.body = service.renderPreviewHtml(article)
    } catch (error) {
      ctx.status = error.status || 500
      ctx.body = {
        ok: false,
        message: error.message || 'Unable to render article preview.'
      }
    }
  }
}));
