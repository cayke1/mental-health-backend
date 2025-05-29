import { z } from 'zod';

const cleanQuotes = (val: string) => val.replace(/^['"]|['"]$/g, '');

const schema = z.object({
  R2_ENDPOINT: z.string().url(),
  R2_ACCESS_KEY_ID: z.string(),
  R2_SECRET_ACCESS_KEY: z.string(),
  R2_BUCKET: z.string(),
  CDN_URL: z.string().url(),
  EMAIL_FROM: z.string().transform(cleanQuotes),
  QSTASH_TOKEN: z.string().transform(cleanQuotes),
  FRONTEND_URL: z.string().url(),
  RESEND_API_KEY: z.string(),
  DISCORD_LOG_PROJECT_ID: z.string(),
  DISCORD_LOG_WEBHOOK_URL: z.string().url(),
});

export const env = schema.parse(process.env);
