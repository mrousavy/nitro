//
//  ReferenceState.hpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 03.02.24.
//

#pragma once

#include <atomic>
#include <mutex>

namespace margelo::nitro {

/**
 * Holds state for an `OwningReference` (or `BorrowingReference`).
 *
 * The state tracks the amount of strong- and weak- references to any kind of value,
 * including an extra `isDeleted` flag that specifies whether the value has been force-deleted.
 *
 * Also, a `mutex` allows for thread-safe access of the `isDeleted` flag.
 */
struct ReferenceState {
  std::atomic_size_t strongRefCount;
  std::atomic_size_t weakRefCount;
  bool isDeleted;
  std::mutex mutex;

  explicit ReferenceState() : strongRefCount(1), weakRefCount(0), isDeleted(false) {}
};

} // namespace margelo::nitro
