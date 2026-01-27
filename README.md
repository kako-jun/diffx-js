# diffx

[![CI](https://github.com/kako-jun/diffx-js/actions/workflows/ci.yml/badge.svg)](https://github.com/kako-jun/diffx-js/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/diffx.svg)](https://www.npmjs.com/package/diffx)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Node.js bindings for [diffx](https://github.com/kako-jun/diffx) - semantic diff for structured data (JSON, YAML, TOML, XML, INI, CSV). Powered by Rust via napi-rs for blazing fast performance.

## Installation

```bash
npm install diffx
```

### Supported Platforms

| Platform | Architecture |
|----------|--------------|
| Linux | x64 (glibc) |
| Linux | x64 (musl/Alpine) |
| Linux | ARM64 |
| macOS | x64 (Intel) |
| macOS | ARM64 (Apple Silicon) |
| Windows | x64 |

## Usage

### Basic Diff

```javascript
const { diff } = require('diffx');

const old = { name: "Alice", age: 30 };
const newObj = { name: "Alice", age: 31, city: "Tokyo" };

const results = diff(old, newObj);

for (const change of results) {
  console.log(`${change.diffType}: ${change.path}`);
  // Modified: age
  // Added: city
}
```

### With Options

```javascript
const results = diff(data1, data2, {
  epsilon: 0.001,           // Tolerance for float comparison
  arrayIdKey: 'id',         // Match array elements by ID
  ignoreKeysRegex: 'timestamp|updatedAt',  // Ignore keys matching regex
  pathFilter: 'user',       // Only show diffs in paths containing "user"
  ignoreCase: true,         // Ignore case differences
  ignoreWhitespace: true,   // Ignore whitespace differences
});
```

### Parsers

Parse various formats to JavaScript objects:

```javascript
const { parseJson, parseYaml, parseToml, parseCsv, parseIni, parseXml } = require('diffx');

const jsonObj = parseJson('{"name": "Alice"}');
const yamlObj = parseYaml('name: Alice\nage: 30');
const tomlObj = parseToml('name = "Alice"');
const csvArray = parseCsv('name,age\nAlice,30');
const iniObj = parseIni('[user]\nname = Alice');
const xmlObj = parseXml('<user><name>Alice</name></user>');
```

### Format Output

```javascript
const { diff, formatOutput } = require('diffx');

const results = diff(old, newObj);
console.log(formatOutput(results, 'json'));  // JSON format
console.log(formatOutput(results, 'yaml'));  // YAML format
console.log(formatOutput(results, 'diffx')); // diffx format
```

## API Reference

### `diff(old, new, options?)`

Compare two values and return differences.

**Options:**
| Option | Type | Description |
|--------|------|-------------|
| `epsilon` | number | Tolerance for floating-point comparisons |
| `arrayIdKey` | string | Key to identify array elements |
| `ignoreKeysRegex` | string | Regex pattern for keys to ignore |
| `pathFilter` | string | Only show diffs in matching paths |
| `outputFormat` | string | Output format ("diffx", "json", "yaml") |
| `ignoreWhitespace` | boolean | Ignore whitespace differences |
| `ignoreCase` | boolean | Ignore case differences |
| `briefMode` | boolean | Report only whether objects differ |
| `quietMode` | boolean | Suppress normal output |

**Returns:** Array of `JsDiffResult`:
```typescript
interface JsDiffResult {
  diffType: 'Added' | 'Removed' | 'Modified' | 'TypeChanged';
  path: string;
  oldValue?: any;   // For Modified/TypeChanged
  newValue?: any;   // For Added/Modified/TypeChanged
  value?: any;      // For Removed
}
```

### Parsers

- `parseJson(content: string): any`
- `parseYaml(content: string): any`
- `parseToml(content: string): any`
- `parseCsv(content: string): any[]`
- `parseIni(content: string): any`
- `parseXml(content: string): any`

### `formatOutput(results, format)`

Format diff results as string. Format: "json", "yaml", or "diffx".

## Development

```bash
npm install     # Install dependencies
npm run build   # Build native module
npm test        # Run tests (51 tests)
```

## License

MIT
