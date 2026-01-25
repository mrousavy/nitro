//
// Created by Marc Rousavy on 20.01.26.
//

public final class StringUtils {
  /**
   * Create a Swift `String` from the given ASCII bytes (`void*`),
   * with the given `bytesCount`.
   *
   * The `bytesCount` is the size of `bytes`, which, in ASCII,
   * is the same as the amount of characters in the String.
   */
  @inline(__always)
  public static func createASCIIString(bytes: UnsafeRawPointer, bytesCount: Int) -> String {
    return String(unsafeUninitializedCapacity: bytesCount) { buffer in
      memcpy(buffer.baseAddress, bytes, bytesCount)
      return bytesCount
    }
  }

  /**
   * Create a Swift `String` from the given UTF16 bytes (`utf16_t*`),
   * with the given `charactersCount`.
   *
   * The `charactersCount` is the number of characters in the String, which
   * is not always the same as the data's size in bytes.
   */
  @inline(__always)
  public static func createUTF16String(bytes: UnsafePointer<UInt16>, charactersCount: Int) -> String {
    return String(utf16CodeUnits: bytes, count: charactersCount)
  }
}
