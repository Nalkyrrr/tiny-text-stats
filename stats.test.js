import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { analyze, run } from './stats.js';

test('handles empty input and Unicode code points', () => {
  assert.deepEqual(analyze(''), { characters: 0, words: 0, lines: 0, readingMinutes: 0 });
  assert.deepEqual(analyze('Hi \u{1F30D}!'), { characters: 5, words: 1, lines: 1, readingMinutes: 1 });
  assert.equal(analyze('caf\u00e9 can\u2019t stop 123').words, 4);
});

test('counts logical lines consistently across newline styles', () => {
  for (const newline of ['\n', '\r\n', '\r']) {
    assert.equal(analyze(`one${newline}two${newline}`).lines, 2);
    assert.equal(analyze(`one${newline}two`).lines, 2);
  }
  assert.equal(analyze('\n\n').lines, 2);
});

test('rounds reading time up at the 200-word boundary', () => {
  assert.equal(analyze('word '.repeat(200)).readingMinutes, 1);
  assert.equal(analyze('word '.repeat(201)).readingMinutes, 2);
});

test('supports JSON, standard input, and literal dash-prefixed paths', () => {
  const reads = [];
  const read = path => { reads.push(path); return 'hello world'; };
  assert.equal(JSON.parse(run(['--json'], read)).words, 2);
  assert.equal(reads[0], 0);
  assert.match(run(['--', '-notes.txt'], read), /Words: 2/);
  assert.equal(reads[1], '-notes.txt');
  assert.throws(() => run(['--bad'], read), /Unknown flag/);
  assert.throws(() => run(['a', 'b'], read), /at most one/);
});

test('CLI reads stdin and reports missing files', () => {
  const script = fileURLToPath(new URL('./stats.js', import.meta.url));
  const ok = spawnSync(process.execPath, [script, '--json'], { input: 'one two', encoding: 'utf8' });
  assert.equal(ok.status, 0);
  assert.equal(JSON.parse(ok.stdout).words, 2);
  const missing = spawnSync(process.execPath, [script, 'missing-file-for-test.txt'], { encoding: 'utf8' });
  assert.equal(missing.status, 1);
  assert.match(missing.stderr, /ENOENT/);
});
