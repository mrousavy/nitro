import { type HybridObject } from 'react-native-nitro-modules'

/**
 * Input passed to the JS callback from native code.
 */
export type Issue1439CallInput = {
  value: string
}

/**
 * Params struct that wraps the JS callback, mirroring the HybridRemoteClientCallHandlerParams
 * pattern from the real-world use case described in issue #1439.
 */
export type Issue1439Params = {
  fn: (input: Issue1439CallInput) => Promise<string>
}

/**
 * Reproduces issue #1439:
 * https://github.com/mrousavy/nitro/issues/1439
 *
 * A JS async function is passed inside a struct to native code.
 * Native invokes it twice from a background thread:
 *   - First invocation: the JS function throws an error
 *   - Second invocation: should succeed, but hangs forever
 */
export interface Issue1439 extends HybridObject<{ ios: 'swift'; android: 'kotlin' }> {
  /**
   * Calls `params.fn` twice from a native background thread.
   * The first call is expected to throw; the second should return "second".
   * Returns the result of the second call.
   */
  callFnTwiceFirstThrows(params: Issue1439Params): Promise<string>
}
