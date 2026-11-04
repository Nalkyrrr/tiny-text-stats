# Tiny Text Stats

Count words, characters, lines, and estimated reading time in a local UTF-8 text file. No dependencies, installation, accounts, or network access. Requires Node.js 22 or newer.

```sh
node stats.js notes.txt
node stats.js --json notes.txt
node stats.js -- --notes.txt
```

Read standard input by omitting the filename or passing `-`:

```sh
# macOS / Linux
echo "Hello world" | node stats.js

# PowerShell
"Hello world" | node stats.js --json
```

Example JSON for `hello world` without a trailing newline:

```json
{
  "characters": 11,
  "words": 2,
  "lines": 1,
  "readingMinutes": 1
}
```

Characters are Unicode code points, including whitespace, rather than visual grapheme clusters. Words are runs of Unicode letters or numbers and can contain internal apostrophes. Languages without word-separating spaces are not segmented linguistically. Lines support LF, CRLF, and CR; a trailing newline does not add an extra line. Reading time rounds up at 200 words per minute. Empty input produces zero for every count.

Run tests with `npm test` or `node --test`. Files are read into memory, so this tool is intended for ordinary text documents. It never modifies the input.

MIT license. Copyright (c) 2026 Nalkyrrr.
