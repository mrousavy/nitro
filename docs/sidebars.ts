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
        'how-to-build-a-nitro-module',
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
        'hybrid-views',
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
        'running-example-app',
      ]
    },
    {
      type: 'category',
      label: 'Types',
      items: [
        'types/typing-system',
        'types/primitives',
        'types/strings',
        'types/arrays',
        'types/array-buffers',
        'types/optionals',
        'types/nulls',
        'types/promises',
        'types/callbacks',
        'types/tuples',
        'types/variants',
        'types/dates',
        'types/typed-maps',
        'types/untyped-maps',
        'types/hybrid-objects',
        'types/custom-structs',
        'types/custom-enums',
        'types/custom-types',
        'types/raw-jsi-value',
      ],
    },
    {
      type: 'category',
      label: 'Resources',
      items: [
        'awesome-nitro-modules',
        'comparison',
        'for-library-users',
        'contributing',
      ]
    },
  ],
};

export default sidebars;
