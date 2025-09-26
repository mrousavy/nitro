import type { LoadContext, Plugin } from "@docusaurus/types";

// 1) register loaders for .ts/.tsx (sync)
import { register } from "esbuild-register/dist/node";
const { unregister } = register({ extensions: [".ts", ".tsx"] });

interface Options {

}

export default function plugin(context: LoadContext, opts: Options = {}): Plugin {
  console.log(`Plugin running!!!!`)
  return {
    name: 'generate-og-images',
    async postBuild({ outDir }) {
      const { runPlugin } = (await import("./plugin.tsx"));
      await runPlugin()
    }
  }
}

