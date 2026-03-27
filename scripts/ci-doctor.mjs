import { readFileSync, readdirSync } from 'node:fs';
const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
console.log(`[ci-doctor] package: ${pkg.name}@${pkg.version}`);
console.log(`[ci-doctor] build script: ${pkg.scripts?.build ?? '<missing>'}`);

const tsconfigs = readdirSync(new URL('..', import.meta.url)).filter((file) => file.startsWith('tsconfig') && file.endsWith('.json'));
let foundReactNative = false;

for (const file of tsconfigs) {
  const fullPath = new URL(`../${file}`, import.meta.url);
  const content = readFileSync(fullPath, 'utf8');
  if (content.includes('react-native')) {
    foundReactNative = true;
    console.error(`[ci-doctor] Found forbidden 'react-native' reference in ${file}`);
  }
}

if (foundReactNative) {
  console.error('[ci-doctor] Build blocked: remove react-native types from tsconfig for web deploy.');
  process.exit(1);
}

console.log('[ci-doctor] tsconfig scan OK (no react-native references).');
