//
//  BorrowingReference.hpp
//  NitroModules
//
//  Created by Marc Rousavy on 21.06.24.
//

#pragma once

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
  BorrowingReference() : _value(nullptr), _isDeleted(nullptr), _strongRefCount(nullptr), _weakRefCount(nullptr), _mutex(nullptr) {}

  BorrowingReference(const BorrowingReference& ref)
      : _value(ref._value), _isDeleted(ref._isDeleted), _strongRefCount(ref._strongRefCount), _weakRefCount(ref._weakRefCount),
        _mutex(ref._mutex) {
    // increment ref count after copy
    (*_weakRefCount)++;
  }

  BorrowingReference(BorrowingReference&& ref)
      : _value(ref._value), _isDeleted(ref._isDeleted), _strongRefCount(ref._strongRefCount), _weakRefCount(ref._weakRefCount),
        _mutex(ref._mutex) {
    ref._value = nullptr;
    ref._isDeleted = nullptr;
    ref._strongRefCount = nullptr;
    ref._weakRefCount = nullptr;
  }

  BorrowingReference& operator=(const BorrowingReference& ref) {
    if (this == &ref)
      return *this;

    if (_weakRefCount != nullptr) {
      // destroy previous pointer
      (*_weakRefCount)--;
      maybeDestroy();
    }

    _value = ref._value;
    _isDeleted = ref._isDeleted;
    _strongRefCount = ref._strongRefCount;
    _weakRefCount = ref._weakRefCount;
    _mutex = ref._mutex;
    if (_weakRefCount != nullptr) {
      // increment new pointer
      (*_weakRefCount)++;
    }

    return *this;
  }

  ~BorrowingReference() {
    if (_weakRefCount == nullptr) {
      // we are just a dangling nullptr.
      return;
    }

    (*_weakRefCount)--;
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
    _mutex->lock();

    if (*_strongRefCount == 0 && *_weakRefCount == 0) {
      // free the full memory if there are no more references at all
      if (!(*_isDeleted)) {
        delete _value;
      }
      delete _isDeleted;
      delete _strongRefCount;
      delete _weakRefCount;
      _mutex->unlock();
      return;
    }

    _mutex->unlock();
  }

private:
  T* _value;
  bool* _isDeleted;
  std::atomic_size_t* _strongRefCount;
  std::atomic_size_t* _weakRefCount;
  std::recursive_mutex* _mutex;
};

} // namespace margelo::nitro
