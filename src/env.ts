import { z } from 'zod';

const schema = z.object({
  R2_ENDPOINT: z.string().url(),
  R2_ACCESS_KEY_ID: z.string(),
  R2_SECRET_ACCESS_KEY: z.string(),
  R2_BUCKET: z.string(),
  CDN_URL: z.string().url(),
  EMAIL_FROM: z.string(),
});

export const env = schema.parse(process.env);
