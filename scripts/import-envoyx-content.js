'use strict';

const { importEnvoyxContent } = require('./lib/content-import');

async function main() {
  const { createStrapi, compileStrapi } = require('@strapi/strapi');
  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();

  app.log.level = 'error';

  try {
    await importEnvoyxContent(app);
    console.log('EnvoyX content import complete.');
  } finally {
    await app.destroy();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
