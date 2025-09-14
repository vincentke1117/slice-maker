import type { SliceModel, PageModel } from './schema';
export type { SliceModel, PageModel } from './schema';

export interface ContentProvider {
  listSlices(projectId: string): Promise<SliceModel[]>;
  getSlice(projectId: string, sliceId: string): Promise<SliceModel | null>;
  upsertSlice(projectId: string, slice: SliceModel): Promise<void>;
  deleteSlice(projectId: string, sliceId: string): Promise<void>;
  listPages(projectId: string): Promise<PageModel[]>;
  upsertPage(projectId: string, page: PageModel): Promise<void>;
  generateMock(slice: SliceModel, variationId?: string): Promise<any>;
  saveMock(projectId: string, sliceId: string, variationId: string, mock: any): Promise<void>;
  loadMock(projectId: string, sliceId: string, variationId: string): Promise<any | null>;
  buildZip(projectId: string, options?: { includeTypes?: boolean }): Promise<Uint8Array>;
}
