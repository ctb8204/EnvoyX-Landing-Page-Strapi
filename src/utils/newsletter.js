'use strict'

const crypto = require('node:crypto')

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const normalizeString = (value) => {
  if (typeof value !== 'string') return ''
  return value.trim()
}

const normalizeEmail = (value) => normalizeString(value).toLowerCase()

const isValidEmail = (value) => EMAIL_PATTERN.test(normalizeEmail(value))

const createUnsubscribeToken = () => crypto.randomBytes(24).toString('hex')

const stripTrailingSlash = (value) => value.replace(/\/+$/, '')

const getSiteUrl = () => {
  const candidates = [
    process.env.NEWSLETTER_SITE_URL,
    process.env.FRONTEND_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.PREVIEW_BASE_URL,
    process.env.PUBLIC_URL,
    'http://localhost:3000'
  ]

  const match = candidates.find((entry) => typeof entry === 'string' && entry.trim())
  return stripTrailingSlash(match || 'http://localhost:3000')
}

const getStrapiBaseUrl = () => {
  const candidates = [
    process.env.STRAPI_PUBLIC_URL,
    process.env.STRAPI_URL,
    process.env.PUBLIC_URL,
    ''
  ]

  const match = candidates.find((entry) => typeof entry === 'string' && entry.trim())
  return stripTrailingSlash(match || '')
}

const getAbsoluteUrl = (value, baseUrl) => {
  const normalized = normalizeString(value)
  if (!normalized) return ''
  if (/^https?:\/\//i.test(normalized)) return normalized
  if (!baseUrl) return normalized
  return `${stripTrailingSlash(baseUrl)}${normalized.startsWith('/') ? normalized : `/${normalized}`}`
}

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const formatHumanDate = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const stripMarkdown = (value) =>
  normalizeString(value)
    .replace(/!\[[^\]]*]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[`*_>#-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const truncate = (value, maxLength = 180) => {
  const normalized = normalizeString(value)
  if (!normalized || normalized.length <= maxLength) return normalized
  return `${normalized.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`
}

const getArticleExcerpt = (article) => {
  if (!article || typeof article !== 'object') return ''
  const description = truncate(article.description, 180)
  if (description) return description

  const richTextBlock = Array.isArray(article.blocks)
    ? article.blocks.find((block) => block?.__component === 'shared.rich-text' && block.body)
    : null

  return truncate(stripMarkdown(richTextBlock?.body || ''), 180)
}

const buildBlogArticleUrl = (slug) => `${getSiteUrl()}/en/blog/${encodeURIComponent(slug)}`

const buildUnsubscribeUrl = (token) =>
  `${getSiteUrl()}/en/unsubscribe?token=${encodeURIComponent(token)}`

module.exports = {
  buildBlogArticleUrl,
  buildUnsubscribeUrl,
  createUnsubscribeToken,
  escapeHtml,
  formatHumanDate,
  getAbsoluteUrl,
  getArticleExcerpt,
  getSiteUrl,
  getStrapiBaseUrl,
  isValidEmail,
  normalizeEmail,
  normalizeString,
  stripMarkdown,
  truncate
}
