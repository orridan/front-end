/**
 * Generates every brand asset from one source of truth:
 *  - public/brand/logo-light.svg, logo-dark.svg, mark.svg (wordmark converted to paths, so the
 *    Sora display font renders identically everywhere, even inside rasterisers)
 *  - favicon.svg, favicon.ico (16, 32, 48), apple-touch-icon.png, icon-192.png, icon-512.png,
 *    icon-maskable-512.png, site.webmanifest
 *  - og-image.png (1200x630)
 *  - brand/grain.svg (texture used by .atmosphere)
 *  - fonts copied from @fontsource into public/fonts (self-hosted, no third-party request)
 */
import { copyFileSync, mkdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import opentype from 'opentype.js';
import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pub = join(root, 'public');
const brandDir = join(pub, 'brand');
const fontsDir = join(pub, 'fonts');
mkdirSync(brandDir, { recursive: true });
mkdirSync(fontsDir, { recursive: true });

const C1 = '#021A54';
const C2 = '#FF85BB';
const C3 = '#FFCEE3';
const C4 = '#F5F5F5';

/* ================================================================ fonts */

const fontFiles: [string, string][] = [
  // Sora is only used at build time for the logo wordmark paths (from the .woff below).
  ['@fontsource/big-shoulders-display/files', 'big-shoulders-display-latin-600-normal.woff2'],
  ['@fontsource/big-shoulders-display/files', 'big-shoulders-display-latin-700-normal.woff2'],
  ['@fontsource/inter/files', 'inter-latin-400-normal.woff2'],
  ['@fontsource/inter/files', 'inter-latin-500-normal.woff2'],
  ['@fontsource/inter/files', 'inter-latin-600-normal.woff2'],
  ['@fontsource/jetbrains-mono/files', 'jetbrains-mono-latin-400-normal.woff2'],
  ['@fontsource/jetbrains-mono/files', 'jetbrains-mono-latin-500-normal.woff2'],
];
for (const [dir, file] of fontFiles) {
  copyFileSync(join(root, 'node_modules', dir, file), join(fontsDir, file));
}

function loadFont(pkgPath: string): opentype.Font {
  const buf = readFileSync(join(root, 'node_modules', pkgPath));
  return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer);
}
const sora = loadFont('@fontsource/sora/files/sora-latin-600-normal.woff');
const inter = loadFont('@fontsource/inter/files/inter-latin-400-normal.woff');
const mono = loadFont('@fontsource/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff');

/** opentype.js toPathData can emit NaN for some coordinates, so serialise commands directly. */
function serialisePath(path: opentype.Path): string {
  const n = (v: number) => {
    if (!Number.isFinite(v)) throw new Error('Non-finite coordinate in glyph path');
    return (Math.round(v * 100) / 100).toString();
  };
  return path.commands
    .map((c) => {
      switch (c.type) {
        case 'M':
        case 'L':
          return `${c.type}${n(c.x)} ${n(c.y)}`;
        case 'Q':
          return `Q${n(c.x1)} ${n(c.y1)} ${n(c.x)} ${n(c.y)}`;
        case 'C':
          return `C${n(c.x1)} ${n(c.y1)} ${n(c.x2)} ${n(c.y2)} ${n(c.x)} ${n(c.y)}`;
        default:
          return 'Z';
      }
    })
    .join('');
}

/**
 * Lays glyphs out by hand (advance width plus kerning). opentype.js's shaper cannot read
 * Inter's GSUB table, and none of these strings need ligatures.
 */
function textPath(font: opentype.Font, text: string, x: number, baseline: number, size: number, letterSpacing = 0) {
  const scale = size / font.unitsPerEm;
  const path = new opentype.Path();
  let cursor = x;
  let prev: opentype.Glyph | null = null;
  for (const ch of text) {
    const glyph = font.charToGlyph(ch);
    if (prev) {
      try {
        const kern = font.getKerningValue(prev, glyph);
        if (Number.isFinite(kern)) cursor += kern * scale;
      } catch {
        // no kerning data
      }
    }
    path.extend(glyph.getPath(cursor, baseline, size));
    cursor += (glyph.advanceWidth ?? 0) * scale + letterSpacing * size;
    prev = glyph;
  }
  return { d: serialisePath(path), width: cursor - x, box: path.getBoundingBox() };
}

