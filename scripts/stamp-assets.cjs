'use strict';
// Rewrites the ?v= cache-busting stamps in index.html to the first 10 hex characters of each
// referenced file's SHA-256, then writes the offline service worker's VERSION and ASSETS list.
// Run after editing any script or stylesheet:  npm run stamp      (check only: --check)
// APP_DIST=<dir> stamps another copy of the app (used by the production build).
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const dist = path.resolve(process.env.APP_DIST || path.resolve(__dirname, '../dist'));
const file = path.join(dist, 'index.html');
const hash = buf => crypto.createHash('sha256').update(buf).digest('hex').slice(0, 10);
const html = fs.readFileSync(file, 'utf8');
let changed = 0;
const assets = [];
const out = html.replace(/(src|href)="([\w.-]+\.(?:js|css))(?:\?v=[\w]+)?"/g, (m, attr, name) => {
  const full = path.join(dist, name);
  if (!fs.existsSync(full)) throw Error('Missing asset referenced by index.html: ' + name);
  const v = hash(fs.readFileSync(full));
  const next = `${attr}="${name}?v=${v}"`;
  assets.push(`${name}?v=${v}`);
  if (next !== m) changed++;
  return next;
});
// Service worker: cache the shell files plus the manifest and icon; the version follows their content.
const extra = ['manifest.webmanifest', 'icon.svg'].filter(n => fs.existsSync(path.join(dist, n)));
const swFile = path.join(dist, 'sw.js');
let swChanged = false,
  swOut = null;
if (fs.existsSync(swFile)) {
  const sw = fs.readFileSync(swFile, 'utf8');
  const list = [...assets, ...extra];
  const version = hash(Buffer.from(out + list.join('\n')));
  swOut = sw
    .replace(/const VERSION = '[^']*';/, `const VERSION = '${version}';`)
    .replace(/const ASSETS = \[[^\]]*\];/, `const ASSETS = ${JSON.stringify(list)};`);
  swChanged = swOut !== sw;
}
if (process.argv.includes('--check')) {
  if (changed || swChanged) {
    console.error(
      `${changed} asset stamp(s)${swChanged ? ' and the service worker list' : ''} are stale. Run: npm run stamp`
    );
    process.exit(1);
  }
  console.log('Asset stamps are current.');
} else {
  fs.writeFileSync(file, out);
  if (swOut !== null) fs.writeFileSync(swFile, swOut);
  console.log(`Updated ${changed} asset stamp(s)${swChanged ? ' and the service worker list' : ''}.`);
}
