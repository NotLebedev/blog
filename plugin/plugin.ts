import fs from "node:fs/promises";
import path from "node:path";
import sharp, { Metadata } from "sharp";
import { Plugin } from "vite";

function calcWidth(targetHeight: number, metadata: Metadata) {
  return metadata.width * (targetHeight / metadata.height);
}

function dataPlugin(): Plugin {
  const virtualModuleId = "virtual:data";
  const resolvedVirtualModuleId = virtualModuleId + ".tsx";
  const imagePrefix = "/__images__";

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
            /description\(\{(?<description>[\S\s]*)\}\);/,
          );
          if (match === null) {
            console.log(contents);
            throw new Error(`Could not parse ${info}`);
          }

          const infoDir = path.dirname(info);
          const infoName = path.basename(infoDir);

          // imageOutPath and previewOutPath are
          // code, strings need to be quoted
          let imageOutPath!: string;
          let previewOutPath!: string;
          if (process.env.NODE_ENV === "development") {
            imageOutPath = `"${imagePrefix}/${infoName}/image.jpg"`;
            previewOutPath = `"${imagePrefix}/${infoName}/preview.jpg"`;
          } else {
            const image = await sharp(
              path.join(infoDir, "image.jpg"),
            ).toBuffer();
            const preview = await sharp(path.join(infoDir, "image.jpg"))
              .resize(undefined, 512)
              .toBuffer();

            const ROLLUP_PREFIX = "import.meta.ROLLUP_FILE_URL_";

            imageOutPath =
              ROLLUP_PREFIX +
              this.emitFile({
                type: "asset",
                fileName: `assets/images/${infoName}/image.jpg`,
                source: image,
              });

            previewOutPath =
              ROLLUP_PREFIX +
              this.emitFile({
                type: "asset",
                fileName: `assets/images/${infoName}/preview.jpg`,
                source: preview,
              });
          }

          descriptions.push(`{
            ${match.groups!["description"]}
            id: "${path.basename(infoDir)}",
            previewWidth: ${calcWidth(512, await sharp(path.join(infoDir, "image.jpg")).metadata())},
            imageUrl: ${imageOutPath},
            previewUrl: ${previewOutPath},
          }`);
        }

        return `
          export const photos = [
            ${descriptions.join(",\n")}
          ];
        `;
      }
    },

    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith(imagePrefix)) {
          return next();
        }

        try {
          const [, , infoName, filename] = req.url.split("/");

          let s = sharp(
            path.join("src", "Data", "photos", infoName, "image.jpg"),
          );

          switch (filename) {
            case "preview.jpg":
              s = s.resize(undefined, 512);
              break;
            case "image.jpg":
              break;
            default:
              throw new Error(
                `Filename must be either image.jpg preview.jpg. Got ${filename}`,
              );
          }

          res.setHeader("Content-Type", "image/jpg");
          res.end(await s.toBuffer());
        } catch (err) {
          res.statusCode = 500;
          res.end("Error: " + (err as Error).message);
        }
      });
    },
  };
}

export { dataPlugin };
