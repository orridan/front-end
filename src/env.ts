/**
 * Public environment values. In the browser Vite injects import.meta.env at build time.
 * Node build scripts import content.ts too, so we fall back to process.env there
 * (scripts load .env with process.loadEnvFile before importing).
 */
type Env = Record<string, string | undefined>;

const viteEnv = import.meta.env as unknown as (Env & { PROD?: boolean }) | undefined;
const nodeEnv = (globalThis as { process?: { env: Env } }).process?.env ?? {};

export const env: Env = viteEnv ?? nodeEnv;

export function readEnv(key: string, fallback = ''): string {
  const value = env[key];
  return typeof value === 'string' ? value.trim() : fallback;
}

export const isProd = Boolean(viteEnv?.PROD);
