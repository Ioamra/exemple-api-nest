import { ConfigProps } from '../common/models/config.model';

export const config = (): ConfigProps => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  api: {
    frontUrl: process.env.FRONT_URL,
    httpTimeout: 1000,
    generatePostmanCollection: process.env.GENERATE_POSTMAN_COLLECTION === 'true' || false,
  },
  salt: process.env.SALT,
  cors: {
    origin: process.env.CORS_ORIGIN,
  },
  database: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 5433,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    databaseName: process.env.DB_NAME,
  },
  jwt: {
    private: process.env.JWT_PRIVATE_KEY,
    public: process.env.JWT_PUBLIC_KEY,
    expiresIn: parseInt(process.env.JWT_EXPIRES_IN, 10) || 3600,
    algorithm: process.env.JWT_ALGORITHM as 'RS256' | 'HS256',
  },
  encryption: {
    password: process.env.PASSWORD_ENCRYPT,
    salt: process.env.SALT_ENCRYPT,
    iv: process.env.IV_ENCRYPT,
  },
  cookie: {
    secret: process.env.COOKIE_SECRET,
    secure: process.env.COOKIE_SECURE === 'true',
    httpOnly: process.env.COOKIE_HTTP_ONLY === 'true',
    domain: process.env.COOKIE_DOMAIN,
    path: process.env.COOKIE_PATH,
  },
  nodemailer: {
    mailDev: process.env.MAIL_DEV,
    host: process.env.SMTP_MAILER,
    port: +process.env.SMTP_PORT!,
    secure: false,
    auth: {
      user: process.env.USER_MAILER,
      pass: process.env.PASS_MAILER,
    },
  },
});
