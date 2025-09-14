import JSZip from "jszip";
import type { SliceModel, PageModel } from "../types";

const pascal = (str: string): string =>
  str
    .replace(/([_-])+(\w)/g, (_, __, c) => c.toUpperCase())
    .replace(/^(\w)/, (_, c) => c.toUpperCase());

function renderComponentTemplate(slice: SliceModel): string {
  const name = pascal(slice.name);
  return `import type { FC } from "react";

type ${name}Props = { data: any; variation: string };

const ${name}: FC<${name}Props> = ({ data }) => {
  return <section>{JSON.stringify(data)}</section>;
};

export default ${name};
`;
}

function renderSliceZone(slices: SliceModel[]): string {
  const mappings = slices
    .map(
      (s) =>
        `  "${s.name}": dynamic(() => import("../slices/${pascal(s.name)}")),`
    )
    .join("\n");
  return `import dynamic from "next/dynamic";

const components: Record<string, any> = {
${mappings}
};

export function SliceZone({ slices }: { slices: Array<{ type: string; data: any; variation?: string }> }) {
  return (
    <>
      {slices.map((s, i) => {
        const Cmp = components[s.type];
        return Cmp ? <Cmp key={i} data={s.data} variation={s.variation || "default"} /> : null;
      })}
    </>
  );
}
`;
}

function minimalPkgJson() {
  return {
    name: "slice-maker-project",
    private: true,
    dependencies: {
      react: "^18.0.0",
      next: "^14.0.0",
    },
  };
}

function renderRootReadme() {
  return `# slice-maker export\n\nGenerated project\n`;
}

export async function buildZipFromProject({
  projectId,
  slices,
  pages,
}: {
  projectId: string;
  slices: SliceModel[];
  pages: PageModel[];
}): Promise<Uint8Array> {
  const zip = new JSZip();
  for (const s of slices) {
    const dir = `project/src/slices/${pascal(s.name)}/`;
    zip.file(`${dir}index.tsx`, renderComponentTemplate(s));
    zip.file(`${dir}README.md`, `# ${pascal(s.name)}\n`);
  }
  zip.file("project/src/components/SliceZone.tsx", renderSliceZone(slices));
  zip.file(
    "project/package.json",
    JSON.stringify(minimalPkgJson(), null, 2)
  );
  zip.file("project/README.md", renderRootReadme());
  return zip.generateAsync({ type: "uint8array" });
}

