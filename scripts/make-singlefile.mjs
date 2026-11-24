import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const dist = new URL('../dist/', import.meta.url).pathname;
let html = readFileSync(join(dist, 'index.html'), 'utf8');
const assets = readdirSync(join(dist, 'assets')).filter((f) => f.endsWith('.js'));
if (assets.length !== 1) throw new Error('expected exactly one JS chunk, got: ' + assets.join(','));
const js = readFileSync(join(dist, 'assets', assets[0]), 'utf8');
if (js.includes('</script')) throw new Error('bundle contains </script — needs escaping');

const scriptTag = new RegExp(`<script type="module"[^>]*src="[^"]*${assets[0]}"[^>]*></script>`);
if (!scriptTag.test(html)) throw new Error('script tag not found in dist/index.html');
html = html.replace(scriptTag, () => `<script type="module">\n${js}\n</script>`);

if (/src="(?!\/@vite|data:)[^"]*\.(js|css)"/.test(html) || /href="[^"]*\.(js|css)"/.test(html)) {
  throw new Error('external asset reference remains');
}

const out = new URL('../ashen-crown.html', import.meta.url).pathname;
writeFileSync(out, html);
console.log('wrote ' + out + ' (' + (html.length / 1024).toFixed(1) + ' kB, single inline module script, zero external assets)');
