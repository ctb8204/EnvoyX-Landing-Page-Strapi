'use strict'

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/newsletter-issues/:documentId/preview',
      handler: 'newsletter-issue.preview'
    },
    {
      method: 'POST',
      path: '/newsletter-issues/:documentId/send-test',
      handler: 'newsletter-issue.sendTest'
    },
    {
      method: 'POST',
      path: '/newsletter-issues/:documentId/send',
      handler: 'newsletter-issue.send'
    }
  ]
}
