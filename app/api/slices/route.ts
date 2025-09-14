import { SupabaseContentProvider } from '../../../src/lib/provider';
import { validateSlice } from '../../../src/lib/schema';

export async function GET(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('projectId');
  if (!projectId) {
    return new Response('projectId is required', { status: 400 });
  }
  const provider = new SupabaseContentProvider();
  const items = await provider.listSlices(projectId);
  return Response.json({ items });
}

export async function POST(req: Request): Promise<Response> {
  const { projectId, slice } = await req.json();
  if (!projectId || !slice) {
    return new Response('projectId and slice are required', { status: 400 });
  }
  const provider = new SupabaseContentProvider();
  await provider.upsertSlice(projectId, validateSlice(slice));
  return new Response(null, { status: 204 });
}

export async function DELETE(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('projectId');
  const sliceId = searchParams.get('sliceId');
  if (!projectId || !sliceId) {
    return new Response('projectId and sliceId are required', { status: 400 });
  }
  const provider = new SupabaseContentProvider();
  await provider.deleteSlice(projectId, sliceId);
  return new Response(null, { status: 204 });
}
