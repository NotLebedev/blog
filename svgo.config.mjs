import crypto from "node:crypto";

/** @type {import('svgo').Config} */
export default {
  plugins: [
    "preset-default",
    {
      name: "prefixIds",
      params: {
        delim: "-",
        prefix: (_node, info) =>
          // https://github.com/svg/svgo/issues/674
          // Using hash from path to ensure stable and reproducible naming
          crypto.hash("sha256", info.path).toString("hex").slice(0, 6),
      },
    },
  ],
};
