module.exports = ({ env }) => {
  const smtpPort = env.int('SMTP_PORT', 587)
  const smtpSecure = env.bool('SMTP_SECURE', smtpPort === 465)
  const defaultFrom =
    env('EMAIL_DEFAULT_FROM') || env('EMAIL_SENDER') || 'no-reply@tryenvoyx.com'
  const defaultReplyTo =
    env('EMAIL_DEFAULT_REPLY_TO') || env('EMAIL_REPLY_TO') || defaultFrom

  return {
    email: {
      config: {
        provider: 'nodemailer',
        providerOptions: {
          host: env('SMTP_HOST'),
          port: smtpPort,
          secure: smtpSecure,
          auth: {
            user: env('SMTP_USERNAME') || env('SMTP_USER'),
            pass: env('SMTP_PASSWORD') || env('SMTP_PASS')
          },
          requireTLS: env.bool('SMTP_REQUIRE_TLS', !smtpSecure),
          connectionTimeout: env.int('SMTP_CONNECTION_TIMEOUT', 10000),
          greetingTimeout: env.int('SMTP_GREETING_TIMEOUT', 10000),
          socketTimeout: env.int('SMTP_SOCKET_TIMEOUT', 10000),
          logger: env.bool('SMTP_LOGGER', false),
          debug: env.bool('SMTP_DEBUG', false)
        },
        settings: {
          defaultFrom,
          defaultReplyTo
        }
      }
    }
  }
}
