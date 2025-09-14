import test from 'node:test';
import assert from 'node:assert/strict';
import { SupabaseContentProvider } from './provider';
import type { SliceModel } from './types';

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.com';
process.env.SUPABASE_SERVICE_KEY = 'service-key';

test('generateMock uses schema to produce mock data', async () => {
  const provider = new SupabaseContentProvider();
  const slice: SliceModel = {
    id: '1',
    libraryId: 'lib',
    name: 'hero',
    variations: [
      { id: 'v1', name: 'default', schema: { fields: { title: { type: 'text' } } } },
    ],
  };
  const mock = await provider.generateMock(slice);
  assert.equal(mock.title, 'Lorem ipsum');
});

class StubProvider extends SupabaseContentProvider {
  constructor() {
    super();
  }
  async listSlices() {
    return [
      { id: '1', libraryId: 'lib', name: 'hero', variations: [], meta: undefined },
    ];
  }
  async listPages() {
    return [];
  }
}

test('buildZip returns Uint8Array', async () => {
  const provider = new StubProvider();
  const zip = await provider.buildZip('proj');
  assert.ok(zip instanceof Uint8Array);
});
