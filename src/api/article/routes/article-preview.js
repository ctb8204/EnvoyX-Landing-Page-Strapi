'use strict'

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/articles/:documentId/preview',
      handler: 'article.preview',
      config: {
        auth: false
      }
    }
  ]
}
