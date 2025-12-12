const diffx = require('../index.js');

describe('Parser Functions', () => {
    describe('parseJson()', () => {
        test('parses valid JSON object', () => {
            const json = '{"name": "Alice", "age": 30}';
            const result = diffx.parseJson(json);

            expect(result).toEqual({ name: 'Alice', age: 30 });
        });

        test('parses JSON array', () => {
            const json = '[1, 2, 3]';
            const result = diffx.parseJson(json);

            expect(result).toEqual([1, 2, 3]);
        });

        test('parses nested JSON', () => {
            const json = '{"user": {"profile": {"age": 30}}}';
            const result = diffx.parseJson(json);

            expect(result.user.profile.age).toBe(30);
        });

        test('throws on invalid JSON', () => {
            expect(() => diffx.parseJson('invalid json')).toThrow();
        });
    });

    describe('parseYaml()', () => {
        test('parses valid YAML', () => {
            const yaml = `
name: Alice
age: 30
`;
            const result = diffx.parseYaml(yaml);

            expect(result.name).toBe('Alice');
            expect(result.age).toBe(30);
        });

        test('parses YAML with nested objects', () => {
            const yaml = `
user:
  profile:
    age: 30
`;
            const result = diffx.parseYaml(yaml);

            expect(result.user.profile.age).toBe(30);
        });

        test('parses YAML arrays', () => {
            const yaml = `
items:
  - 1
  - 2
  - 3
`;
            const result = diffx.parseYaml(yaml);

            expect(result.items).toEqual([1, 2, 3]);
        });
    });

    describe('parseToml()', () => {
        test('parses valid TOML', () => {
            const toml = `
name = "Alice"
age = 30
`;
            const result = diffx.parseToml(toml);

            expect(result.name).toBe('Alice');
            expect(result.age).toBe(30);
        });

        test('parses TOML with sections', () => {
            const toml = `
[user]
name = "Alice"

[user.profile]
age = 30
`;
            const result = diffx.parseToml(toml);

            expect(result.user.name).toBe('Alice');
            expect(result.user.profile.age).toBe(30);
        });

        test('parses TOML arrays', () => {
            const toml = `
items = [1, 2, 3]
`;
            const result = diffx.parseToml(toml);

            expect(result.items).toEqual([1, 2, 3]);
        });
    });

    describe('parseCsv()', () => {
        test('parses valid CSV with headers', () => {
            const csv = `name,age
Alice,30
Bob,25`;
            const result = diffx.parseCsv(csv);

            expect(Array.isArray(result)).toBe(true);
            expect(result).toHaveLength(2);
            expect(result[0].name).toBe('Alice');
            expect(result[0].age).toBe('30');
        });

        test('parses CSV with different delimiters in values', () => {
            const csv = `name,description
Alice,"Hello, World"`;
            const result = diffx.parseCsv(csv);

            expect(result[0].description).toBe('Hello, World');
        });
    });

    describe('parseIni()', () => {
        test('parses valid INI', () => {
            const ini = `
[user]
name = Alice
age = 30
`;
            const result = diffx.parseIni(ini);

            expect(result.user.name).toBe('Alice');
            expect(result.user.age).toBe('30');
        });

        test('parses INI with multiple sections', () => {
            const ini = `
[database]
host = localhost
port = 5432

[cache]
enabled = true
`;
            const result = diffx.parseIni(ini);

            expect(result.database.host).toBe('localhost');
            expect(result.cache.enabled).toBe('true');
        });
    });

    describe('parseXml()', () => {
        test('parses valid XML', () => {
            const xml = `<user><name>Alice</name><age>30</age></user>`;
            const result = diffx.parseXml(xml);

            expect(result).toBeDefined();
            // XML parsing structure may vary, just check it doesn't throw
        });

        test('parses XML with attributes', () => {
            const xml = `<user id="1"><name>Alice</name></user>`;
            const result = diffx.parseXml(xml);

            expect(result).toBeDefined();
        });

        test('throws on invalid XML', () => {
            expect(() => diffx.parseXml('<invalid')).toThrow();
        });
    });
});

describe('Parser + Diff Integration', () => {
    test('can diff parsed JSON', () => {
        const json1 = '{"name": "Alice", "age": 30}';
        const json2 = '{"name": "Alice", "age": 31}';

        const obj1 = diffx.parseJson(json1);
        const obj2 = diffx.parseJson(json2);
        const results = diffx.diff(obj1, obj2);

        expect(results).toHaveLength(1);
        expect(results[0].path).toBe('age');
    });

    test('can diff parsed YAML', () => {
        const yaml1 = 'name: Alice\nage: 30';
        const yaml2 = 'name: Alice\nage: 31';

        const obj1 = diffx.parseYaml(yaml1);
        const obj2 = diffx.parseYaml(yaml2);
        const results = diffx.diff(obj1, obj2);

        expect(results).toHaveLength(1);
        expect(results[0].path).toBe('age');
    });

    test('can diff parsed TOML', () => {
        const toml1 = 'name = "Alice"\nage = 30';
        const toml2 = 'name = "Alice"\nage = 31';

        const obj1 = diffx.parseToml(toml1);
        const obj2 = diffx.parseToml(toml2);
        const results = diffx.diff(obj1, obj2);

        expect(results).toHaveLength(1);
        expect(results[0].path).toBe('age');
    });
});
