import Foundation
import NitroModules

class HybridCallbackTester: HybridCallbackTesterSpec {
  func createBuilder(callback: MyCallback) throws -> any HybridCallbackBuilderSpec {
    return HybridCallbackBuilder(callback: callback)
  }
}
