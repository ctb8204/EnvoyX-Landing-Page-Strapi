'use strict'

const { createCoreService } = require('@strapi/strapi').factories
const {
  buildBlogArticleUrl,
  buildUnsubscribeUrl,
  escapeHtml,
  formatHumanDate,
  getAbsoluteUrl,
  getArticleExcerpt,
  getSiteUrl,
  getStrapiBaseUrl,
  isValidEmail,
  normalizeString
} = require('../../../utils/newsletter')

const uid = 'api::newsletter-issue.newsletter-issue'

const renderArticleCardHtml = (article) => {
  const articleUrl = buildBlogArticleUrl(article.slug)
  const coverUrl = getAbsoluteUrl(article.cover?.url, getStrapiBaseUrl())
  const categoryName = article.category?.name ? escapeHtml(article.category.name) : 'Insight'
  const publishDate = formatHumanDate(article.publishedAt)
  const excerpt = escapeHtml(getArticleExcerpt(article))
  const title = escapeHtml(article.title)

  const imageHtml = coverUrl
    ? `
      <tr>
        <td style="padding:0 0 20px;">
          <img src="${escapeHtml(coverUrl)}" alt="${title}" style="display:block;width:100%;height:auto;border-radius:16px;" />
        </td>
      </tr>
    `
    : ''

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:separate;background:#f6f4f1;border-radius:20px;margin:0 0 24px;">
      <tr>
        <td style="padding:24px;">
          ${imageHtml}
          <div style="margin:0 0 12px;">
            <span style="display:inline-block;background:#e8ecea;color:#081f24;border-radius:999px;padding:6px 12px;font-family:Arial,sans-serif;font-size:12px;line-height:16px;font-weight:700;letter-spacing:0.02em;text-transform:uppercase;">${categoryName}</span>
          </div>
          <h2 style="margin:0 0 12px;font-family:Arial,sans-serif;font-size:28px;line-height:34px;color:#081f24;">${title}</h2>
          ${publishDate ? `<p style="margin:0 0 12px;font-family:Arial,sans-serif;font-size:14px;line-height:20px;color:#526066;">${escapeHtml(publishDate)}</p>` : ''}
          <p style="margin:0 0 20px;font-family:Arial,sans-serif;font-size:16px;line-height:26px;color:#274047;">${excerpt}</p>
          <a href="${escapeHtml(articleUrl)}" style="display:inline-block;padding:12px 20px;border-radius:999px;background:#081f24;color:#ffffff;font-family:Arial,sans-serif;font-size:14px;line-height:20px;font-weight:700;text-decoration:none;">Read on the blog</a>
        </td>
      </tr>
    </table>
  `
}

const renderContentBlockHtml = (title, body) => {
  const normalizedBody = normalizeString(body)
  if (!normalizedBody) return ''

  const heading = normalizeString(title) || 'Update'

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:separate;background:#ffffff;border:1px solid #dfe6e3;border-radius:20px;margin:0 0 24px;">
      <tr>
        <td style="padding:24px;">
          <h3 style="margin:0 0 12px;font-family:Arial,sans-serif;font-size:22px;line-height:28px;color:#081f24;">${escapeHtml(heading)}</h3>
          <p style="margin:0;font-family:Arial,sans-serif;font-size:16px;line-height:26px;color:#274047;white-space:pre-line;">${escapeHtml(normalizedBody)}</p>
        </td>
      </tr>
    </table>
  `
}

