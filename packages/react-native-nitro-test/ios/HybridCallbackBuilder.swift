import Foundation
import NitroModules

class HybridCallbackBuilder: HybridCallbackBuilderSpec {
  private let callback: MyCallback

  init(callback: MyCallback) {
    self.callback = callback
    let testString = "Test data here!"
    let buffer = ArrayBuffer.allocate(size: testString.utf8.count)
    testString.utf8.enumerated().forEach { (index, byte) in
      buffer.data[index] = byte
    }

    callback.onSimpleEvent(testString)
    callback.onMaybeData(buffer)
  }
}
