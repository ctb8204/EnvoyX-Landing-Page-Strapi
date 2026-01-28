const crypto = require('node:crypto')

const DEFAULT_RECIPIENT = 'edwin@tryenvoyx.com'
const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12

const getKey = () => {
  const rawKey = process.env.CONTACT_ENCRYPTION_KEY || process.env.ENCRYPTION_KEY
  if (!rawKey) return null
  const key = Buffer.from(rawKey, 'base64')
  if (key.length !== 32) return null
  return key
}

const encryptString = (value) => {
  const key = getKey()
  if (!key) {
    return Buffer.from(value).toString('base64')
  }

  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()

  const payload = {
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    data: encrypted.toString('base64')
  }

  return Buffer.from(JSON.stringify(payload)).toString('base64')
}

const buildFallbackPayload = (data) =>
  JSON.stringify({
    source: 'admin',
    createdAt: new Date().toISOString(),
    data: {
      fullName: data.fullName ?? null,
      email: data.email ?? null,
      phone: data.phone ?? null
    }
  })

const ensureEncryptedPayload = (data) => {
  if (data.encryptedPayload) return
  data.encryptedPayload = encryptString(buildFallbackPayload(data))
}

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
  const record = await strapi
    .documents('api::contact-setting.contact-setting')
    .findFirst({ fields: ['recipients'] })

  const recipients = parseRecipients(record?.recipients)

  return recipients.length ? recipients : [DEFAULT_RECIPIENT]
}

module.exports = {
  beforeCreate(event) {
    ensureEncryptedPayload(event.params.data)
  },
  beforeUpdate(event) {
    ensureEncryptedPayload(event.params.data)
  },
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

    try {
      await emailService.send({
        to: recipients,
        subject,
        text: lines.join('\n'),
        replyTo: result.email
      })
    } catch (error) {
      const details =
        error && typeof error === 'object' && 'message' in error
          ? error.message
          : 'Unknown email error'
      strapi.log.error(`Failed to send contact email: ${details}`)
    }
  }
}
