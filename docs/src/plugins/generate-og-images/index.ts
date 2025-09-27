import type { LoadContext, Plugin, PluginRouteConfig, RouteConfig } from "@docusaurus/types";

// register loaders for .ts/.tsx (sync)
import { register } from "esbuild-register/dist/node";
const { unregister } = register({ extensions: [".ts", ".tsx"] });
process.on('exit', () => unregister())

interface Options {
  width?: number
  height?: number
}


interface Routes {
  routes?: Routes[]
}
function logRoutes(routes: Routes[]) {
  for (const route of routes) {
    console.log(JSON.stringify(route))
    if (route.routes != null) {
      logRoutes(route.routes)
    }
  }
}

export interface DocsPage {
  id: string
  title: string
  description?: string
  sidebar?: string
}

function getAllDocsRoutes(plugin: RouteConfig): DocsPage[] {
  const pages: DocsPage[] = []
  if (plugin.props != null) {
    if ("version" in plugin.props) {
      const version = plugin.props.version
      if (typeof version === 'object' && "docs" in version) {
        const docs = Object.values(version.docs) as DocsPage[]
        pages.push(...docs)
      }
    }
  }
  if (plugin.routes != null) {
    const subPages = plugin.routes.flatMap((r) => getAllDocsRoutes(r))
    pages.push(...subPages)
  }
  return pages
}

export default function plugin(context: LoadContext, { width, height }: Options = {}): Plugin {
  console.log(`Plugin running!!!!`)
  return {
    name: 'generate-og-images',
    async postBuild({ outDir, routesPaths, routes }) {
      const docsPages = routes.flatMap((r) => getAllDocsRoutes(r))
      // @ts-expect-error we enabled .tsx import in esbuild at the top
      const { runPlugin } = (await import("./plugin.tsx"));
      await runPlugin({
        width: width ?? 1200,
        height: height ?? 640,
        outDirectory: outDir,
        docsPages: docsPages
      })
    }
  }
}