module.exports = createCoreService(uid, ({ strapi }) => ({
  async getIssue(documentId) {
    const normalizedId = normalizeString(documentId)
    if (!normalizedId) {
      const error = new Error('Missing newsletter issue documentId.')
      error.status = 400
      throw error
    }

    const issue = await strapi.documents(uid).findOne({
      documentId: normalizedId,
      populate: {
        headerImage: true,
        featuredArticles: {
          populate: {
            cover: true,
            category: true,
            author: {
              populate: {
                avatar: true
              }
            }
          }
        }
      }
    })

    if (!issue) {
      const error = new Error('Newsletter issue not found.')
      error.status = 404
      throw error
    }

    return issue
  },

  renderIssue(issue, recipient = null) {
    const featuredArticles = Array.isArray(issue.featuredArticles)
      ? issue.featuredArticles.slice(0, 5)
      : []
    const siteUrl = getSiteUrl()
    const headerImageUrl = getAbsoluteUrl(issue.headerImage?.url, getStrapiBaseUrl())
    const intro = normalizeString(issue.intro)
    const preheader = normalizeString(issue.preheader) || intro || issue.title
    const ctaLabel = normalizeString(issue.ctaLabel) || 'Contact the EnvoyX team'
    const ctaUrl = normalizeString(issue.ctaUrl) || `${siteUrl}/en/contact`
    const unsubscribeUrl = recipient?.unsubscribeToken
      ? buildUnsubscribeUrl(recipient.unsubscribeToken)
      : `${siteUrl}/en/unsubscribe`
    const issueDate = formatHumanDate(issue.issueDate || issue.createdAt)

    const articleHtml = featuredArticles.map(renderArticleCardHtml).join('')
    const productUpdateHtml = renderContentBlockHtml(issue.productUpdateTitle, issue.productUpdateBody)
    const ecosystemInsightHtml = renderContentBlockHtml(
      issue.ecosystemInsightTitle,
      issue.ecosystemInsightBody
    )

    const html = `
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>${escapeHtml(issue.subject)}</title>
        </head>
        <body style="margin:0;padding:0;background:#ffffff;">
          <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(preheader)}</div>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#ffffff;border-collapse:collapse;">
            <tr>
              <td align="center" style="padding:32px 16px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:720px;border-collapse:collapse;">
                  <tr>
                    <td style="padding:0 0 24px;">
                      <p style="margin:0 0 12px;font-family:Arial,sans-serif;font-size:14px;line-height:20px;color:#526066;letter-spacing:0.06em;text-transform:uppercase;">EnvoyX Monthly Update</p>
                      <h1 style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:42px;line-height:48px;color:#081f24;">${escapeHtml(issue.title)}</h1>
                      ${issueDate ? `<p style="margin:0;font-family:Arial,sans-serif;font-size:16px;line-height:24px;color:#526066;">${escapeHtml(issueDate)}</p>` : ''}
                    </td>
                  </tr>
                  ${
                    headerImageUrl
                      ? `
                    <tr>
                      <td style="padding:0 0 24px;">
                        <img src="${escapeHtml(headerImageUrl)}" alt="${escapeHtml(issue.title)}" style="display:block;width:100%;height:auto;border-radius:24px;" />
                      </td>
                    </tr>
                  `
                      : ''
                  }
                  ${
                    intro
                      ? `
                    <tr>
                      <td style="padding:0 0 24px;">
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:separate;background:#f6f4f1;border-radius:24px;">
                          <tr>
                            <td style="padding:28px;">
                              <p style="margin:0;font-family:Arial,sans-serif;font-size:18px;line-height:30px;color:#274047;">${escapeHtml(intro)}</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  `
                      : ''
                  }
                  ${
                    articleHtml
                      ? `
                    <tr>
                      <td style="padding:0 0 8px;">
                        <h2 style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:28px;line-height:34px;color:#081f24;">From the blog</h2>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:0 0 8px;">${articleHtml}</td>
                    </tr>
                  `
                      : ''
                  }
                  ${
                    productUpdateHtml || ecosystemInsightHtml
                      ? `
                    <tr>
                      <td style="padding:8px 0 8px;">
                        <h2 style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:28px;line-height:34px;color:#081f24;">Highlights</h2>
                        ${productUpdateHtml}
                        ${ecosystemInsightHtml}
                      </td>
                    </tr>
                  `
                      : ''
                  }
                  <tr>
                    <td style="padding:16px 0 32px;text-align:left;">
                      <a href="${escapeHtml(ctaUrl)}" style="display:inline-block;padding:14px 24px;border-radius:999px;background:#081f24;color:#ffffff;font-family:Arial,sans-serif;font-size:16px;line-height:22px;font-weight:700;text-decoration:none;">${escapeHtml(ctaLabel)}</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:24px 0 0;border-top:1px solid #dfe6e3;">
                      <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:13px;line-height:20px;color:#6d7a7f;">You are receiving this email because you are on the EnvoyX update list.</p>
                      <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;line-height:20px;color:#6d7a7f;">
                        <a href="${escapeHtml(unsubscribeUrl)}" style="color:#081f24;text-decoration:underline;">Unsubscribe</a>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `.trim()

    const textSections = [
      issue.title,
      issueDate,
      intro,
      featuredArticles.length
        ? [
            'From the blog',
            ...featuredArticles.map((article) =>
              [
                article.title,
                formatHumanDate(article.publishedAt),
                getArticleExcerpt(article),
                buildBlogArticleUrl(article.slug)
              ]
                .filter(Boolean)
                .join('\n')
            )
          ].join('\n\n')
        : '',
      normalizeString(issue.productUpdateBody)
        ? `${normalizeString(issue.productUpdateTitle) || 'Product update'}\n${normalizeString(
            issue.productUpdateBody
          )}`
        : '',
      normalizeString(issue.ecosystemInsightBody)
        ? `${normalizeString(issue.ecosystemInsightTitle) || 'Ecosystem insight'}\n${normalizeString(
            issue.ecosystemInsightBody
          )}`
        : '',
      `${ctaLabel}\n${ctaUrl}`,
      `Unsubscribe\n${unsubscribeUrl}`
    ]

    return {
      subject: issue.subject,
      preheader,
      html,
      text: textSections.filter(Boolean).join('\n\n')
    }
  },

  async previewIssue(documentId) {
    const issue = await this.getIssue(documentId)
    return this.renderIssue(issue)
  },

  async sendTest(documentId, to) {
    const normalizedTo = normalizeString(to)
    if (!isValidEmail(normalizedTo)) {
      const error = new Error('A valid test email address is required.')
      error.status = 400
      throw error
    }

    const issue = await this.getIssue(documentId)
    const rendered = this.renderIssue(issue)
    const emailService = strapi.plugin('email')?.service('email')

    if (!emailService) {
      const error = new Error('Email plugin not configured.')
      error.status = 500
      throw error
    }

    await emailService.send({
      to: normalizedTo,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text
    })

    await strapi.documents(uid).update({
      documentId: issue.documentId,
      data: {
        lastTestSentAt: new Date().toISOString()
      }
    })

    return { sent: true, to: normalizedTo }
  },

  async sendIssue(documentId) {
    const issue = await this.getIssue(documentId)
    if (issue.sentAt) {
      const error = new Error('This newsletter issue has already been sent.')
      error.status = 409
      throw error
    }

    const emailService = strapi.plugin('email')?.service('email')
    if (!emailService) {
      const error = new Error('Email plugin not configured.')
      error.status = 500
      throw error
    }

    const subscriberService = strapi.service('api::newsletter-subscriber.newsletter-subscriber')
    const recipients = await subscriberService.getSubscribedRecipients()
    if (!recipients.length) {
      const error = new Error('No subscribed recipients available for this issue.')
      error.status = 400
      throw error
    }

    const failures = []

    for (const recipient of recipients) {
      try {
        const rendered = this.renderIssue(issue, recipient)
        await emailService.send({
          to: recipient.email,
          subject: rendered.subject,
          html: rendered.html,
          text: rendered.text
        })
      } catch (error) {
        failures.push({
          email: recipient.email,
          message: error?.message || 'Unknown email error'
        })
      }
    }

    if (failures.length > 0) {
      const error = new Error('One or more newsletter emails failed to send.')
      error.status = 500
      error.details = failures
      throw error
    }

    await strapi.documents(uid).update({
      documentId: issue.documentId,
      data: {
        sentAt: new Date().toISOString()
      }
    })

    return {
      sentCount: recipients.length,
      failedCount: 0
    }
  }
}))
