import test from 'node:test';
import assert from 'node:assert/strict';
import { POST } from './route';
import { SupabaseContentProvider } from '../../../src/lib/provider';

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.com';
process.env.SUPABASE_SERVICE_KEY = 'service-key';

test('POST returns zip response', async () => {
  const stub = new Uint8Array([1, 2, 3]);
  const original = SupabaseContentProvider.prototype.buildZip;
  SupabaseContentProvider.prototype.buildZip = async () => stub;
  const req = new Request('http://localhost', {
    method: 'POST',
    body: JSON.stringify({ projectId: '123', includeTypes: true }),
    headers: { 'Content-Type': 'application/json' },
  });
  const res = await POST(req);
  const buf = new Uint8Array(await res.arrayBuffer());
  assert.deepEqual(buf, stub);
  assert.equal(
    res.headers.get('Content-Disposition'),
    'attachment; filename="slice-maker-123.zip"'
  );
  SupabaseContentProvider.prototype.buildZip = original;
});
