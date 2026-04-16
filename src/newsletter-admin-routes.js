'use strict'

const createResponseBody = (ok, data = {}) => ({
  ok,
  ...data
})

module.exports = ({ strapi }) => ({
  type: 'admin',
  prefix: '/admin',
  routes: [
    {
      method: 'POST',
      path: '/newsletter-admin/issues/:documentId/send-test',
      async handler(ctx) {
        try {
          const service = strapi.service('api::newsletter-issue.newsletter-issue')
          const result = await service.sendTest(ctx.params.documentId, ctx.request.body?.to)

          ctx.body = createResponseBody(true, result)
        } catch (error) {
          ctx.status = error.status || 500
          ctx.body = createResponseBody(false, {
            message: error.message || 'Unable to send newsletter test email.'
          })
        }
      }
    },
    {
      method: 'POST',
      path: '/newsletter-admin/issues/:documentId/send',
      async handler(ctx) {
        try {
          const service = strapi.service('api::newsletter-issue.newsletter-issue')
          const result = await service.sendIssue(ctx.params.documentId)

          ctx.body = createResponseBody(true, result)
        } catch (error) {
          ctx.status = error.status || 500
          ctx.body = createResponseBody(false, {
            message: error.message || 'Unable to send newsletter issue.',
            details: error.details || null
          })
        }
      }
    }
  ]
})
