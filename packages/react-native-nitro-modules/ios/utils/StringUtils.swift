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
  
  @inline(__always)
  private static func createJSIString(runtime: inout facebook.jsi.Runtime, buffer: UnsafePointer<UInt8>, count: Int, isAscii: Bool) -> facebook.jsi.String {
    if isAscii {
      // createFromAscii expects char*
      let pointer = UnsafeRawPointer(buffer).assumingMemoryBound(to: CChar.self)
      return facebook.jsi.String.createFromAscii(&runtime, pointer, count)
    } else {
      // createFromUtf8 expects uint8_t*
      return facebook.jsi.String.createFromUtf8(&runtime, buffer, count)
    }
  }
  
  public static func toJSString(runtime: inout facebook.jsi.Runtime, string: inout String) -> facebook.jsi.String {
    // Fast path: contiguous UTF-8 storage available
    if let buf = string.utf8.withContiguousStorageIfAvailable({ $0 }) {
      var isAscii = true
      for b in buf where b & 0x80 != 0 { isAscii = false; break }

      let result = buf.withMemoryRebound(to: UInt8.self, { (buffer) -> facebook.jsi.String? in
        guard let baseAddress = buffer.baseAddress else { return nil }
        return createJSIString(runtime: &runtime,
                               buffer: baseAddress,
                               count: buffer.count,
                               isAscii: isAscii)
      })
      if let result {
        return result
      }
    }

    // Fallback: materialize once
    let bytes = Array(string.utf8)
    var isAscii = true
    for b in bytes where b & 0x80 != 0 { isAscii = false; break }

    var result: facebook.jsi.String? = nil
    bytes.withUnsafeBufferPointer { buffer in
      guard let baseAddress = buffer.baseAddress else { return }
      result = createJSIString(runtime: &runtime,
                               buffer: baseAddress,
                               count: buffer.count,
                               isAscii: isAscii)
    }
    if let result {
      return result
    }
    
    // Super slow path: C++ copy
    let cppString = std.string(string)
    return facebook.jsi.String.createFromUtf8(&runtime, cppString)
  }
}
