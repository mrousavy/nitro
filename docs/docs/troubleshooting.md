---
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Troubleshooting

This guide helps you troubleshoot issues in Nitro and should give you enough context to open a well-formed issue, even if you're not a native developer.

## Minimum requirements

First, make sure you meet the minimum requirements for Nitro:

- **react-native 0.75** or above
- **Xcode 16** or above

## Build error

If your app fails to build after installing Nitro or a library powered by Nitro, make sure to post full build logs:

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

  1. Build the app with Android Studio.
  2. When the build fails in Android Studio, open the "Build" tab from within the bottom left sidebar:

      <img alt="Build tab in Android Studio" src="/img/troubleshoot-android-1.png" />

  3. Find the top-most entry in the Build window (which contains full unfiltered logs) and click it:

      <img alt="Build tab in Android Studio" src="/img/troubleshoot-android-2.png" />

  4. Copy those full logs and paste them in the GitHub issue (or serve via pastebin). Make sure they actually contain the **error** message and not just something like "BUILD FAILED in 7s" (which is what most people post):

      <img alt="Build logs in Android Studio" src="/img/troubleshoot-android-3.png" />

  </TabItem>
</Tabs>

## Runtime error

If your app crashes at runtime, make sure to inspect the native logs.

<Tabs groupId="platform">
  <TabItem value="ios" label="iOS" default>

  1. Run your app through Xcode
  2. If the app hits an unhandled error, it should pause in Xcode. Share the line it stopped in, and also the call-stack (stacktrace) on the left side.
  3. If the app didn't pause, then it might have been a handled error - in this case just check the Xcode logs at the bottom:

      <img alt="Bottom of runtime logs" src="/img/troubleshoot-xcode-logs.png" />

  </TabItem>
  <TabItem value="android" label="Android">

  1. Run your app through Android Studio by using the Debug button (🪲)
  2. If the app hits an unhandled error, it should pause in Android Studio. Share the line it stopped in, and also the call-stack (stacktrace) on the bottom window.
  3. If the app didn't pause, then it might have been a handled error - in this case just check the Android Logcat logs at the bottom:

      <img alt="Bottom of runtime logs" src="/img/troubleshoot-android-logs.png" />

  </TabItem>
</Tabs>
