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
    'what-is-nitro',
    'nitro-modules',
    'hybrid-objects',
    'nitrogen',
    'minimum-requirements',
    'using-nitro-in-your-app',
    'using-nitro-in-a-library',
    'configuration-nitro-json',
    'sync-vs-async',
    'view-components',
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
    'errors',
    'performance-tips',
    'worklets',
    'entry-point',
    'comparison',
    'for-users',
    'troubleshooting',
    'contributing',
  ],
};

export default sidebars;
