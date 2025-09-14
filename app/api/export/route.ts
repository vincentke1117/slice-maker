import { SupabaseContentProvider } from '../../../src/lib/provider';

export async function POST(req: Request): Promise<Response> {
  const { projectId, includeTypes } = await req.json();
  const provider = new SupabaseContentProvider();
  const zip = await provider.buildZip(projectId, { includeTypes });
  return new Response(zip, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="slice-maker-${projectId}.zip"`,
    },
  });
}
