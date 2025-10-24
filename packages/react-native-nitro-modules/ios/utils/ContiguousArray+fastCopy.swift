//
//  ContiguousArray+fastCopy.swift
//  NitroModules
//
//  Created by Marc Rousavy on 24.10.2025.
//

import Cxx
import Foundation

extension ContiguousArray {
  ///
  /// Copies the given `vector` into a new `ContiguosArray`.
  ///
  /// @discussion
  /// If the given `vector` provides access to it's contiguous storage,
  /// this method performs a fast-copy (= direct `memcpy`).
  /// Otherwise, a normal copy (= looping over each element) is made.
  ///
  public static func fastCopy(vector: some CxxVector<Element> & Sequence<Element>)
    -> ContiguousArray
  {
    let size = Int(vector.size())

    let result = vector.withContiguousStorageIfAvailable { data in
      return ContiguousArray<Element>(unsafeUninitializedCapacity: size) {
        buffer, initializedCount in
        let bytesCount = size * MemoryLayout<Element>.stride
        memcpy(buffer.baseAddress!, data.baseAddress, bytesCount)
        initializedCount = size
      }
    }
    if let result {
      // FAST PATH: We did a perfect 1:1 memcpy on the underlying contiguous data!
      return result
    } else {
      // SLOW PATH: We need to loop through the Array
      return ContiguousArray(vector)
    }
  }
}
