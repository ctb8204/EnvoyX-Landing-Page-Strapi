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
    allowedOrigins: env('PREVIEW_ALLOWED_ORIGINS', 'http://localhost:3000').split(','),
    async handler(uid, { documentId, locale, status }) {
      const baseUrl = env('PREVIEW_BASE_URL', 'http://localhost:3000');
      const secret = env('PREVIEW_SECRET', 'your-preview-secret-token');

      // Handle article previews
      if (uid === 'api::article.article') {
        try {
          // Fetch the article to get its slug
          const document = await strapi.documents(uid).findOne({
            documentId,
            locale,
            status
          });

          if (!document || !document.slug) {
            console.warn(`Preview: Article ${documentId} not found or missing slug`);
            return null;
          }

          // Generate preview URL: /api/preview?secret=...&slug=...
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

      // For other content types, return null (no preview available)
      return null;
    },
  },
});
