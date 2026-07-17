//
//  HybridIssue1439.swift
//  react-native-nitro-test
//
//  Reproduces https://github.com/mrousavy/nitro/issues/1439
//

import NitroModules

class HybridIssue1439: HybridIssue1439Spec {
  /**
   * Calls params.fn twice from a native background context.
   * - First call: the JS function throws an error
   * - Second call: should succeed, but hangs on Android due to issue #1439
   */
  func callFnTwiceFirstThrows(params: Issue1439Params) throws -> Promise<String> {
    return Promise.async {
      // First invocation — expected to throw
      do {
        let innerPromise1 = try await params.fn(Issue1439CallInput(value: "first")).await()
        let result1 = try await innerPromise1.await()
        print("[HybridIssue1439] First call unexpectedly succeeded with: \(result1)")
      } catch {
        print("[HybridIssue1439] First call threw as expected: \(error)")
      }

      // Second invocation — should succeed but hangs on Android due to issue #1439
      print("[HybridIssue1439] Starting second invocation...")
      let innerPromise2 = try await params.fn(Issue1439CallInput(value: "second")).await()
      let result2 = try await innerPromise2.await()
      print("[HybridIssue1439] Second call returned: \(result2)")
      return result2
    }
  }
}
