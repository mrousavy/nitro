//
//  OwningReference.hpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 23.06.24.
//

#pragma once

#include "BorrowingReference.hpp"
#include "OwningLock.hpp"
#include <atomic>
#include <cstddef>
#include <mutex>

namespace margelo::nitro {

/**
 An `OwningReference<T>` is a smart-pointer that holds a strong reference to a pointer.
 You can have multiple `OwningReference<T>` instances point to the same pointer, as they internally keep a ref-count.
 As opposed to a `shared_ptr<T>`, an `OwningReference<T>` can also be imperatively manually deleted, even if there
 are multiple strong references still holding onto the pointer.

 An `OwningReference<T>` can be weakified, which gives the user a `BorrowingReference<T>`.
 A `BorrowingReference<T>` can be locked to get an `OwningReference<T>` again, assuming it has not been deleted yet.
 */
template <typename T>
class OwningReference final {
public:
  using Pointee = T;

public:
  OwningReference() : _value(nullptr), _isDeleted(nullptr), _strongRefCount(nullptr), _weakRefCount(nullptr), _mutex(nullptr) {}

  explicit OwningReference(T* value)
      : _value(value), _isDeleted(new bool(false)), _strongRefCount(new std::atomic_size_t(1)), _weakRefCount(new std::atomic_size_t(0)),
        _mutex(new std::recursive_mutex()) {}

  OwningReference(const OwningReference& ref)
      : _value(ref._value), _isDeleted(ref._isDeleted), _strongRefCount(ref._strongRefCount), _weakRefCount(ref._weakRefCount),
        _mutex(ref._mutex) {
    // increment ref count after copy
    (*_strongRefCount)++;
  }

  OwningReference(OwningReference&& ref)
      : _value(ref._value), _isDeleted(ref._isDeleted), _strongRefCount(ref._strongRefCount), _weakRefCount(ref._weakRefCount),
        _mutex(ref._mutex) {
    ref._value = nullptr;
    ref._isDeleted = nullptr;
    ref._strongRefCount = nullptr;
    ref._weakRefCount = nullptr;
  }

  OwningReference& operator=(const OwningReference& ref) {
    if (this == &ref)
      return *this;

    if (_strongRefCount != nullptr) {
      // destroy previous pointer
      (*_strongRefCount)--;
      maybeDestroy();
    }

    _value = ref._value;
    _isDeleted = ref._isDeleted;
    _strongRefCount = ref._strongRefCount;
    _weakRefCount = ref._weakRefCount;
    _mutex = ref._mutex;
    if (_strongRefCount != nullptr) {
      // increment new pointer
      (*_strongRefCount)++;
    }

    return *this;
  }

private:
  // BorrowingReference<T> -> OwningReference<T> Lock-constructor
  OwningReference(const BorrowingReference<T>& ref)
      : _value(ref._value), _isDeleted(ref._isDeleted), _strongRefCount(ref._strongRefCount), _weakRefCount(ref._weakRefCount),
        _mutex(ref._mutex) {
    (*_strongRefCount)++;
  }

private:
  // OwningReference<C> -> OwningReference<T> Cast-constructor
  template <typename OldT>
  OwningReference(T* value, const OwningReference<OldT>& originalRef)
      : _value(value), _isDeleted(originalRef._isDeleted), _strongRefCount(originalRef._strongRefCount),
        _weakRefCount(originalRef._weakRefCount), _mutex(originalRef._mutex) {
    (*_strongRefCount)++;
  }

  template <typename C>
  friend class OwningReference;

public:
  ~OwningReference() {
    if (_strongRefCount == nullptr) {
      // we are just a dangling nullptr.
      return;
    }

    // decrement strong ref count on destroy
    --(*_strongRefCount);
    maybeDestroy();
  }

public:
  /**
   Casts this `OwningReference<T>` to a `OwningReference<C>`.
   */
  template <typename C>
  OwningReference<C> as() {
    return OwningReference<C>(static_cast<C*>(_value), *this);
  }

public:
  /**
   Creates an `OwningLock<T>` for the given `OwningReference<T>` to guarantee safe
   safe access to `OwningReference<T>`.
   Other threads (e.g. the Hermes garbage collector) cannot delete the `OwningReference<T>`
   as long as the `OwningLock<T>` is still alive.
   */
  [[nodiscard]]
  OwningLock<T> lock() const {
    return OwningLock<T>(*this);
  }

  /**
   Get whether the `OwningReference<T>` is still pointing to a valid value, or not.
   */
  inline bool hasValue() const {
    return _value != nullptr && !(*_isDeleted);
  }

  /**
   Get a borrowing (or "weak") reference to this owning reference
   */
  [[nodiscard]]
  BorrowingReference<T> weak() const {
    return BorrowingReference(*this);
  }

  /**
   Delete and destroy the value this OwningReference is pointing to.
   This can even be called if there are still multiple strong references to the value.

   This will block as long as one or more `OwningLock<T>`s of this `OwningReference<T>` are still alive.
   */
  void destroy() {
    std::unique_lock lock(*_mutex);

    forceDestroy();
  }

public:
  explicit inline operator bool() const {
    return hasValue();
  }

  inline T& operator*() const {
    return *_value;
  }

  inline T* operator->() const {
    return _value;
  }

  inline bool operator==(T* other) const {
    std::unique_lock lock(*_mutex);

    if (*_isDeleted) {
      return other == nullptr;
    } else {
      return other == _value;
    }
  }

  inline bool operator!=(T* other) const {
    return !(this == other);
  }

  inline bool operator==(const OwningReference<T>& other) const {
    return _value == other._value;
  }

  inline bool operator!=(const OwningReference<T>& other) const {
    return !(this == other);
  }

private:
  void maybeDestroy() {
    _mutex->lock();

    if (*_strongRefCount == 0) {
      // after no strong references exist anymore
      forceDestroy();
    }

    if (*_strongRefCount == 0 && *_weakRefCount == 0) {
      // free the full memory if there are no more references at all
      delete _isDeleted;
      delete _strongRefCount;
      delete _weakRefCount;
      _mutex->unlock();
      return;
    }

    _mutex->unlock();
  }

  void forceDestroy() {
    if (*_isDeleted) {
      // it has already been destroyed.
      return;
    }
    delete _value;
    *_isDeleted = true;
  }

public:
  friend class BorrowingReference<T>;
  friend class OwningLock<T>;

private:
  T* _value;
  bool* _isDeleted;
  std::atomic_size_t* _strongRefCount;
  std::atomic_size_t* _weakRefCount;
  std::recursive_mutex* _mutex;
};

} // namespace margelo::nitro

#include "BorrowingReference+Owning.hpp"
