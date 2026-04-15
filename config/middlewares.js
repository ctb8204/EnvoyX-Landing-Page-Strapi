module.exports = [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  {
    name: 'strapi::body',
    config: {
      formLimit: '20mb',
      jsonLimit: '20mb',
      textLimit: '20mb',
      formidable: {
        maxFileSize: 20 * 1024 * 1024,
      },
    },
  },
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
