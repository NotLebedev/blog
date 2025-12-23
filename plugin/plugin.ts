import fs from "node:fs/promises";
import path from "node:path";
import sharp, { Metadata } from "sharp";
import { Plugin } from "vite";
import { PluginContext } from "rollup";

const VIRTUAL_MODULE_NAME = "virtual:data";
const RESOLVED_VIRTUAL_MODULE_NAME = VIRTUAL_MODULE_NAME + ".tsx";
const IMAGES_SERVE_PREFIX = "/__images__";

const CONTENT_DIR = "src/Content/photos";
const CONTENT_PHOTO = "image.jpg";

const OUTPUT_DIR = "assets/images";
const OUTPUT_FULL_FILE_NAME = "full.jpg";
const OUTPUT_PREVIEW_FILE_NAME = "preview.jpg";

function calcWidth(targetHeight: number, metadata: Metadata) {
  return Math.round(metadata.width * (targetHeight / metadata.height));
}

type ImagePrepareInfo = {
  imageUrl: string;
  previewUrl: string;
};

function isDev(): boolean {
  return process.env.NODE_ENV === "development";
}

function prepareImageForDev(id: string): ImagePrepareInfo {
  const imageUrl = `"${path.join(
    IMAGES_SERVE_PREFIX,
    id,
    OUTPUT_FULL_FILE_NAME,
  )}"`;

  const previewUrl = `"${path.join(
    IMAGES_SERVE_PREFIX,
    id,
    OUTPUT_PREVIEW_FILE_NAME,
  )}"`;
  return { imageUrl, previewUrl };
}

const JPEG_OPTIONS: sharp.JpegOptions = {
  chromaSubsampling: "4:4:4",
  progressive: true,
  mozjpeg: true,
};

async function makeImage(src: string): Promise<Buffer> {
  return await sharp(src).jpeg(JPEG_OPTIONS).toBuffer();
}

async function makePreview(src: string): Promise<Buffer> {
  return await sharp(src).resize(undefined, 512).jpeg(JPEG_OPTIONS).toBuffer();
}

async function prepareImageForBuild(
  ctx: PluginContext,
  src: string,
  id: string,
): Promise<ImagePrepareInfo> {
  const image = await makeImage(src);
  const preview = await makePreview(src);

  const ROLLUP_PREFIX = "import.meta.ROLLUP_FILE_URL_";

  const imageUrl =
    ROLLUP_PREFIX +
    ctx.emitFile({
      type: "asset",
      fileName: path.join(OUTPUT_DIR, id, OUTPUT_FULL_FILE_NAME),
      source: image,
    });

  const previewUrl =
    ROLLUP_PREFIX +
    ctx.emitFile({
      type: "asset",
      fileName: path.join(OUTPUT_DIR, id, OUTPUT_PREVIEW_FILE_NAME),
      source: preview,
    });

  return { imageUrl, previewUrl };
}

async function makePhotos(ctx: PluginContext) {
  const photos = [];
  for await (const info of fs.glob(path.join(CONTENT_DIR, "*", "info.tsx"))) {
    const contents = await fs.readFile(info, { encoding: "utf-8" });
    const match = contents.match(/photo\(\{(?<description>[\S\s]*)\}\);/);
    if (match === null) {
      throw new Error(`Could not parse ${info}`);
    }
    const infoMap = match.groups!["description"];

    const infoDir = path.dirname(info);
    const id = path.basename(infoDir);

    const src = path.join(infoDir, CONTENT_PHOTO);
    const previewWidth = calcWidth(512, await sharp(src).metadata());

    // imageOutPath and previewOutPath are
    // code, strings need to be quoted
    const { imageUrl, previewUrl } = isDev()
      ? prepareImageForDev(id)
      : await prepareImageForBuild(ctx, src, id);

    photos.push(`{
      ${infoMap}
      id: "${id}",
      previewWidth: ${previewWidth},
      imageUrl: ${imageUrl},
      previewUrl: ${previewUrl},
    }`);
  }

  return photos;
}

async function makePosts(): Promise<string[]> {
  const posts: string[] = [];
  for await (const info of fs.glob(
    path.join("src/Content/blogs", "*", "post.tsx"),
  )) {
    const contents = await fs.readFile(info, { encoding: "utf-8" });
    const match = contents.match(/post\(\{(?<description>[\S\s]*)\}\);/);
    if (match === null) {
      throw new Error(`Could not parse ${info}`);
    }
    const infoMap = match.groups!["description"];
    const infoDir = path.dirname(info);
    const id = path.basename(infoDir);

    // TODO: this is awful, I should really use ts parser
    // to transform these files
    if (!isDev() && infoMap.match(/ {2}status: "draft"/) !== null) {
      continue;
    }

    posts.push(`{
      ${infoMap}
      id: "${id}",
    }`);
  }
  return posts;
}

function contentPlugin(): Plugin {
  return {
    name: "vite-data-plugin",

    resolveId(id: string) {
      if (id === VIRTUAL_MODULE_NAME || id === RESOLVED_VIRTUAL_MODULE_NAME) {
        return RESOLVED_VIRTUAL_MODULE_NAME;
      }
    },

    async load(id: string) {
      if (id === RESOLVED_VIRTUAL_MODULE_NAME) {
        return `
          export const photos = [
            ${(await makePhotos(this)).join(",\n")}
          ];

          export const posts = [
            ${(await makePosts()).join(",\n")}
          ];

          export function post(any) {}
        `;
      }
    },

    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith(IMAGES_SERVE_PREFIX)) {
          return next();
        }

        try {
          const [, , id, filename] = req.url.split("/");

          const src = path.join(CONTENT_DIR, id, CONTENT_PHOTO);

          let imageBuffer;
          switch (filename) {
            case OUTPUT_PREVIEW_FILE_NAME:
              imageBuffer = await makePreview(src);
              break;
            case OUTPUT_FULL_FILE_NAME:
              imageBuffer = await makeImage(src);
              break;
            default:
              throw new Error(
                `Filename must be either ${OUTPUT_FULL_FILE_NAME} or ${OUTPUT_PREVIEW_FILE_NAME}. Got ${filename}`,
              );
          }

          res.setHeader("Content-Type", "image/jpg");
          res.end(imageBuffer);
        } catch (err) {
          res.statusCode = 500;
          res.end("Error: " + (err as Error).message);
        }
      });
    },
  };
}

export default contentPlugin;
