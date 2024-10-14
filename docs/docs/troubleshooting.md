---
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Troubleshooting

This guide helps you troubleshoot issues in Nitro and should give you enough context to open a well-formed issue, even if you're not a native developer.

## Build error

If your app fails to build after installing Nitro or a library powered by Nitro, make sure to check you meet the minimum requirements:

<Tabs groupId="platform">
  <TabItem value="ios" label="iOS" default>

  - react-native 0.75 or later (because Nitro uses `jsi::WeakObject` and `jsi::NativeState`)
  - Xcode 16
  - Swift 6 (in Xcode 16)

  </TabItem>
  <TabItem value="android" label="Android">

  - react-native 0.75 or later (because Nitro uses `jsi::WeakObject` and `jsi::NativeState`)

  </TabItem>
</Tabs>

If your app still doesn't build, make sure to post full build logs:

<Tabs groupId="platform">
  <TabItem value="ios" label="iOS" default>

  1. Build the app with Xcode.
  2. When the build fails in Xcode, open the "Report Navigator" tab from within the left sidebar:

      <img alt="Report Navigator tab in Xcode" src="/img/troubleshoot-xcode-1.png" />

  3. Then, find the most recent build attempt and click on "Build":

      <img alt="Last build report in Xcode" src="/img/troubleshoot-xcode-2.png" />

  4. Scroll through the build report and find the step(s) that failed to build. They usually have a ❌ icon on the left. Click on the parent item's hamburger menu on the right to open the full logs:

      <img alt="Error line in the build report" src="/img/troubleshoot-xcode-3.png" />

  5. Scroll down through the build logs (the long part is just the command invocation) to find the actual error messages:

      <img alt="Bottom of error logs" src="/img/troubleshoot-xcode-4.png" />

  6. Copy those bottom logs only (not the build command invocation above) and create a GitHub issue with that.

  </TabItem>
  <TabItem value="android" label="Android">

  - react-native 0.75 or later (because Nitro uses `jsi::WeakObject` and `jsi::NativeState`)

  </TabItem>
</Tabs>
