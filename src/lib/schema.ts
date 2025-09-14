import { z } from 'zod';

export const sliceVariationSchema = z.object({
  id: z.string(),
  name: z.string(),
  schema: z.record(z.any()),
});

export const sliceModelSchema = z.object({
  id: z.string(),
  libraryId: z.string(),
  name: z.string(),
  variations: z.array(sliceVariationSchema),
  meta: z
    .object({
      createdBy: z.string().optional(),
      createdAt: z.string().optional(),
      updatedAt: z.string().optional(),
    })
    .optional(),
});

export const pageModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  allowedSlices: z.array(z.string()).optional(),
  schema: z.record(z.any()),
});

export type SliceVariation = z.infer<typeof sliceVariationSchema>;
export type SliceModel = z.infer<typeof sliceModelSchema>;
export type PageModel = z.infer<typeof pageModelSchema>;

export function validateSlice(input: unknown): SliceModel {
  return sliceModelSchema.parse(input);
}

export function validatePage(input: unknown): PageModel {
  return pageModelSchema.parse(input);
}
