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
 * Holds state for an `BorrowingReference` (or `WeakReference`).
 *
 * The state tracks the amount of strong- and weak- references to any kind of value,
 * including an extra `isDeleted` flag that specifies whether the value has been force-deleted.
 *
 * Also, a `mutex` allows for thread-safe access of the `isDeleted` flag.
 */
struct ReferenceState {
  std::atomic_size_t strongRefCount;
  std::atomic_size_t weakRefCount;
  std::atomic<bool> isDeleted;
  std::mutex mutex;

  /**
   * Decrements the strong ref count by one, and returns whether the value should be deleted.
   */
  inline bool decrementStrongRefCount() {
    size_t oldRefCount = strongRefCount.fetch_sub(1);
    return oldRefCount <= 1;
  }

  /**
   * Increments the strong ref count by one, but only if it is not already zero, and returns whether it did.
   *
   * A zero strong count means the final strong release is already under way, so the value is about to be
   * destroyed even if `isDeleted` has not been set yet - `~BorrowingReference` decrements the count BEFORE
   * calling `forceDestroyValue()`. Handing out a strong reference in that window would resurrect a dying value,
   * and the resurrected reference would then run a second final release. This is `weak_ptr::lock()`'s
   * increment-if-not-zero.
   */
  inline bool tryIncrementStrongRefCount() {
    size_t count = strongRefCount.load();
    while (count != 0) {
      if (strongRefCount.compare_exchange_weak(count, count + 1)) {
        return true;
      }
    }
    return false;
  }

  // `weakRefCount` starts at 1: the strong cohort collectively owns one implicit weak reference, released by
  // whichever strong reference performs the final strong release (after it destroyed the value). The state is
  // freed by whoever brings `weakRefCount` to zero, decided by `fetch_sub`'s return value alone.
  //
  // This is the same shape as `shared_ptr`'s control block, and it exists because the previous scheme ("delete
  // the state when `strong == 0 && weak == 0`") read the two counters non-atomically as a unit: a last-strong
  // releaser and a last-weak releaser running concurrently could BOTH observe (0, 0) and double-delete the
  // state - or one could read a state the other had already freed.
  explicit ReferenceState() : strongRefCount(1), weakRefCount(1), isDeleted(false) {}
};

} // namespace margelo::nitro
