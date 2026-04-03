'use strict'

const { createCoreService } = require('@strapi/strapi').factories
const {
  createUnsubscribeToken,
  isValidEmail,
  normalizeEmail,
  normalizeString
} = require('../../../utils/newsletter')

const uid = 'api::newsletter-subscriber.newsletter-subscriber'

module.exports = createCoreService(uid, ({ strapi }) => ({
  async findByEmail(email) {
    const normalizedEmail = normalizeEmail(email)
    if (!normalizedEmail) return null

    return strapi.documents(uid).findFirst({
      filters: {
        email: normalizedEmail
      }
    })
  },

  async findByToken(token) {
    const normalizedToken = normalizeString(token)
    if (!normalizedToken) return null

    return strapi.documents(uid).findFirst({
      filters: {
        unsubscribeToken: normalizedToken
      }
    })
  },

  async subscribe(input = {}) {
    const email = normalizeEmail(input.email)
    if (!isValidEmail(email)) {
      const error = new Error('Invalid email address.')
      error.status = 400
      throw error
    }

    const fullName = normalizeString(input.fullName) || null
    const organization = normalizeString(input.organization) || null
    const connectedThrough = normalizeString(input.connectedThrough) || null
    const sourceStatus = normalizeString(input.sourceStatus) || null
    const source = input.source === 'fundraising-tracker' ? 'fundraising-tracker' : 'website'
    const now = new Date().toISOString()

    const existing = await this.findByEmail(email)
    const data = {
      email,
      fullName: fullName || existing?.fullName || null,
      organization: organization || existing?.organization || null,
      source: existing?.source || source,
      sourceStatus: sourceStatus || existing?.sourceStatus || null,
      connectedThrough: connectedThrough || existing?.connectedThrough || null,
      isSubscribed: true,
      subscribedAt: existing?.isSubscribed ? existing.subscribedAt || now : now,
      unsubscribedAt: null,
      unsubscribeToken: existing?.unsubscribeToken || createUnsubscribeToken(),
      sourceMeta: input.sourceMeta ?? existing?.sourceMeta ?? null
    }

    if (existing) {
      const subscriber = await strapi.documents(uid).update({
        documentId: existing.documentId,
        data
      })

      return {
        status: existing.isSubscribed ? 'already-subscribed' : 'reactivated',
        subscriber
      }
    }

    const subscriber = await strapi.documents(uid).create({
      data
    })

    return {
      status: 'created',
      subscriber
    }
  },

  async unsubscribeByToken(token) {
    const normalizedToken = normalizeString(token)
    if (!normalizedToken) {
      return { status: 'not-found', subscriber: null }
    }

    const existing = await this.findByToken(normalizedToken)
    if (!existing) {
      return { status: 'not-found', subscriber: null }
    }

    if (!existing.isSubscribed) {
      return { status: 'already-unsubscribed', subscriber: existing }
    }

    const subscriber = await strapi.documents(uid).update({
      documentId: existing.documentId,
      data: {
        isSubscribed: false,
        unsubscribedAt: new Date().toISOString(),
        unsubscribeToken: existing.unsubscribeToken || createUnsubscribeToken()
      }
    })

    return { status: 'unsubscribed', subscriber }
  },

  async getSubscribedRecipients() {
    return strapi.documents(uid).findMany({
      filters: {
        isSubscribed: true
      },
      sort: ['email:asc']
    })
  }
}))
