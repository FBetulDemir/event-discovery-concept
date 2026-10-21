import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

// The "no Swedish hard-coded in the UI" gate (D-011). Every user-facing string lives in
// messages/*.json; what is left in source is code, comments and data identifiers.
const root = fileURLToPath(new URL('../../', import.meta.url));
const SKIP_FILES = new Set(['src/data/events.ts']); // fictional seed data, translated through demoEvents.* messages
const EXTENSIONS = /\.(ts|tsx)$/;

// Values that are data, not copy. Categories and moods drive filtering and stored plan snapshots.
const IDENTIFIERS = new Set([
  'Göteborg', 'Gänget', 'Alla event', 'Klubb', 'Livemusik', 'Stand-up', 'Bar & häng', 'Dansa', 'Skratta', 'Hänga',
  'Europe/Stockholm', 'sv-SE', 'sv', '%s | Gänget',
]);

const STOPWORDS = /\b(och|att|för|inte|din|dina|dig|mig|är|som|vill|ska|kan|har|från|någon|eller|bara|hur|vad|när|där|på|till|med|den|det|ett|här|nu|igen|skapa|rensa|välj|logga|spara|ta bort|avbryt)\b/i;
const SWEDISH_LETTERS = /[åäöÅÄÖ]/;

function* walk(directory) {
  for (const name of readdirSync(directory)) {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) yield* walk(path);
    else if (EXTENSIONS.test(name) && !name.endsWith('.d.ts')) yield path;
  }
}

function stripComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, match => match.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:'"`\\])\/\/.*$/gm, '$1');
}

function candidates(source) {
  const found = [];
  const lines = stripComments(source).split('\n');
  lines.forEach((line, index) => {
    for (const match of line.matchAll(/'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g)) {
      found.push({ line: index + 1, text: match[1] ?? match[2] ?? match[3] });
    }
    // JSX text between a closing `>` and the next `<` or `{`.
    for (const match of line.matchAll(/>([^<>{}=]+)(?=<|\{|$)/g)) found.push({ line: index + 1, text: match[1] });
  });
  return found;
}

const looksSwedish = text => {
  const value = text.trim();
  if (!value || IDENTIFIERS.has(value)) return false;
  if (/^(cities|moods|categories)\.[\w &-åäö]+$/i.test(value)) return false; // message keys built from data identifiers
  if (/^[\w./:#@$%&?=\-+*,;()[\]|!~^ ]*$/.test(value) && !STOPWORDS.test(value)) return false; // paths, classnames, code
  return SWEDISH_LETTERS.test(value) || STOPWORDS.test(value);
};

test('no Swedish copy is hard-coded in components, pages or lib', () => {
  const problems = [];
  for (const file of ['src/components', 'src/app', 'src/lib', 'src/data'].flatMap(dir => [...walk(join(root, dir))])) {
    const name = relative(root, file).replaceAll('\\', '/');
    if (SKIP_FILES.has(name) || name.endsWith('.test.mjs')) continue;
    for (const { line, text } of candidates(readFileSync(file, 'utf8'))) {
      if (looksSwedish(text)) problems.push(`${name}:${line}  ${text.trim().slice(0, 70)}`);
    }
  }
  assert.deepEqual(problems, [], 'move these into messages/sv.json and messages/en.json');
});
