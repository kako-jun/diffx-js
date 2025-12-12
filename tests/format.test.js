const diffx = require('../index.js');

describe('formatOutput()', () => {
    // Helper to create diff results for testing
    const createDiffResults = () => {
        const old = { name: 'Alice', age: 30 };
        const newObj = { name: 'Bob', age: 30, city: 'Tokyo' };
        return diffx.diff(old, newObj);
    };

    describe('JSON format', () => {
        test('formats results as JSON', () => {
            const results = createDiffResults();
            const output = diffx.formatOutput(results, 'json');

            expect(typeof output).toBe('string');

            // Should be valid JSON
            const parsed = JSON.parse(output);
            expect(Array.isArray(parsed)).toBe(true);
        });

        test('JSON output contains all diff information', () => {
            const results = createDiffResults();
            const output = diffx.formatOutput(results, 'json');
            const parsed = JSON.parse(output);

            // Should have entries for Modified (name) and Added (city)
            expect(parsed.length).toBeGreaterThanOrEqual(2);
        });
    });

    describe('YAML format', () => {
        test('formats results as YAML', () => {
            const results = createDiffResults();
            const output = diffx.formatOutput(results, 'yaml');

            expect(typeof output).toBe('string');
            // YAML should contain some recognizable structure
            expect(output.length).toBeGreaterThan(0);
        });
    });

    describe('diffx format', () => {
        test('formats results in diffx format', () => {
            const results = createDiffResults();
            const output = diffx.formatOutput(results, 'diffx');

            expect(typeof output).toBe('string');
            expect(output.length).toBeGreaterThan(0);
        });
    });

    describe('Error handling', () => {
        test('throws on invalid format', () => {
            const results = createDiffResults();

            expect(() => diffx.formatOutput(results, 'invalid')).toThrow();
        });
    });

    describe('Empty results', () => {
        test('handles empty results array', () => {
            const output = diffx.formatOutput([], 'json');

            expect(output).toBe('[]');
        });
    });

    describe('Manual result construction', () => {
        test('formats manually constructed Added result', () => {
            const results = [{
                diffType: 'Added',
                path: 'newField',
                newValue: 'value'
            }];

            const output = diffx.formatOutput(results, 'json');
            expect(typeof output).toBe('string');
        });

        test('formats manually constructed Modified result', () => {
            const results = [{
                diffType: 'Modified',
                path: 'field',
                oldValue: 'old',
                newValue: 'new'
            }];

            const output = diffx.formatOutput(results, 'json');
            expect(typeof output).toBe('string');
        });

        test('formats manually constructed Removed result', () => {
            const results = [{
                diffType: 'Removed',
                path: 'removedField',
                value: 'removedValue'
            }];

            const output = diffx.formatOutput(results, 'json');
            expect(typeof output).toBe('string');
        });
    });
});