/* ================================================================ mark */

function arc(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const rad = (d: number) => ((d - 90) * Math.PI) / 180;
  const sx = cx + r * Math.cos(rad(startDeg));
  const sy = cy + r * Math.sin(rad(startDeg));
  const ex = cx + r * Math.cos(rad(endDeg));
  const ey = cy + r * Math.sin(rad(endDeg));
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M${sx.toFixed(2)} ${sy.toFixed(2)}A${r} ${r} 0 ${large} 1 ${ex.toFixed(2)} ${ey.toFixed(2)}`;
}

/** The ring mark drawn in a 64x64 box. `ink` is the ring colour for the surface it sits on. */
function markGroup(ink: string, idSuffix: string): { defs: string; body: string } {
  const defs = `
    <radialGradient id="core${idSuffix}" cx="50%" cy="45%" r="55%">
      <stop offset="0" stop-color="${C3}"/>
      <stop offset="0.55" stop-color="${C2}"/>
      <stop offset="1" stop-color="${C2}" stop-opacity="0.9"/>
    </radialGradient>`;
  const ticks = [0, 90, 180, 270]
    .map((deg) => {
      const r1 = 29.5;
      const r2 = 31.5;
      const a = ((deg - 90) * Math.PI) / 180;
      return `<line x1="${(32 + r1 * Math.cos(a)).toFixed(2)}" y1="${(32 + r1 * Math.sin(a)).toFixed(2)}" x2="${(32 + r2 * Math.cos(a)).toFixed(2)}" y2="${(32 + r2 * Math.sin(a)).toFixed(2)}" stroke="${ink}" stroke-width="2" stroke-linecap="round"/>`;
    })
    .join('');
  const body = `
    <circle cx="32" cy="32" r="25" fill="none" stroke="${ink}" stroke-opacity="0.35" stroke-width="2"/>
    <path d="${arc(32, 32, 25, -50, 95)}" fill="none" stroke="${C2}" stroke-width="4.5" stroke-linecap="round"/>
    <path d="${arc(32, 32, 25, 140, 215)}" fill="none" stroke="${ink}" stroke-width="4.5" stroke-linecap="round"/>
    <path d="${arc(32, 32, 16.5, 170, 330)}" fill="none" stroke="${C2}" stroke-width="3.5" stroke-linecap="round"/>
    <path d="${arc(32, 32, 16.5, 20, 120)}" fill="none" stroke="${ink}" stroke-opacity="0.8" stroke-width="3.5" stroke-linecap="round"/>
    <circle cx="32" cy="32" r="7.5" fill="url(#core${idSuffix})"/>
    ${ticks}`;
  return { defs, body };
}

function markSvg(ink: string, background?: { fill: string; rx: number; pad: number; size: number }): string {
  const { defs, body } = markGroup(ink, 'm');
  if (!background) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><defs>${defs}</defs>${body}</svg>\n`;
  }
  const { fill, rx, pad, size } = background;
  const scale = (size - pad * 2) / 64;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}"><defs>${defs}</defs><rect width="${size}" height="${size}" rx="${rx}" fill="${fill}"/><g transform="translate(${pad} ${pad}) scale(${scale})">${body}</g></svg>\n`;
}

/* ================================================================ logo */

const LOGO_H = 40;
const MARK = 40;
const GAP = 10;
const WORD_SIZE = 25;
const word = textPath(sora, 'Orridan', 0, 0, WORD_SIZE, -0.01);
const wordX = MARK + GAP - word.box.x1;
const capTop = word.box.y1;
const capBottom = word.box.y2;
const baseline = LOGO_H / 2 - (capTop + capBottom) / 2;
const logoW = Math.ceil(MARK + GAP + (word.box.x2 - word.box.x1) + 2);
const wordPath = textPath(sora, 'Orridan', wordX, baseline, WORD_SIZE, -0.01).d;

function logoSvg(textColor: string, ringInk: string): string {
  const { defs, body } = markGroup(ringInk, 'l');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${logoW} ${LOGO_H}" width="${logoW}" height="${LOGO_H}" role="img" aria-label="Orridan"><title>Orridan</title><defs>${defs}</defs><g transform="scale(${MARK / 64})">${body}</g><path d="${wordPath}" fill="${textColor}"/></svg>\n`;
}

