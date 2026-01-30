module.exports = ({ env }) => {
  const provider = env(
    'EMAIL_PROVIDER',
    env('SMTP_HOST') ? 'nodemailer' : 'sendmail'
  );

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
