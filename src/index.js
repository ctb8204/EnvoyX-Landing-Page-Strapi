'use strict';
const bootstrap = require("./bootstrap");

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register({ strapi }) {
    strapi.server.routes([
      {
        method: 'GET',
        path: '/healthz',
        handler(ctx) {
          ctx.body = { ok: true };
        },
        config: {
          auth: false,
        },
      },
      {
        method: 'GET',
        path: '/healthz/db',
        async handler(ctx) {
          const timeoutMs = 2000;
          const timeout = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('DB timeout')), timeoutMs);
          });

          try {
            await Promise.race([
              strapi.db.connection.raw('select 1'),
              timeout,
            ]);
            ctx.body = { ok: true };
          } catch (error) {
            ctx.status = 500;
            ctx.body = {
              ok: false,
              message: error instanceof Error ? error.message : 'DB error',
            };
          }
        },
        config: {
          auth: false,
        },
      },
    ]);
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap,
};
