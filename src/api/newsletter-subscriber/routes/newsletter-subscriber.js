'use strict'

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/newsletter/subscribe',
      handler: 'newsletter-subscriber.subscribe',
      config: {
        auth: false
      }
    },
    {
      method: 'POST',
      path: '/newsletter/unsubscribe',
      handler: 'newsletter-subscriber.unsubscribe',
      config: {
        auth: false
      }
    }
  ]
}
