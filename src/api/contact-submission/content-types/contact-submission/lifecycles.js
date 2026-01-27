const DEFAULT_RECIPIENT = 'edwin@tryenvoyx.com'

const parseRecipients = (value) => {
  if (!value) {
    return []
  }

  if (Array.isArray(value)) {
    return value.map((entry) => String(entry).trim()).filter(Boolean)
  }

  return String(value)
    .split(/[\n,]+/)
    .map((entry) => entry.trim())
    .filter(Boolean)
}

const loadRecipients = async () => {
  const settings = await strapi.entityService.findMany(
    'api::contact-setting.contact-setting',
    { limit: 1 }
  )

  const record = Array.isArray(settings) ? settings[0] : settings
  const recipients = parseRecipients(record?.recipients)

  return recipients.length ? recipients : [DEFAULT_RECIPIENT]
}

module.exports = {
  async afterCreate(event) {
    const { result } = event
    const emailService = strapi.plugin('email')?.service('email')

    if (!emailService) {
      strapi.log.error('Email plugin is not configured. Cannot send contact email.')
      return
    }

    const recipients = await loadRecipients()
    const subject = `New Contact Submission — ${result.fullName}`

    const lines = [
      `Full Name: ${result.fullName}`,
      `Email: ${result.email}`,
      `Phone: ${result.phone}`,
      `Business Name: ${result.businessName}`,
      `Job Title: ${result.jobTitle}`,
      `Location: ${result.location}`,
      `How can we help?: ${result.helpRequest}`,
      `Referral: ${result.referral}`,
      `Consent: ${result.consent ? 'Yes' : 'No'}`
    ]

    await emailService.send({
      to: recipients,
      subject,
      text: lines.join('\n'),
      replyTo: result.email
    })
  }
}
