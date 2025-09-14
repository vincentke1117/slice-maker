export async function listSlices(projectId: string) {
  const res = await fetch(`/api/slices?projectId=${encodeURIComponent(projectId)}`, {
    cache: 'no-store',
  });
  return res.json();
}

export async function saveSlice(projectId: string, slice: any) {
  await fetch(`/api/slices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId, slice }),
  });
}

export async function exportZip(projectId: string) {
  const res = await fetch('/api/export', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId }),
  });
  const blob = await res.blob();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `slice-maker-${projectId}.zip`;
  a.click();
}
