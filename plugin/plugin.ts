import fs from "node:fs/promises";

function dataPlugin() {
  const virtualModuleId = "virtual:data";
  const resolvedVirtualModuleId = virtualModuleId + ".tsx";

  return {
    name: "vite-data-plugin",

    resolveId(id: string) {
      if (id === virtualModuleId) return resolvedVirtualModuleId;
      if (id === resolvedVirtualModuleId) return resolvedVirtualModuleId;
    },

    async load(id: string) {
      if (id === resolvedVirtualModuleId) {
        const descriptions = [];

        for await (const info of fs.glob("src/Data/photos/*/info.tsx")) {
          const contents = await fs.readFile(info, { encoding: "utf-8" });
          const match = contents.match(
            /description\((?<description>[\S\s]*)\);/,
          );
          if (match === null) {
            console.log(contents);
            throw new Error(`Could not parse ${info}`);
          }

          descriptions.push(match.groups!["description"]);
        }

        return `
          export const photos = [
            ${descriptions.join(",\n")}
          ];
        `;
      }
    },
  };
}

export { dataPlugin };
