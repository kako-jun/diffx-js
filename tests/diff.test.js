const diffx = require('../index.js');

describe('diff()', () => {
    describe('Basic Comparisons', () => {
        test('returns empty array for identical objects', () => {
            const obj = { name: 'Alice', age: 30 };
            const results = diffx.diff(obj, obj);
            expect(results).toEqual([]);
        });

        test('detects modified value', () => {
            const old = { name: 'Alice', age: 30 };
            const newObj = { name: 'Alice', age: 31 };

            const results = diffx.diff(old, newObj);

            expect(results).toHaveLength(1);
            expect(results[0].diffType).toBe('Modified');
            expect(results[0].path).toBe('age');
            expect(results[0].oldValue).toBe(30);
            expect(results[0].newValue).toBe(31);
        });

        test('detects added property', () => {
            const old = { name: 'Alice' };
            const newObj = { name: 'Alice', age: 30 };

            const results = diffx.diff(old, newObj);

            expect(results).toHaveLength(1);
            expect(results[0].diffType).toBe('Added');
            expect(results[0].path).toBe('age');
            expect(results[0].newValue).toBe(30);
        });

        test('detects removed property', () => {
            const old = { name: 'Alice', age: 30 };
            const newObj = { name: 'Alice' };

            const results = diffx.diff(old, newObj);

            expect(results).toHaveLength(1);
            expect(results[0].diffType).toBe('Removed');
            expect(results[0].path).toBe('age');
            expect(results[0].value).toBe(30);
        });

        test('detects type change', () => {
            const old = { value: '42' };
            const newObj = { value: 42 };

            const results = diffx.diff(old, newObj);

            expect(results).toHaveLength(1);
            expect(results[0].diffType).toBe('TypeChanged');
            expect(results[0].path).toBe('value');
            expect(results[0].oldValue).toBe('42');
            expect(results[0].newValue).toBe(42);
        });
    });

    describe('Nested Objects', () => {
        test('detects changes in nested objects', () => {
            const old = { user: { profile: { age: 30 } } };
            const newObj = { user: { profile: { age: 31 } } };

            const results = diffx.diff(old, newObj);

            expect(results).toHaveLength(1);
            expect(results[0].path).toBe('user.profile.age');
        });

        test('detects added nested property', () => {
            const old = { user: { name: 'Alice' } };
            const newObj = { user: { name: 'Alice', email: 'alice@example.com' } };

            const results = diffx.diff(old, newObj);

            expect(results).toHaveLength(1);
            expect(results[0].diffType).toBe('Added');
            expect(results[0].path).toBe('user.email');
        });
    });

    describe('Arrays', () => {
        test('detects modified array element', () => {
            const old = { items: [1, 2, 3] };
            const newObj = { items: [1, 4, 3] };

            const results = diffx.diff(old, newObj);

            expect(results).toHaveLength(1);
            expect(results[0].diffType).toBe('Modified');
            expect(results[0].path).toBe('items[1]');
        });

        test('detects added array element', () => {
            const old = { items: [1, 2] };
            const newObj = { items: [1, 2, 3] };

            const results = diffx.diff(old, newObj);

            expect(results).toHaveLength(1);
            expect(results[0].diffType).toBe('Added');
            expect(results[0].path).toBe('items[2]');
        });

        test('detects removed array element', () => {
            const old = { items: [1, 2, 3] };
            const newObj = { items: [1, 2] };

            const results = diffx.diff(old, newObj);

            expect(results).toHaveLength(1);
            expect(results[0].diffType).toBe('Removed');
            expect(results[0].path).toBe('items[2]');
        });
    });

    describe('Options', () => {
        describe('epsilon', () => {
            test('ignores differences within epsilon', () => {
                const old = { value: 1.001 };
                const newObj = { value: 1.002 };

                const results = diffx.diff(old, newObj, { epsilon: 0.01 });

                expect(results).toHaveLength(0);
            });

            test('detects differences outside epsilon', () => {
                const old = { value: 1.0 };
                const newObj = { value: 1.1 };

                const results = diffx.diff(old, newObj, { epsilon: 0.01 });

                expect(results).toHaveLength(1);
            });
        });

        describe('arrayIdKey', () => {
            test('matches array elements by id key', () => {
                const old = { users: [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }] };
                const newObj = { users: [{ id: 2, name: 'Bob' }, { id: 1, name: 'Alice Updated' }] };

                const results = diffx.diff(old, newObj, { arrayIdKey: 'id' });

                // Should detect that id=1's name changed, not that elements were reordered
                const nameChange = results.find(r => r.path.includes('name'));
                expect(nameChange).toBeDefined();
                expect(nameChange.oldValue).toBe('Alice');
                expect(nameChange.newValue).toBe('Alice Updated');
            });
        });

        describe('ignoreKeysRegex', () => {
            test('ignores keys matching regex', () => {
                const old = { name: 'Alice', timestamp: '2023-01-01', updatedAt: '2023-01-01' };
                const newObj = { name: 'Alice', timestamp: '2023-01-02', updatedAt: '2023-01-02' };

                const results = diffx.diff(old, newObj, { ignoreKeysRegex: 'timestamp|updatedAt' });

                expect(results).toHaveLength(0);
            });

            test('still detects changes in non-matching keys', () => {
                const old = { name: 'Alice', timestamp: '2023-01-01' };
                const newObj = { name: 'Bob', timestamp: '2023-01-02' };

                const results = diffx.diff(old, newObj, { ignoreKeysRegex: 'timestamp' });

                expect(results).toHaveLength(1);
                expect(results[0].path).toBe('name');
            });
        });

        describe('pathFilter', () => {
            test('only shows differences in paths containing filter string', () => {
                const old = { user: { name: 'Alice', age: 30 }, meta: { version: 1 } };
                const newObj = { user: { name: 'Bob', age: 31 }, meta: { version: 2 } };

                const results = diffx.diff(old, newObj, { pathFilter: 'user' });

                expect(results.every(r => r.path.includes('user'))).toBe(true);
            });
        });

        describe('ignoreCase', () => {
            test('ignores case differences when enabled', () => {
                const old = { name: 'Alice' };
                const newObj = { name: 'ALICE' };

                const results = diffx.diff(old, newObj, { ignoreCase: true });

                expect(results).toHaveLength(0);
            });

            test('detects case differences when disabled', () => {
                const old = { name: 'Alice' };
                const newObj = { name: 'ALICE' };

                const results = diffx.diff(old, newObj, { ignoreCase: false });

                expect(results).toHaveLength(1);
            });
        });

        describe('ignoreWhitespace', () => {
            test('ignores whitespace differences when enabled', () => {
                const old = { text: 'hello world' };
                const newObj = { text: 'hello  world' };

                const results = diffx.diff(old, newObj, { ignoreWhitespace: true });

                expect(results).toHaveLength(0);
            });
        });
    });

    describe('Primitive Values', () => {
        test('compares primitive strings', () => {
            const results = diffx.diff('hello', 'world');

            expect(results).toHaveLength(1);
            expect(results[0].diffType).toBe('Modified');
        });

        test('compares primitive numbers', () => {
            const results = diffx.diff(42, 43);

            expect(results).toHaveLength(1);
            expect(results[0].diffType).toBe('Modified');
        });

        test('compares null values', () => {
            const results = diffx.diff(null, { value: 1 });

            expect(results.length).toBeGreaterThan(0);
        });
    });
});
