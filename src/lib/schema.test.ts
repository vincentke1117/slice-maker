import test from 'node:test';
import assert from 'node:assert';
import { sliceModelSchema, pageModelSchema } from './schema';

test('sliceModelSchema validates correct model', () => {
  const valid = {
    id: '1',
    libraryId: 'lib',
    name: 'hero',
    variations: [{ id: 'v1', name: 'default', schema: {} }],
  };
  assert.doesNotThrow(() => sliceModelSchema.parse(valid));
});

test('sliceModelSchema rejects invalid model', () => {
  const invalid = { id: '1', name: 'hero', variations: [] };
  assert.throws(() => sliceModelSchema.parse(invalid));
});

test('pageModelSchema validates and rejects', () => {
  const valid = { id: 'p1', name: 'home', schema: {}, allowedSlices: ['hero'] };
  assert.doesNotThrow(() => pageModelSchema.parse(valid));
  const invalid = { id: 'p1', name: 'home' } as any;
  assert.throws(() => pageModelSchema.parse(invalid));
});
