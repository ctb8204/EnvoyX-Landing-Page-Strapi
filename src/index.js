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
      {
        method: 'GET',
        path: '/email/test',
        async handler(ctx) {
          const secret = process.env.EMAIL_TEST_SECRET;
          if (secret && ctx.query.secret !== secret) {
            ctx.status = 401;
            ctx.body = { ok: false, message: 'Unauthorized' };
            return;
          }

          const emailService = strapi.plugin('email')?.service('email');
          if (!emailService) {
            ctx.status = 500;
            ctx.body = { ok: false, message: 'Email plugin not configured' };
            return;
          }

          const to = String(ctx.query.to || process.env.EMAIL_TEST_TO || '').trim();
          if (!to) {
            ctx.status = 400;
            ctx.body = { ok: false, message: 'Missing "to" query param' };
            return;
          }

          try {
            await emailService.send({
              to,
              subject: 'EnvoyX email test',
              text: 'This is a test email from Strapi.'
            });
            ctx.body = { ok: true, to };
          } catch (error) {
            const responseData =
              error && typeof error === 'object' ? error.response?.data : null;
            const responseStatus =
              error && typeof error === 'object' ? error.response?.status : null;
            let details = 'Unknown email error';

            if (responseData) {
              details =
                typeof responseData === 'string'
                  ? responseData
                  : JSON.stringify(responseData);
            } else if (error && typeof error === 'object' && error.message) {
              details = error.message;
            }

            if (responseStatus) {
              details = `status ${responseStatus}: ${details}`;
            }

            ctx.status = 500;
            ctx.body = { ok: false, message: details };
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
