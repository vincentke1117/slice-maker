import type { ContentProvider, SliceModel, PageModel } from './types';
import { buildZipFromProject } from './zip/builder';
import { generateMockFromSchema } from './mock/generator';
import { createServerClient } from './supabase';

export class SupabaseContentProvider implements ContentProvider {
  private supa = createServerClient();

  async listSlices(projectId: string): Promise<SliceModel[]> {
    const { data, error } = await this.supa
      .from('slices')
      .select(`
        id, name, meta, slice_libraries ( id, project_id ),
        slice_variations ( id, name, schema )
      `)
      .eq('slice_libraries.project_id', projectId);
    if (error) throw error;
    return (data ?? []).map((row: any) => ({
      id: row.id,
      name: row.name,
      libraryId: row.slice_libraries.id,
      variations: (row.slice_variations || []).map((v: any) => ({
        id: v.id,
        name: v.name,
        schema: v.schema,
      })),
      meta: row.meta,
    }));
  }

  async getSlice(projectId: string, sliceId: string): Promise<SliceModel | null> {
    const { data, error } = await this.supa
      .from('slices')
      .select(`
        id, name, meta, slice_libraries ( id, project_id ),
        slice_variations ( id, name, schema )
      `)
      .eq('slice_libraries.project_id', projectId)
      .eq('id', sliceId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;
    return {
      id: data.id,
      name: data.name,
      libraryId: data.slice_libraries.id,
      variations: (data.slice_variations || []).map((v: any) => ({
        id: v.id,
        name: v.name,
        schema: v.schema,
      })),
      meta: data.meta,
    };
  }

  async upsertSlice(projectId: string, slice: SliceModel): Promise<void> {
    const { error } = await this.supa.from('slices').upsert({
      id: slice.id,
      library_id: slice.libraryId,
      name: slice.name,
      meta: slice.meta,
    });
    if (error) throw error;
    const { error: varError } = await this.supa.from('slice_variations').upsert(
      slice.variations.map((v) => ({
        id: v.id,
        slice_id: slice.id,
        name: v.name,
        schema: v.schema,
      }))
    );
    if (varError) throw varError;
  }

  async deleteSlice(projectId: string, sliceId: string): Promise<void> {
    const { error } = await this.supa
      .from('slices')
      .delete()
      .eq('id', sliceId);
    if (error) throw error;
  }

  async listPages(projectId: string): Promise<PageModel[]> {
    const { data, error } = await this.supa
      .from('page_models')
      .select('id, name, schema, allowed_slices')
      .eq('project_id', projectId);
    if (error) throw error;
    return (data ?? []).map((row: any) => ({
      id: row.id,
      name: row.name,
      allowedSlices: row.allowed_slices ?? undefined,
      schema: row.schema,
    }));
  }

  async upsertPage(projectId: string, page: PageModel): Promise<void> {
    const { error } = await this.supa.from('page_models').upsert({
      id: page.id,
      project_id: projectId,
      name: page.name,
      schema: page.schema,
      allowed_slices: page.allowedSlices,
    });
    if (error) throw error;
  }

  async generateMock(slice: SliceModel, variationId?: string) {
    const v =
      slice.variations.find((x) => !variationId || x.id === variationId) ||
      slice.variations[0];
    return generateMockFromSchema(v.schema);
  }

  async saveMock(
    projectId: string,
    sliceId: string,
    variationId: string,
    mock: any
  ): Promise<void> {
    const { error } = await this.supa.from('slice_mocks').upsert({
      project_id: projectId,
      slice_id: sliceId,
      variation_id: variationId,
      data: mock,
    });
    if (error) throw error;
  }

  async loadMock(
    projectId: string,
    sliceId: string,
    variationId: string
  ): Promise<any | null> {
    const { data, error } = await this.supa
      .from('slice_mocks')
      .select('data')
      .eq('project_id', projectId)
      .eq('slice_id', sliceId)
      .eq('variation_id', variationId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data?.data ?? null;
  }

  async buildZip(projectId: string, options?: { includeTypes?: boolean }) {
    const [slices, pages] = await Promise.all([
      this.listSlices(projectId),
      this.listPages(projectId),
    ]);
    return buildZipFromProject({ projectId, slices, pages });
  }
}
