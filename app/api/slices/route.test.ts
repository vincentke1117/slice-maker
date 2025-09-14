import test from 'node:test';
import assert from 'node:assert/strict';
import { GET, POST, DELETE } from './route';
import { SupabaseContentProvider } from '../../../src/lib/provider';

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.com';
process.env.SUPABASE_SERVICE_KEY = 'service-key';

test('GET returns slices list', async () => {
  const stub = [{ id: '1', libraryId: 'lib', name: 'Hero', variations: [] }];
  const original = SupabaseContentProvider.prototype.listSlices;
  SupabaseContentProvider.prototype.listSlices = async () => stub;
  const req = new Request('http://localhost/api/slices?projectId=123');
  const res = await GET(req);
  const json = await res.json();
  assert.deepEqual(json, { items: stub });
  SupabaseContentProvider.prototype.listSlices = original;
});

test('POST upserts slice', async () => {
  let received: any = null;
  const original = SupabaseContentProvider.prototype.upsertSlice;
  SupabaseContentProvider.prototype.upsertSlice = async (pid, slice) => {
    received = { pid, slice };
  };
  const slice = { id: '1', libraryId: 'lib', name: 'Hero', variations: [] };
  const req = new Request('http://localhost/api/slices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId: 'p1', slice }),
  });
  const res = await POST(req);
  assert.equal(res.status, 204);
  assert.deepEqual(received, { pid: 'p1', slice });
  SupabaseContentProvider.prototype.upsertSlice = original;
});

test('DELETE removes slice', async () => {
  const called: any[] = [];
  const original = SupabaseContentProvider.prototype.deleteSlice;
  SupabaseContentProvider.prototype.deleteSlice = async (pid, sid) => {
    called.push(pid, sid);
  };
  const req = new Request('http://localhost/api/slices?projectId=p1&sliceId=s1', {
    method: 'DELETE',
  });
  const res = await DELETE(req);
  assert.equal(res.status, 204);
  assert.deepEqual(called, ['p1', 's1']);
  SupabaseContentProvider.prototype.deleteSlice = original;
});
