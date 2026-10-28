/**
 * npm run check:dashes
 * Fails if an em dash (U+2014), an en dash (U+2013) or a double hyphen used as a dash appears
 * in src/, public/ or index.html.
 *
 * Allowed double hyphens (code syntax, not prose): CSS custom properties such as var(--c1) or
 * "--c1: #021A54", HTML comment markers, and decrement operators such as i--;
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, relative, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const targets = ['src', 'public', 'index.html'];
const textExt = new Set(['.ts', '.tsx', '.js', '.css', '.html', '.txt', '.xml', '.json', '.webmanifest', '.svg', '.php', '.md', '']);

function walk(p: string, out: string[]) {
  const st = statSync(p);
  if (st.isDirectory()) {
    for (const name of readdirSync(p)) walk(join(p, name), out);
  } else if (textExt.has(extname(p).toLowerCase()) || p.endsWith('.htaccess')) {
    out.push(p);
  }
}

const files: string[] = [];
for (const t of targets) walk(join(root, t), files);

const DASH_CHARS = /[—–]/g;

/** True when the "--" at index i is code syntax rather than a prose dash. */
function isAllowedDoubleHyphen(line: string, i: number): boolean {
  const before = line.slice(0, i);
  const after = line.slice(i + 2);
  if (before.endsWith('<!') || after.startsWith('>')) return true; // HTML comments
  if (/^[;),\]]/.test(after) && /[\w\])]$/.test(before)) return true; // i--; or x--)
  // CSS custom property: --name followed by ":" ")" "," or a closing quote, preceded by
  // start of line, whitespace, "(", quote, "[", "{", ",", ";"
  const prop = /^[a-zA-Z_][\w-]*(?=\s*[:),'"\]]|\s*$)/.exec(after);
  if (prop && (before === '' || /[\s(['"{,;]$/.test(before))) return true;
  return false;
}

const problems: string[] = [];
for (const file of files) {
  const text = readFileSync(file, 'utf8');
  const lines = text.split(/\r?\n/);
  lines.forEach((line, n) => {
    for (const m of line.matchAll(DASH_CHARS)) {
      problems.push(`${relative(root, file)}:${n + 1}:${(m.index ?? 0) + 1}  "${m[0] === '—' ? 'em dash' : 'en dash'}"  ${line.trim().slice(0, 100)}`);
    }
    let idx = line.indexOf('--');
    while (idx !== -1) {
      // Treat runs of three or more hyphens (for example "---") as a single occurrence.
      let end = idx;
      while (line[end] === '-') end += 1;
      const run = end - idx;
      if (run === 2 && !isAllowedDoubleHyphen(line, idx)) {
        problems.push(`${relative(root, file)}:${n + 1}:${idx + 1}  "--"  ${line.trim().slice(0, 100)}`);
      } else if (run > 2) {
        problems.push(`${relative(root, file)}:${n + 1}:${idx + 1}  "${'-'.repeat(run)}"  ${line.trim().slice(0, 100)}`);
      }
      idx = line.indexOf('--', end);
    }
  });
}

if (problems.length) {
  console.error(`check:dashes found ${problems.length} problem(s):\n  ${problems.join('\n  ')}`);
  process.exit(1);
}
console.log(`check:dashes OK (${files.length} files scanned, no em dashes or prose double hyphens).`);
