//
//  OwningLock.hpp
//  Nitro
//
//  Created by Marc Rousavy on 30.07.24.
//

#pragma once

namespace margelo::nitro {
template <typename T>
class BorrowingReference;
}

#include "BorrowingReference.hpp"
#include <cstddef>
#include <mutex>

namespace margelo::nitro {

/**
 * An `OwningLock<T>` is a RAII instance that locks the given caller thread guaranteed safe access
 * to a `BorrowingReference<T>`.
 * The `BorrowingReference<T>` cannot be deleted while an `OwningLock<T>` of it is alive.
 *
 * This is useful in JSI, because Hermes runs garbage collection on a separate Thread,
 * and the separate Thread can delete an `BorrowingReference<T>` while it's still in use.
 * The `OwningLock<T>` prevents exactly this problem by blocking the GC destructor until
 * the `OwningLock<T>` is released.
 *
 * To create an `OwningLock<T>`, simply call `lock()` on an `BorrowingReference<T>`.
 */
template <typename T>
class OwningLock final {
private:
  explicit OwningLock(const BorrowingReference<T>& reference) : _reference(reference) {
    _reference._state->mutex.lock();
  }

public:
  ~OwningLock() {
    _reference._state->mutex.unlock();
  }

  OwningLock() = delete;
  OwningLock(const OwningLock&) = delete;
  OwningLock(OwningLock&&) = delete;

private:
  BorrowingReference<T> _reference;

private:
  friend class BorrowingReference<T>;
};

} // namespace margelo::nitro
