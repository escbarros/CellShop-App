import { z } from 'zod';

const MIN_PORT = 1;
const MAX_PORT = 65535;

const environmentSchema = z.object({
  PORT: z.coerce.number().int().min(MIN_PORT).max(MAX_PORT),
  CORS_ORIGIN: z.string().trim().min(1),
  CHAOS_ENABLED: z.enum(['true', 'false']).transform((value) => value === 'true'),
  IMAGES_BASE_URL: z.string().trim().min(1),
});

export type Environment = z.infer<typeof environmentSchema>;

export function validateEnvironment(raw: Record<string, unknown>): Environment {
  const result = environmentSchema.safeParse(raw);

  if (result.success) {
    return result.data;
  }

  const issues = result.error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join('\n  ');

  throw new Error(`Invalid environment configuration:\n  ${issues}`);
}
