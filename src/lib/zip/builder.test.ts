import test from "node:test";
import JSZip from "jszip";
import assert from "node:assert/strict";
import { buildZipFromProject } from "./builder";
import type { SliceModel } from "../types";

const sampleSlices: SliceModel[] = [
  {
    id: "1",
    libraryId: "lib",
    name: "hero",
    variations: [{ id: "v1", name: "default", schema: {} }],
  },
];

test("buildZipFromProject produces zip with slice files", async () => {
  const bytes = await buildZipFromProject({
    projectId: "p1",
    slices: sampleSlices,
    pages: [],
  });
  const zip = await JSZip.loadAsync(bytes);
  assert.ok(zip.file("project/src/slices/Hero/index.tsx"));
  assert.ok(zip.file("project/src/components/SliceZone.tsx"));
});
