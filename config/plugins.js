module.exports = ({ env }) => {
    const provider = env('EMAIL_PROVIDER', 'sendmail');
    const providerOptions =
        provider === 'sendgrid'
            ? { apiKey: env('SENDGRID_API_KEY') }
            : provider === 'nodemailer'
                ? {
                    host: env('SMTP_HOST'),
                    port: env.int('SMTP_PORT', 587),
                    secure: env.bool('SMTP_SECURE', false),
                    auth: {
                        user: env('SMTP_USERNAME'),
                        pass: env('SMTP_PASSWORD')
                    }
                }
                : {};

    return {
        email: {
            config: {
                provider,
                providerOptions,
                settings: {
                    defaultFrom: env('EMAIL_DEFAULT_FROM', 'ifunanya@tryenvoyx.com'),
                    defaultReplyTo: env('EMAIL_DEFAULT_REPLY_TO', 'ifunanya@tryenvoyx.com')
                }
            }
        }
    };
};
