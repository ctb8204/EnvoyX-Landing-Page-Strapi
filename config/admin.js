module.exports = ({ env }) => ({
  secrets: {
    encryptionKey: env('ENCRYPTION_KEY'),
  },
  auth: {
    secret: env('ADMIN_JWT_SECRET'),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT'),
    },
  },
  flags: {
    nps: env.bool('FLAG_NPS', true),
    promoteEE: env.bool('FLAG_PROMOTE_EE', true),
  },
  preview: {
    enabled: true,
    config: {
      allowedOrigins: env('PREVIEW_ALLOWED_ORIGINS', env('CLIENT_URL', 'http://localhost:3000'))
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
      async handler(uid, { documentId, locale, status }) {
        const baseUrl = env('PREVIEW_BASE_URL', env('CLIENT_URL', 'http://localhost:3000'));
        const secret = env('PREVIEW_SECRET', 'your-preview-secret-token');

        if (uid === 'api::article.article') {
          try {
            const document = await strapi.documents(uid).findOne({
              documentId,
              locale,
              status
            });

            if (!document || !document.slug) {
              console.warn(`Preview: Article ${documentId} not found or missing slug`);
              return null;
            }

            const previewUrl = new URL('/api/preview', baseUrl);
            previewUrl.searchParams.set('secret', secret);
            previewUrl.searchParams.set('slug', document.slug);

            if (locale) {
              previewUrl.searchParams.set('locale', locale);
            }

            return previewUrl.toString();
          } catch (error) {
            console.error('Preview handler error:', error);
            return null;
          }
        }

        if (uid === 'api::newsletter-issue.newsletter-issue') {
          try {
            const document = await strapi.documents(uid).findOne({
              documentId,
              status
            });

            if (!document || !document.documentId) {
              console.warn(`Preview: Newsletter issue ${documentId} not found`);
              return null;
            }

            const previewUrl = new URL('/en/newsletter/preview', baseUrl);
            previewUrl.searchParams.set('secret', secret);
            previewUrl.searchParams.set('documentId', document.documentId);
            return previewUrl.toString();
          } catch (error) {
            console.error('Newsletter preview handler error:', error);
            return null;
          }
        }

        return null;
      },
    }
  },
});
