import type { LoadContext, Plugin } from "@docusaurus/types";

// register loaders for .ts/.tsx (sync)
import { register } from "esbuild-register/dist/node";
const { unregister } = register({ extensions: [".ts", ".tsx"] });
process.on('exit', () => unregister())

interface Options {
  width?: number
  height?: number
}

export default function plugin(context: LoadContext, { width, height }: Options = { }): Plugin {
  console.log(`Plugin running!!!!`)
  return {
    name: 'generate-og-images',
    async postBuild({ outDir }) {
      // @ts-expect-error we enabled .tsx import in esbuild at the top
      const { runPlugin } = (await import("./plugin.tsx"));
      await runPlugin({ width: width ?? 1200, height: height ?? 640 })
    }
  }
}

