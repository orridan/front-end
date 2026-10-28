/**
 * Local static server that mimics the production .htaccess closely enough for Lighthouse:
 * brotli/gzip compression, /route served from route.html, SPA fallback, 404.html, long cache
 * for /assets/ and no-cache for HTML, plus the same security headers.
 * Usage: tsx scripts/serve-dist.ts [dir] [port]
 */
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';
import { brotliCompressSync, gzipSync } from 'node:zlib';

const dir = resolve(process.argv[2] ?? 'dist');
const port = Number(process.argv[3] ?? 4320);

const types: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
};
const compressible = new Set(['.html', '.js', '.css', '.svg', '.json', '.webmanifest', '.xml', '.txt']);
const cache = new Map<string, { raw: Buffer; br?: Buffer; gz?: Buffer }>();

function resolveFile(urlPath: string): { file: string; status: number } {
  const clean = normalize(decodeURIComponent(urlPath.split('?')[0])).replace(/^([/\\])+/, '');
  const direct = join(dir, clean);
  if (!direct.startsWith(dir)) return { file: join(dir, '404.html'), status: 404 };
  if (existsSync(direct) && statSync(direct).isFile()) return { file: direct, status: 200 };
  if (existsSync(direct) && statSync(direct).isDirectory() && existsSync(join(direct, 'index.html'))) return { file: join(direct, 'index.html'), status: 200 };
  if (existsSync(`${direct}.html`)) return { file: `${direct}.html`, status: 200 };
  if (clean.startsWith('api/') || /\.[A-Za-z0-9]{2,8}$/.test(clean)) return { file: join(dir, '404.html'), status: 404 };
  return { file: join(dir, 'index.html'), status: 200 };
}

createServer((req, res) => {
  const { file, status } = resolveFile(req.url ?? '/');
  const ext = extname(file);
  let entry = cache.get(file);
  if (!entry) {
    entry = { raw: readFileSync(file) };
    if (compressible.has(ext)) {
      entry.br = brotliCompressSync(entry.raw);
      entry.gz = gzipSync(entry.raw);
    }
    cache.set(file, entry);
  }
  const accept = String(req.headers['accept-encoding'] ?? '');
  let body = entry.raw;
  if (entry.br && accept.includes('br')) {
    body = entry.br;
    res.setHeader('Content-Encoding', 'br');
  } else if (entry.gz && accept.includes('gzip')) {
    body = entry.gz;
    res.setHeader('Content-Encoding', 'gzip');
  }
  res.setHeader('Content-Type', types[ext] ?? 'application/octet-stream');
  res.setHeader('Vary', 'Accept-Encoding');
  res.setHeader(
    'Cache-Control',
    ext === '.html' ? 'no-cache' : (req.url ?? '').startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'public, max-age=2592000',
  );
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.statusCode = status;
  res.end(req.method === 'HEAD' ? undefined : body);
}).listen(port, () => console.log(`serving ${dir} on http://localhost:${port}`));
