import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };

assert(/^<!doctype html>/i.test(html.trimStart()), 'Missing HTML5 doctype.');
assert(/<meta[^>]+name=["']viewport["']/i.test(html), 'Missing viewport metadata.');
assert(/window\.VIKAS_BACKEND_CONFIG\s*=/.test(html), 'Missing backend configuration block.');
assert(/data-theme=["']dark["']/.test(html), 'Missing dark-theme styles.');
assert(/vikas_dashboard_theme/.test(html), 'Theme preference is not persisted.');
assert(!/const\s+(?:payments|records)\s*=\s*\[[^\]]+\]/s.test(html), 'Embedded payment/demo records were found.');

// Inspect rendered markup only; template literals in the application script may
// legitimately generate the same dynamic id expression for different views.
const markup = html.split(/<script(?:\s[^>]*)?>/i)[0];
const ids = [...markup.matchAll(/\bid=["']([^"']+)["']/g)].map(match => match[1]);
const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
assert(duplicates.length === 0, `Duplicate element IDs: ${[...new Set(duplicates)].join(', ')}`);

for (const requiredId of [
  'themeToggle', 'connectionBadge', 'connectionError', 'paymentRows',
  'paymentModal', 'confirmModal', 'feeModal', 'integrationModal', 'loadingOverlay'
]) {
  assert(ids.includes(requiredId), `Missing required element #${requiredId}.`);
}

const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map(match => match[1]);
assert(scripts.length > 0, 'No inline application script found.');
for (const [index, source] of scripts.entries()) {
  try {
    new vm.Script(source, { filename: `index.html:inline-script-${index + 1}.js` });
  } catch (error) {
    failures.push(`JavaScript syntax error: ${error.message}`);
  }
}

if (failures.length) {
  console.error('\nValidation failed:\n- ' + failures.join('\n- '));
  process.exit(1);
}

console.log(`Validation passed: ${ids.length} unique IDs, ${scripts.length} script, production API adapter and theme support.`);
