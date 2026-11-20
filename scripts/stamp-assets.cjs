'use strict';
// Rewrites the ?v= cache-busting stamps in dist/index.html to the first 10 hex characters
// of each referenced file's SHA-256. Run after editing any script or stylesheet.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const dist = path.resolve(__dirname, '../dist');
const file = path.join(dist, 'index.html');
const html = fs.readFileSync(file, 'utf8');
let changed = 0;
const out = html.replace(/(src|href)="([\w.-]+\.(?:js|css))(?:\?v=[\w]+)?"/g, (m, attr, name) => {
  const full = path.join(dist, name);
  if (!fs.existsSync(full)) throw Error('Missing asset referenced by index.html: ' + name);
  const v = crypto.createHash('sha256').update(fs.readFileSync(full)).digest('hex').slice(0, 10);
  const next = `${attr}="${name}?v=${v}"`;
  if (next !== m) changed++;
  return next;
});
if (process.argv.includes('--check')) {
  if (changed) {
    console.error(`${changed} asset stamp(s) are stale. Run: npm run stamp`);
    process.exit(1);
  }
  console.log('Asset stamps are current.');
} else {
  fs.writeFileSync(file, out);
  console.log(`Updated ${changed} asset stamp(s).`);
}
