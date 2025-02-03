//
//  BorrowingReference.hpp
//  NitroModules
//
//  Created by Marc Rousavy on 21.06.24.
//

#pragma once

#include "ReferenceState.hpp"
#include <atomic>
#include <cstddef>
#include <mutex>

namespace margelo::nitro {

// forward-declaration to avoid duplicate symbols
template <typename T>
class OwningReference;

/**
 A `BorrowingReference<T>` is a weak reference to a pointer created by `OwningReference<T>`.
 It can be locked to gain a strong `OwningReference<T>` again if it has not been deleted yet.
 */
template <typename T>
class BorrowingReference final {
private:
  explicit BorrowingReference(const OwningReference<T>& ref);

public:
  BorrowingReference() : _value(nullptr), _state(nullptr) {}

  BorrowingReference(const BorrowingReference& ref) : _value(ref._value), _state(ref._state) {
    if (_state != nullptr) {
      // increment ref count after copy
      _state->weakRefCount++;
    }
  }

  BorrowingReference(BorrowingReference&& ref) : _value(ref._value), _state(ref._state) {
    ref._value = nullptr;
    ref._state = nullptr;
  }

  BorrowingReference& operator=(const BorrowingReference& ref) {
    if (this == &ref)
      return *this;

    if (_state != nullptr) {
      // destroy previous pointer
      _state->weakRefCount--;
      maybeDestroy();
    }

    _value = ref._value;
    _state = ref._state;
    if (_state != nullptr) {
      // increment new pointer
      _state->weakRefCount++;
    }

    return *this;
  }

  ~BorrowingReference() {
    if (_state == nullptr) {
      // we are just a dangling nullptr.
      return;
    }

    _state->weakRefCount--;
    maybeDestroy();
  }

  /**
   Try to lock the borrowing reference to an owning reference, or `nullptr` if it has already been deleted.
   */
  [[nodiscard]]
  OwningReference<T> lock() const;

public:
  friend class OwningReference<T>;

private:
  void maybeDestroy() {
    _state->mutex.lock();

    if (_state->strongRefCount == 0 && _state->weakRefCount == 0) {
      // free the full memory if there are no more references at all
      if (!_state->isDeleted) [[unlikely]] {
        // This should've happened in OwningReference already..
        delete _value;
        _state->isDeleted = true;
      }
      _state->mutex.unlock();
      delete _state;
      return;
    }

    _state->mutex.unlock();
  }

private:
  T* _value;
  ReferenceState* _state;
};

} // namespace margelo::nitro