const logoLight = logoSvg(C4, C3); // for navy backgrounds
const logoDark = logoSvg(C1, C1); // for light backgrounds
writeFileSync(join(brandDir, 'logo-light.svg'), logoLight);
writeFileSync(join(brandDir, 'logo-dark.svg'), logoDark);
writeFileSync(join(brandDir, 'mark.svg'), markSvg(C3));
writeFileSync(join(brandDir, 'logo-meta.json'), JSON.stringify({ width: logoW, height: LOGO_H }, null, 2) + '\n');

/* ================================================================ grain */

writeFileSync(
  join(brandDir, 'grain.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 0.807  0 0 0 0 0.89  0 0 0 0.9 0"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>\n`,
);

/* ================================================================ favicons */

/*
 * The client's favicon.svg is the source when there is one. A new favicon.svg dropped into public/
 * is kept in assets-source/favicon.svg, so this script never overwrites it. Without one, the mark
 * is generated (tagged with data-generator so it is recognised as generated next time).
 */
const clientFavicon = join(root, 'assets-source', 'favicon.svg');
const publicFavicon = join(pub, 'favicon.svg');
const isGenerated = (svg: string) => svg.includes('data-generator="orridan-brand"') || svg.includes('id="corem"');
// A favicon dropped into public/ counts as new only when it differs from the source and is newer.
const droppedFavicon =
  existsSync(publicFavicon) &&
  !isGenerated(readFileSync(publicFavicon, 'utf8')) &&
  (!existsSync(clientFavicon) ||
    (readFileSync(publicFavicon, 'utf8') !== readFileSync(clientFavicon, 'utf8') && statSync(publicFavicon).mtimeMs > statSync(clientFavicon).mtimeMs));
if (droppedFavicon) {
  mkdirSync(dirname(clientFavicon), { recursive: true });
  copyFileSync(publicFavicon, clientFavicon);
}
const hasClientFavicon = existsSync(clientFavicon);
const faviconSvg = hasClientFavicon
  ? readFileSync(clientFavicon, 'utf8')
  : markSvg(C3, { fill: C1, rx: 14, pad: 2, size: 64 }).replace('<svg ', '<svg data-generator="orridan-brand" ');
writeFileSync(publicFavicon, faviconSvg);

async function png(svg: string, size: number): Promise<Buffer> {
  return sharp(Buffer.from(svg), { density: 384 })
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/** Square icon on a solid navy background with padding (apple-touch and maskable icons). */
async function fullBleed(padRatio: number, size = 512): Promise<Buffer> {
  if (!hasClientFavicon) return png(markSvg(C3, { fill: C1, rx: 0, pad: Math.round(size * padRatio), size }), size);
  const inner = size - 2 * Math.round(size * padRatio);
  return sharp({ create: { width: size, height: size, channels: 4, background: C1 } })
    .composite([{ input: await png(faviconSvg, inner), gravity: 'centre' }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

function ico(images: { size: number; data: Buffer }[]): Buffer {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  const entries: Buffer[] = [];
  let offset = 6 + 16 * images.length;
  for (const img of images) {
    const e = Buffer.alloc(16);
    e.writeUInt8(img.size >= 256 ? 0 : img.size, 0);
    e.writeUInt8(img.size >= 256 ? 0 : img.size, 1);
    e.writeUInt8(0, 2);
    e.writeUInt8(0, 3);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(img.data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += img.data.length;
    entries.push(e);
  }
  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

/* ================================================================ OG image */

function ogSvg(): string {
  const W = 1200;
  const H = 630;
  const { defs, body } = markGroup(C3, 'o');
  const head1 = textPath(sora, 'One record for every', 80, 300, 54, -0.01);
  const head2 = textPath(sora, 'asset, twin and simulation.', 80, 370, 54, -0.01);
  const sub = textPath(inter, 'Industrial Digital Twins & Simulation Intelligence', 80, 450, 28);
  const domain = textPath(mono, 'orridan.net', 100, 557, 24, 0.02);
  const logoScale = 1.6;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    ${defs}
    <radialGradient id="bgGlow" cx="84%" cy="50%" r="50%">
      <stop offset="0" stop-color="${C2}" stop-opacity="0.45"/>
      <stop offset="0.45" stop-color="${C2}" stop-opacity="0.12"/>
      <stop offset="1" stop-color="${C1}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="vig" cx="50%" cy="50%" r="75%">
      <stop offset="0.6" stop-color="${C1}" stop-opacity="0"/>
      <stop offset="1" stop-color="${C1}" stop-opacity="0.9"/>
    </radialGradient>
    <filter id="glow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="10"/></filter>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="${C3}" stroke-opacity="0.06"/></pattern>
  </defs>
  <rect width="${W}" height="${H}" fill="${C1}"/>
  <rect width="${W}" height="${H}" fill="url(#grid)"/>
  <rect width="${W}" height="${H}" fill="url(#bgGlow)"/>
  <g transform="translate(${W - 375} 135) scale(${350 / 64})">
    <g filter="url(#glow)" opacity="0.8">${body}</g>
    ${body}
  </g>
  <rect width="${W}" height="${H}" fill="url(#vig)"/>
  <g transform="translate(80 92) scale(${logoScale})">
    <g transform="scale(${MARK / 64})">${markGroup(C3, 'o2').body}</g>
    <path d="${wordPath}" fill="${C4}"/>
  </g>
  <path d="${head1.d}" fill="${C4}"/>
  <path d="${head2.d}" fill="${C2}"/>
  <path d="${sub.d}" fill="${C3}"/>
  <rect x="80" y="520" width="${domain.width + 40}" height="56" rx="28" fill="${C3}" fill-opacity="0.08" stroke="${C3}" stroke-opacity="0.35"/>
  <path d="${domain.d}" fill="${C3}"/>
  </svg>`;
}

/* ================================================================ write */

async function main() {
  const p16 = await png(faviconSvg, 16);
  const p32 = await png(faviconSvg, 32);
  const p48 = await png(faviconSvg, 48);
  writeFileSync(join(pub, 'favicon.ico'), ico([
    { size: 16, data: p16 },
    { size: 32, data: p32 },
    { size: 48, data: p48 },
  ]));
  writeFileSync(join(pub, 'apple-touch-icon.png'), await fullBleed(0.14, 180));
  writeFileSync(join(pub, 'icon-192.png'), await png(faviconSvg, 192));
  writeFileSync(join(pub, 'icon-512.png'), await png(faviconSvg, 512));
  // Maskable: content kept inside the central 80% safe zone.
  writeFileSync(join(pub, 'icon-maskable-512.png'), await fullBleed(0.22, 512));

  const ogMarkup = ogSvg();
  for (const [name, markup] of [['og', ogMarkup], ['logo-light', logoLight], ['logo-dark', logoDark], ['favicon', faviconSvg]]) {
    if (/NaN|undefined/.test(markup)) throw new Error(`Invalid path data in ${name}: ${markup.slice(markup.search(/NaN|undefined/) - 80, markup.search(/NaN|undefined/) + 20)}`);
  }
  const og = await sharp(Buffer.from(ogMarkup)).resize(1200, 630).png({ compressionLevel: 9 }).toBuffer();
  writeFileSync(join(pub, 'og-image.png'), og);

  const manifest = {
    name: 'Orridan',
    short_name: 'Orridan',
    description: 'Records and management for industrial digital twins.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: C1,
    theme_color: C1,
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
  };
  writeFileSync(join(pub, 'site.webmanifest'), JSON.stringify(manifest, null, 2) + '\n');

  const expected = [
    'favicon.svg', 'favicon.ico', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png',
    'site.webmanifest', 'og-image.png', 'brand/logo-light.svg', 'brand/logo-dark.svg', 'brand/mark.svg', 'brand/grain.svg',
    ...fontFiles.map(([, f]) => `fonts/${f}`),
  ];
  const missing = expected.filter((f) => !existsSync(join(pub, f)));
  if (missing.length) {
    console.error('Brand generation failed, missing:', missing.join(', '));
    process.exit(1);
  }
  console.log(`Brand assets generated (${expected.length} files). Logo ${logoW}x${LOGO_H}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
