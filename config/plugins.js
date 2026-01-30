module.exports = ({ env }) => {
  const provider = env(
    'EMAIL_PROVIDER',
    env('SMTP_HOST') ? 'nodemailer' : 'sendmail'
  );

  const providerOptions =
    provider === 'sendgrid'
      ? { apiKey: env('SENDGRID_API_KEY') }
      : provider === 'nodemailer'
        ? {
            host: env('SMTP_HOST'),
            port: env.int('SMTP_PORT', 587),
            secure: env.bool('SMTP_SECURE', false),
            auth: {
              user: env('SMTP_USERNAME') || env('SMTP_USER'),
              pass: env('SMTP_PASSWORD') || env('SMTP_PASS')
            }
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
