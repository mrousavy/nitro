//
// Created by Marc Rousavy on 20.01.26.
//

public final class StringUtils {
  public static func createString(bytes: UnsafeRawPointer, length: Int, isAscii: Bool) -> String {
    if isAscii {
      let castBytes = bytes.assumingMemoryBound(to: UInt8.self)
      let pointer = UnsafeBufferPointer(start: castBytes, count: length)
      return String(decoding: pointer, as: UTF8.self)
    } else {
      let castBytes = bytes.assumingMemoryBound(to: UInt16.self)
      let pointer = UnsafeBufferPointer(start: castBytes, count: length)
      return String(decoding: pointer, as: UTF16.self)
    }
  }
}
