import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  docs: [
    {
      type: 'category',
      label: 'Getting started',
      items: [
        'what-is-nitro',
        'using-nitro-in-your-app',
        'using-nitro-in-a-library',
        'configuration-nitro-json',
        'minimum-requirements',
      ]
    },
    {
      type: 'category',
      label: 'Concepts',
      items: [
        'nitro-modules',
        'hybrid-objects',
        'nitrogen',
      ]
    },
    {
      type: 'category',
      label: 'Guides',
      items: [
        'errors',
        'performance-tips',
        'worklets',
        'entry-point',
        'sync-vs-async',
        'view-components',
        'troubleshooting',
      ]
    },
    {
      type: 'category',
      label: 'Types',
      items: [
        'types/types',
        'types/primitives',
        'types/arrays',
        'types/optionals',
        'types/tuples',
        'types/variants',
        'types/promises',
        'types/callbacks',
        'types/typed-maps',
        'types/untyped-maps',
        'types/array-buffers',
        'types/hybrid-objects',
        'types/custom-types',
      ],
    },
    {
      type: 'category',
      label: 'Resources',
      items: [
        'comparison',
        'for-library-users',
        'contributing',
      ]
    },
  ],
};

export default sidebars;
