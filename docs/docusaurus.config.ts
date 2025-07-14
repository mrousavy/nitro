import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Nitro Modules',
  tagline:
    'A framework to build mindblowingly fast native modules with type-safe statically compiled JS bindings.',
  favicon: '/img/favicon.ico',

  // Set the production url of your site here
  url: 'https://nitro.margelo.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  organizationName: 'mrousavy',
  projectName: 'nitro',
  trailingSlash: false,
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  future: {
    experimental_faster: true,
    v4: true
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],
  plugins: [
    [
      'vercel-analytics',
      { },
    ],
    [
      'docusaurus-plugin-llms',
      {
        generateLLMsTxt: true,
        generateLLMsFullTxt: true,
        includeOrder: [
          'what-is-nitro.md',
          'nitro-modules.md',
          'hybrid-objects.md',
          'hybrid-views.md',
          'nitrogen.md',
          'using-nitro-in-a-library.md',
          'using-nitro-in-your-app.md',
        ]
      },
    ],
  ],

  markdown: {
    mermaid: true,
  },
  themes: ['@docusaurus/theme-mermaid'],
  themeConfig: {
    image: 'img/social-card.png',
    tableOfContents: {
      minHeadingLevel: 2,
      maxHeadingLevel: 5,
    },
    headTags: [
      {
        tagName: 'link',
        attributes: {
          rel: 'stylesheet',
          href: 'https://api.fontshare.com/css?f[]=clash-display@500&display=swap',
        },
      },
      {
        tagName: 'link',
        attributes: {
          rel: 'stylesheet',
          href: 'https://api.fontshare.com/css?f[]=satoshi@500,600,700&display=swap',
        },
      },
    ],
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    navbar: {
      logo: {
        alt: 'Nitrous Logo',
        src: 'img/logo.svg',
        srcDark: 'img/logo-dark.svg',
        height: 32,
        width: 160,
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docs',
          position: 'right',
          label: 'Docs',
        },
        {
          type: 'doc',
          docId: 'for-library-users',
          position: 'right',
          label: 'Installation',
        },
        {
          href: 'https://github.com/mrousavy/nitro/releases/latest',
          label: 'Latest Release',
          position: 'right',
        },
        {
          href: 'https://github.com/mrousavy/nitro',
          label: 'GitHub',
          position: 'right',
        },
        {
          type: 'search',
          position: 'right',
        },
      ],
    },
    algolia: {
      appId: 'Y788VW5KZO',
      apiKey: 'c077f6bb95a5a11a69a7e65315a795c5',
      indexName: 'mrousavyio',
      contextualSearch: true,
      searchPagePath: false,
      insights: false,
      replaceSearchResultPathname: {
        from: '/nitro/',
        to: '/'
      }
    },
    sitemap: {
      lastmod: 'date',
      changefreq: 'weekly',
      priority: 0.5,
      ignorePatterns: ['/tags/**'],
      filename: 'sitemap.xml',
      createSitemapItems: async (params) => {
        const { defaultCreateSitemapItems, ...rest } = params;
        const items = await defaultCreateSitemapItems(rest);
        return items.filter((item) => !item.url.includes('/page/'));
      },
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Community',
          items: [
            {
              label: 'Discord',
              href: 'https://margelo.com/discord',
            },
            {
              label: 'Twitter',
              href: 'https://twitter.com/mrousavy',
            },
            {
              label: 'GitHub Sponsors',
              href: 'https://github.com/sponsors/mrousavy',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'mrousavy.com',
              href: 'https://mrousavy.com',
            },
            {
              label: 'margelo.com',
              href: 'https://margelo.com',
            },
            {
              label: 'Nitro Benchmarks',
              href: 'https://github.com/mrousavy/NitroBenchmarks',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Marc Rousavy / Margelo`,
    },
    metadata: [
      {
        name: 'author',
        content: 'Marc Rousavy',
      },
      {
        name: 'keywords',
        content:
          'react, native, nitro, modules, react-native, native, turbo, expo, documentation, fast, hybrid, hybrid-object, objects, nitrogen, coding, docs, guides, marc, rousavy, mrousavy',
      },
      {
        name: 'og:title',
        content: 'Nitro Documentation',
      },
      {
        name: 'og:type',
        content: 'application',
      },
      {
        name: 'og:description',
        content:
          'A framework to build mindblowingly fast native modules with type-safe statically compiled JS bindings.',
      },
      {
        name: 'og:image',
        content: '/img/social-card.png',
      },
    ],
    prism: {
      theme: prismThemes.oneLight,
      darkTheme: prismThemes.oneDark,
      additionalLanguages: [
        'bash',
        'json',
        'kotlin',
        'ruby',
        'cmake',
        'groovy',
        'java',
      ],
      magicComments: [
        {
          className: 'theme-code-block-highlighted-line',
          line: 'highlight-next-line',
          block: { start: 'highlight-start', end: 'highlight-end' },
        },
        {
          className: 'code-block-diff-add-line',
          line: 'diff-add',
        },
        {
          className: 'code-block-diff-remove-line',
          line: 'diff-remove',
        },
        {
          className: 'code-block-error-line',
          line: 'code-error',
        },
      ],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
