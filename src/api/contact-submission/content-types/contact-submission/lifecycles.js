const crypto = require('node:crypto')

const DEFAULT_RECIPIENT = 'edwin@tryenvoyx.com'
const DEFAULT_FROM =
  process.env.EMAIL_DEFAULT_FROM ||
  process.env.EMAIL_SENDER ||
  'no-reply@tryenvoyx.com'
const DEFAULT_REPLY_TO =
  process.env.EMAIL_DEFAULT_REPLY_TO ||
  process.env.EMAIL_REPLY_TO ||
  DEFAULT_FROM
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

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const parseRecipients = (value) => {
  if (!value) {
    return []
  }

  if (Array.isArray(value)) {
    return value
      .map((entry) => normalizeRecipient(String(entry)))
      .filter(Boolean)
<<<<<<< HEAD
      .filter((entry) => emailPattern.test(entry))
  }

  const raw = String(value).trim()
  if (!raw) return []

  if (raw.startsWith('[') && raw.endsWith(']')) {
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        return parsed
          .map((entry) => normalizeRecipient(String(entry)))
          .filter(Boolean)
          .filter((entry) => emailPattern.test(entry))
      }
    } catch (error) {
      // fall through to delimiter parsing
    }
  }

  return raw
    .split(/[\n,;]+/)
=======
  }

  return String(value)
    .split(/[\n,]+/)
>>>>>>> 1064c3b (Email field fixes)
    .map((entry) => normalizeRecipient(entry))
    .filter(Boolean)
    .filter((entry) => emailPattern.test(entry))
}

const normalizeRecipient = (value) => {
  let trimmed = value.trim()
  if (!trimmed) return ''
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    trimmed = trimmed.slice(1, -1).trim()
  }
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim()
  }
  return trimmed
}

const normalizeRecipient = (value) => {
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim()
  }
  return trimmed
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
  afterCreate(event) {
    scheduleContactEmail(event.result)
  }
}

const sendContactEmail = async (result) => {
  const emailService = strapi.plugin('email')?.service('email')

  if (!emailService) {
    strapi.log.error('Email plugin is not configured. Cannot send contact email.')
    return
  }

  const recipients = await loadRecipients()
  const subject = `New Contact Submission — ${result.fullName}`
<<<<<<< HEAD
  const to = recipients.length === 1 ? recipients[0] : recipients.join(',')
=======
  const to = recipients.length === 1 ? recipients[0] : recipients.join(', ')
>>>>>>> 1064c3b (Email field fixes)

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
      to,
      subject,
      text: lines.join('\n'),
      from: DEFAULT_FROM,
      replyTo: DEFAULT_REPLY_TO
    })
  } catch (error) {
    const responseData = error && typeof error === 'object' ? error.response?.data : null
    const responseStatus = error && typeof error === 'object' ? error.response?.status : null
    let details = 'Unknown email error'

    if (responseData) {
      details =
        typeof responseData === 'string' ? responseData : JSON.stringify(responseData)
    } else if (error && typeof error === 'object' && error.message) {
      details = error.message
    }

    if (responseStatus) {
      details = `status ${responseStatus}: ${details}`
    }

    strapi.log.error(`Failed to send contact email: ${details}`)
  }
}

const scheduleContactEmail = (result) => {
  setImmediate(() => {
    sendContactEmail(result).catch((error) => {
      const responseData = error && typeof error === 'object' ? error.response?.data : null
      const responseStatus = error && typeof error === 'object' ? error.response?.status : null
      let details = 'Unknown email error'

      if (responseData) {
        details =
          typeof responseData === 'string' ? responseData : JSON.stringify(responseData)
      } else if (error && typeof error === 'object' && error.message) {
        details = error.message
      }

      if (responseStatus) {
        details = `status ${responseStatus}: ${details}`
      }

      strapi.log.error(`Failed to schedule contact email: ${details}`)
    })
  })
}
