import assert from 'node:assert/strict';
import test from 'node:test';
import { messages } from './testing.mjs';

const flatten = (value, prefix = '') =>
  Object.entries(value).flatMap(([key, child]) =>
    typeof child === 'string' ? [[`${prefix}${key}`, child]] : flatten(child, `${prefix}${key}.`));

const sv = new Map(flatten(messages.sv));
const en = new Map(flatten(messages.en));

// Argument names and rich-text tags in a message: `{count, plural, …}` → count, `<b>…</b>` → b.
const placeholders = text => {
  const names = new Set();
  for (const match of text.matchAll(/\{\s*([A-Za-z_][\w]*)\s*[,}]/g)) names.add(match[1]);
  for (const match of text.matchAll(/<\/?([A-Za-z][\w]*)\s*\/?>/g)) names.add(`<${match[1]}>`);
  return [...names].sort();
};

test('Swedish and English have exactly the same keys', () => {
  const missingInEn = [...sv.keys()].filter(key => !en.has(key));
  const missingInSv = [...en.keys()].filter(key => !sv.has(key));
  assert.deepEqual(missingInEn, [], 'keys missing in en.json');
  assert.deepEqual(missingInSv, [], 'keys missing in sv.json');
});

test('a key uses the same placeholders and rich-text tags in both languages', () => {
  for (const [key, text] of sv) {
    assert.deepEqual(placeholders(en.get(key) ?? ''), placeholders(text), `placeholders differ for ${key}`);
  }
});

test('no message is empty', () => {
  for (const [key, text] of [...sv, ...en]) assert.ok(text.trim().length > 0, `empty message ${key}`);
});

// English left identical to the Swedish usually means a message was copied and never translated.
const sameInBoth = new Set(['shell.nav.match', 'categories.Klubb', 'categories.Livemusik', 'categories.Stand-up', 'categories.Bar & häng', 'moods.Livemusik', 'shell.titles.plan', 'shell.titles.event', 'format.km', 'match.location.distance', 'match.summary.budget', 'comments.reactionLabel', 'design.fields.namePlaceholder']);
test('English is not an untranslated copy of Swedish', () => {
  // Proper names (event titles) are allowed to match.
  const copies = [...sv].filter(([key, text]) => en.get(key) === text && text.length > 3 && !sameInBoth.has(key) && !/^demoEvents\.(base\.[\w-]+\.title|weekly\.)/.test(key));
  assert.deepEqual(copies.map(([key]) => key), [], 'identical in sv and en (translate, or allowlist if it is a name)');
});
