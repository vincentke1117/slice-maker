import test from 'node:test';
import assert from 'node:assert';
import { generateMockFromSchema } from './generator';

test('generateMockFromSchema creates mock data', () => {
  const schema = {
    fields: {
      title: { type: 'text' },
      content: { type: 'richText' },
      image: { type: 'image' },
      link: { type: 'link' },
      items: { type: 'repeat', min: 2 },
      unknown: { type: 'custom' },
    },
  };

  const mock = generateMockFromSchema(schema);

  assert.equal(mock.title, 'Lorem ipsum');
  assert.ok(Array.isArray(mock.content));
  assert.equal(mock.items.length, 2);
  assert.deepEqual(mock.image.alt, 'placeholder');
  assert.equal(mock.unknown, null);
});
