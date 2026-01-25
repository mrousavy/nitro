//
// Created by Marc Rousavy on 20.01.26.
//

public final class StringUtils {
  /**
   * Create a Swift `String` from the given UTF8/ASCII bytes (`void*`),
   * with the given `length`.
   *
   * The `length` is the number of characters in the String,
   * which (in UTF8) is also the size of the data, in bytes.
   */
  @inline(__always)
  public static func createUTF8String(bytes: UnsafeRawPointer, length: Int) -> String {
    return String(unsafeUninitializedCapacity: length) { buffer in
      memcpy(buffer.baseAddress, bytes, length)
      return length
    }
  }

  /**
   * Create a Swift `String` from the given UTF16 bytes (`utf16_t*`),
   * with the given `length`.
   *
   * The `length` is the number of characters in the String, which
   * is not always the same as the data's size in bytes.
   */
  @inline(__always)
  public static func createUTF16String(bytes: UnsafePointer<UInt16>, length: Int) -> String {
    return String(utf16CodeUnits: bytes, count: length)
  }
}
