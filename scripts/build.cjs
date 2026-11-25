'use strict';
// Production build: one minified stylesheet and one minified script instead of 25+ stylesheets and
// 90+ scripts. The scripts are classic scripts that share globals, so they are concatenated in
// index.html order (not module-bundled) and minified without renaming top-level names.
// Output: build/ (deploy this folder). Development and tests keep using dist/.
//   npm run build
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const { execFileSync } = require('node:child_process');
const esbuild = require('esbuild');

const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
const out = path.join(root, 'build');
const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const css = [...html.matchAll(/<link rel="stylesheet" href="([\w.-]+\.css)(?:\?v=\w+)?">/g)].map(m => m[1]);
const js = [...html.matchAll(/<script src="([\w.-]+\.js)(?:\?v=\w+)?"><\/script>/g)].map(m => m[1]);
if (!css.length || !js.length) throw Error('No assets found in dist/index.html');

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

// The source files are classic scripts that share globals and check for each other with
// `typeof X !== 'undefined'`. Concatenating them into one script would change that (a later `const`
// is in its temporal dead zone instead of undefined, and function declarations would hoist across
// files). So each file is minified on its own and the bundle runs it as its own inline <script>
// element, in order: the same semantics as separate <script src> tags, but one download.
const minified = js.map(
  f =>
    esbuild.transformSync(fs.readFileSync(path.join(dist, f), 'utf8'), {
      loader: 'js',
      minifyWhitespace: true,
      minifySyntax: true,
      minifyIdentifiers: false, // top-level names are shared globals and used by tests
      legalComments: 'none',
      target: 'es2020',
      sourcefile: f
    }).code
);
const source = js.map(f => fs.readFileSync(path.join(dist, f), 'utf8')).join('\n');
const jsMin =
  '(function(){var files=' +
  JSON.stringify(minified.map((code, i) => code + '\n//# sourceURL=' + js[i])) +
  ';for(var i=0;i<files.length;i++){var s=document.createElement("script");s.text=files[i];document.head.appendChild(s);}})();';
const cssSource = css.map(f => fs.readFileSync(path.join(dist, f), 'utf8')).join('\n');
const cssMin = esbuild.transformSync(cssSource, { loader: 'css', minify: true, target: 'chrome100' }).code;
fs.writeFileSync(path.join(out, 'app.min.js'), jsMin);
fs.writeFileSync(path.join(out, 'app.min.css'), cssMin);

let page = html
  .replace(/<link rel="stylesheet" href="[\w.-]+\.css(?:\?v=\w+)?">/g, '')
  .replace(/<script src="[\w.-]+\.js(?:\?v=\w+)?"><\/script>/g, '')
  .replace('</head>', '<link rel="stylesheet" href="app.min.css"></head>')
  .replace('</body>', '<script src="app.min.js"></script></body>');
fs.writeFileSync(path.join(out, 'index.html'), page);

for (const name of ['manifest.webmanifest', 'icon.svg', 'sw.js', 'studio-pilots.json'])
  if (fs.existsSync(path.join(dist, name))) fs.copyFileSync(path.join(dist, name), path.join(out, name));
fs.cpSync(path.join(dist, 'vocabulary'), path.join(out, 'vocabulary'), { recursive: true });

// Stamp the two bundles and refresh the service worker's offline list for the build.
execFileSync(process.execPath, [path.join(__dirname, 'stamp-assets.cjs')], {
  env: { ...process.env, APP_DIST: out },
  stdio: 'inherit'
});

const size = files => files.reduce((n, f) => n + fs.statSync(path.join(dist, f)).size, 0);
const gz = buf => zlib.gzipSync(buf).length;
const kb = n => (n / 1024).toFixed(0) + ' KB';
const before = size(js) + size(css);
const beforeGz = gz(Buffer.from(source)) + gz(Buffer.from(cssSource));
const after = Buffer.byteLength(jsMin) + Buffer.byteLength(cssMin);
const afterGz = gz(Buffer.from(jsMin)) + gz(Buffer.from(cssMin));
console.log(
  JSON.stringify(
    {
      requests: { before: js.length + css.length, after: 2 },
      size: { before: kb(before), after: kb(after) },
      gzip: { before: kb(beforeGz), after: kb(afterGz) },
      output: path.relative(root, out)
    },
    null,
    2
  )
);
