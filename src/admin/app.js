import NewsletterDeliveryPanel from './components/NewsletterDeliveryPanel'

const config = {
  locales: []
}

const bootstrap = (app) => {
  const contentManager = app.getPlugin('content-manager')

  contentManager.apis.addEditViewSidePanel([NewsletterDeliveryPanel])
}

export default {
  config,
  bootstrap
}
