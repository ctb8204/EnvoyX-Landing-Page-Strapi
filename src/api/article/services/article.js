'use strict';

/**
 * article service.
 */

const { createCoreService } = require('@strapi/strapi').factories;
const {
  escapeHtml,
  formatHumanDate,
  getAbsoluteUrl,
  getStrapiBaseUrl,
  normalizeString
} = require('../../../utils/newsletter')

const uid = 'api::article.article'

const BRAND = {
  bg: '#ffffff',
  border: '#dfe6e3',
  card: '#f6f4f1',
  ink: '#081f24',
  inkMuted: '#526066',
  inkSoft: '#274047',
  accent: '#66db4a',
  accentMuted: '#edfbea'
}

const FONT_STACK = "Arial, 'Helvetica Neue', Helvetica, sans-serif"

const renderMedia = (file, alt) => {
  const url = getAbsoluteUrl(file?.url, getStrapiBaseUrl())
  if (!url) return ''

  return `
    <figure style="margin:0 0 32px;">
      <img src="${escapeHtml(url)}" alt="${escapeHtml(alt || '')}" style="display:block;width:100%;height:auto;border-radius:24px;" />
    </figure>
  `
}

const renderBlocks = (blocks = []) =>
  blocks
    .map((block) => {
      if (block?.__component === 'shared.rich-text' && block.body) {
        return `<section style="margin:0 0 28px;color:${BRAND.inkSoft};font-family:${FONT_STACK};font-size:18px;line-height:1.8;">${block.body}</section>`
      }

      if (block?.__component === 'shared.quote') {
        return `
          <blockquote style="margin:0 0 32px;padding:24px 28px;border-left:4px solid ${BRAND.accent};background:${BRAND.card};border-radius:20px;">
            <p style="margin:0 0 12px;font-family:${FONT_STACK};font-size:24px;line-height:1.5;color:${BRAND.ink};">${escapeHtml(block.body || '')}</p>
            ${block.title ? `<footer style="font-family:${FONT_STACK};font-size:14px;line-height:20px;color:${BRAND.inkMuted};">${escapeHtml(block.title)}</footer>` : ''}
          </blockquote>
        `
      }

      if (block?.__component === 'shared.media') {
        return renderMedia(block.file, block.file?.alternativeText || block.file?.caption || '')
      }

      if (block?.__component === 'shared.slider' && Array.isArray(block.files)) {
        return block.files.map((file) => renderMedia(file, file?.alternativeText || file?.caption || '')).join('')
      }

      if (block?.__component === 'shared.html' && block.HTML) {
        return `<section style="margin:0 0 28px;">${block.HTML}</section>`
      }

      return ''
    })
    .join('')

module.exports = createCoreService(uid, ({ strapi }) => ({
  async getArticle(documentId, options = {}) {
    const normalizedId = normalizeString(documentId)
    if (!normalizedId) {
      const error = new Error('Missing article documentId.')
      error.status = 400
      throw error
    }

    const locale = normalizeString(options.locale) || undefined
    const status = normalizeString(options.status) || 'draft'

    const article = await strapi.documents(uid).findOne({
      documentId: normalizedId,
      locale,
      status,
      populate: {
        cover: true,
        author: {
          populate: {
            avatar: true
          }
        },
        category: true,
        blocks: {
          populate: '*'
        }
      }
    })

    if (!article) {
      const error = new Error('Article preview not found.')
      error.status = 404
      throw error
    }

    return article
  },

  renderPreviewHtml(article) {
    const title = escapeHtml(article.title)
    const description = escapeHtml(article.description || '')
    const category = escapeHtml(article.category?.name || 'Article')
    const publishDate = formatHumanDate(article.publishedAt || article.updatedAt || article.createdAt)
    const coverHtml = renderMedia(
      article.cover,
      article.cover?.alternativeText || article.cover?.caption || article.title
    )
    const authorName = article.author?.name ? escapeHtml(article.author.name) : 'EnvoyX'
    const bodyHtml =
      normalizeString(article.HTML_Editor) ||
      renderBlocks(Array.isArray(article.blocks) ? article.blocks : []) ||
      `<p style="font-family:${FONT_STACK};font-size:18px;line-height:1.8;color:${BRAND.inkSoft};">${description}</p>`

    return `
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>${title} | EnvoyX Preview</title>
          <meta name="robots" content="noindex,nofollow" />
        </head>
        <body style="margin:0;background:${BRAND.bg};color:${BRAND.ink};">
          <main style="padding:48px 20px 72px;">
            <div style="max-width:920px;margin:0 auto;">
              <div style="margin:0 0 24px;padding:18px 20px;background:${BRAND.accentMuted};border-radius:18px;font-family:${FONT_STACK};font-size:13px;line-height:20px;color:${BRAND.ink};">
                Strapi article preview
              </div>
              <article style="padding:40px;background:${BRAND.bg};border:1px solid ${BRAND.border};border-radius:32px;box-shadow:0 18px 40px rgba(8,31,36,0.08);">
                <div style="margin:0 0 24px;">
                  <span style="display:inline-block;margin:0 0 16px;background:${BRAND.accentMuted};color:${BRAND.ink};border-radius:999px;padding:6px 12px;font-family:${FONT_STACK};font-size:10px;line-height:16px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">${category}</span>
                  <h1 style="margin:0 0 16px;font-family:${FONT_STACK};font-size:52px;line-height:1.1;font-weight:500;letter-spacing:-0.05em;color:${BRAND.ink};">${title}</h1>
                  <p style="margin:0 0 16px;font-family:${FONT_STACK};font-size:18px;line-height:1.7;color:${BRAND.inkSoft};">${description}</p>
                  <p style="margin:0;font-family:${FONT_STACK};font-size:14px;line-height:20px;color:${BRAND.inkMuted};">${escapeHtml(publishDate)} &nbsp;&nbsp;•&nbsp;&nbsp; ${authorName}</p>
                </div>
                ${coverHtml}
                <div style="font-family:${FONT_STACK};font-size:18px;line-height:1.8;color:${BRAND.inkSoft};">
                  ${bodyHtml}
                </div>
              </article>
            </div>
          </main>
        </body>
      </html>
    `.trim()
  }
}))
