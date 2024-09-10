import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Nitro Modules',
  tagline: 'A framework to build mindblowingly fast native modules with type-safe statically compiled JS bindings.',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://mrousavy.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/nitro/',

  // GitHub pages deployment config.
  organizationName: 'mrousavy',
  projectName: 'nitro',
  deploymentBranch: 'gh-pages',
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
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Nitro',
      logo: {
        alt: 'Nitrous Logo',
        src: 'img/nos.png',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docs',
          position: 'left',
          label: 'Docs',
        },
        {
          href: 'https://github.com/mrousavy/nitro',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Community',
          items: [
            {
              label: 'Discord',
              href: 'https://discordapp.com/invite/docusaurus',
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
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Marc Rousavy / Margelo`,
    },
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
          className: 'code-block-diff-add-line',
          line: 'diff-add'
        },
        {
          className: 'code-block-diff-remove-line',
          line: 'diff-remove'
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
