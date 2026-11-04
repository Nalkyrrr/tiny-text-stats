#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export function analyze(text) {
  const words = text.match(/[\p{L}\p{N}]+(?:['\u2019][\p{L}\p{N}]+)*/gu) ?? [];
  const normalized = text.replace(/\r\n?/g, '\n');
  return {
    characters: [...text].length,
    words: words.length,
    lines: text.length === 0 ? 0 : normalized.split('\n').length - Number(normalized.endsWith('\n')),
    readingMinutes: words.length === 0 ? 0 : Math.ceil(words.length / 200),
  };
}

export function run(args, read = file => readFileSync(file, 'utf8')) {
  if (args[0] === '--help') {
    return 'Usage: node stats.js [--json] [--] [FILE | -]\n'
      + 'Reads UTF-8 text from FILE, or standard input if omitted. Reading time assumes 200 words/minute.';
  }
  const json = args[0] === '--json';
  if (json) args = args.slice(1);
  const literal = args[0] === '--';
  if (literal) args = args.slice(1);
  if (args.length > 1) throw new Error('Provide at most one file. See --help.');
  if (!literal && args[0]?.startsWith('-') && args[0] !== '-') {
    throw new Error('Unknown flag; use -- before a filename beginning with a dash.');
  }
  const result = analyze(read(!args[0] || args[0] === '-' ? 0 : args[0]));
  return json ? JSON.stringify(result, null, 2) : [
    `Characters: ${result.characters}`,
    `Words: ${result.words}`,
    `Lines: ${result.lines}`,
    `Reading time: ${result.readingMinutes} min`,
  ].join('\n');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    console.log(run(process.argv.slice(2)));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
