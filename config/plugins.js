module.exports = ({ env }) => {
  const explicitProvider = env('EMAIL_PROVIDER');
  const hasSmtp = Boolean(env('SMTP_HOST'));
  let provider = explicitProvider || (hasSmtp ? 'nodemailer' : 'sendmail');

  const resolveProvider = (name) => {
    try {
      require.resolve(`@strapi/provider-email-${name}`);
      return true;
    } catch (error) {
      return false;
    }
  };

  if (explicitProvider === 'sendgrid' && hasSmtp) {
    // Prefer nodemailer when SMTP settings are present.
    provider = 'nodemailer';
    // eslint-disable-next-line no-console
    console.warn(
      '[email] EMAIL_PROVIDER=sendgrid ignored because SMTP_HOST is set. Using nodemailer.'
    );
  }

  if (!resolveProvider(provider)) {
    const fallback = hasSmtp ? 'nodemailer' : 'sendmail';
    // eslint-disable-next-line no-console
    console.warn(
      `[email] Provider "${provider}" not found. Falling back to "${fallback}".`
    );
    provider = fallback;
  }

  const smtpPort = env.int('SMTP_PORT', 587);
  const smtpSecure = env.bool('SMTP_SECURE', smtpPort === 465);
  const smtpUser = env('SMTP_USERNAME') || env('SMTP_USER');
  const smtpPass = env('SMTP_PASSWORD') || env('SMTP_PASS');

  const providerOptions =
    provider === 'sendgrid'
      ? { apiKey: env('SENDGRID_API_KEY') }
      : provider === 'nodemailer'
        ? {
            host: env('SMTP_HOST'),
            port: smtpPort,
            secure: smtpSecure,
            auth: {
              user: smtpUser,
              pass: smtpPass
            },
            requireTLS: env.bool('SMTP_REQUIRE_TLS', !smtpSecure),
            connectionTimeout: env.int('SMTP_CONNECTION_TIMEOUT', 10000),
            greetingTimeout: env.int('SMTP_GREETING_TIMEOUT', 10000),
            socketTimeout: env.int('SMTP_SOCKET_TIMEOUT', 10000),
            logger: env.bool('SMTP_LOGGER', false),
            debug: env.bool('SMTP_DEBUG', false)
          }
        : {};

  const defaultFrom =
    env('EMAIL_DEFAULT_FROM') || env('EMAIL_SENDER') || 'no-reply@tryenvoyx.com';
  const defaultReplyTo =
    env('EMAIL_DEFAULT_REPLY_TO') || env('EMAIL_REPLY_TO') || defaultFrom;

  return {
    ckeditor5: {
      enabled: true,
    },
    email: {
      config: {
        provider,
        providerOptions,
        settings: {
          defaultFrom,
          defaultReplyTo
        }
      }
    }
  };
};
