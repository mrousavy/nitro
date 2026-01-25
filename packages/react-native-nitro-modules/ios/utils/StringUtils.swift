//
// Created by Marc Rousavy on 20.01.26.
//

public final class StringUtils {
  public static func createString(bytes: UnsafeRawPointer, length: Int, isAscii: Bool) -> String {
    if isAscii {
      let castBytes = bytes.assumingMemoryBound(to: CChar.self)
      let pointer = UnsafeBufferPointer(start: castBytes, count: length)
      return String(utf8String: pointer.baseAddress!)!
    } else {
      let castBytes = bytes.assumingMemoryBound(to: unichar.self)
      let pointer = UnsafeBufferPointer(start: castBytes, count: length)
      return String(utf16CodeUnits: pointer.baseAddress!, count: length)
    }
  }
}
