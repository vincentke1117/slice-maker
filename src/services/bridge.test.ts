import test from 'node:test';
import assert from 'node:assert/strict';
import { listSlices, saveSlice, exportZip } from './bridge';

test('listSlices fetches project slices', async () => {
  const calls: any[] = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async (url: any, opts: any) => {
    calls.push({ url, opts });
    return { json: async () => ({ items: [] }) } as any;
  }) as any;
  const res = await listSlices('p1');
  assert.deepEqual(res, { items: [] });
  assert.equal(calls[0].url, '/api/slices?projectId=p1');
  assert.deepEqual(calls[0].opts, { cache: 'no-store' });
  globalThis.fetch = originalFetch;
});

test('saveSlice posts slice data', async () => {
  const calls: any[] = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async (url: any, opts: any) => {
    calls.push({ url, opts });
    return {} as any;
  }) as any;
  await saveSlice('p1', { id: 's1' });
  assert.equal(calls[0].url, '/api/slices');
  assert.equal(calls[0].opts.method, 'POST');
  assert.equal(
    calls[0].opts.body,
    JSON.stringify({ projectId: 'p1', slice: { id: 's1' } })
  );
  globalThis.fetch = originalFetch;
});

test('exportZip triggers download', async () => {
  const originalFetch = globalThis.fetch;
  const originalDoc = (globalThis as any).document;
  const originalURL = (globalThis as any).URL;

  const fetchCalls: any[] = [];
  globalThis.fetch = (async (url: any, opts: any) => {
    fetchCalls.push({ url, opts });
    return { blob: async () => new Blob(['data']) } as any;
  }) as any;

  let clicked = false;
  const aEl = { href: '', download: '', click: () => { clicked = true; } };
  (globalThis as any).document = { createElement: () => aEl };
  (globalThis as any).URL = { createObjectURL: () => 'blob:url' };

  await exportZip('p1');

  assert.equal(fetchCalls[0].url, '/api/export');
  assert.equal(aEl.download, 'slice-maker-p1.zip');
  assert.equal(aEl.href, 'blob:url');
  assert.ok(clicked);

  globalThis.fetch = originalFetch;
  (globalThis as any).document = originalDoc;
  (globalThis as any).URL = originalURL;
});
