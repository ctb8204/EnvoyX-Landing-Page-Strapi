'use strict';

const { seedExampleApp } = require('../scripts/lib/content-import');

module.exports = async ({ strapi }) => {
  await seedExampleApp(strapi);
};
