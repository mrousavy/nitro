//
//  OwningReference.hpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 23.06.24.
//

#pragma once

#include <cstddef>
#include <mutex>
#include "BorrowingReference.hpp"

namespace margelo::nitro {

/**
 An `OwningReference<T>` is a smart-pointer that holds a strong reference to a pointer.
 You can have multiple `OwningReference<T>` instances point to the same pointer, as they internally keep a ref-count.
 As opposed to a `shared_ptr<T>`, an `OwningReference<T>` can also be imperatively manually deleted, even if there
 are multiple strong references still holding onto the pointer.

 An `OwningReference<T>` can be weakified, which gives the user a `BorrowingReference<T>`.
 A `BorrowingReference<T>` can be locked to get an `OwningReference<T>` again, assuming it has not been deleted yet.
 */
template<typename T>
class OwningReference final {
public:
  using Pointee = T;
  
public:
  OwningReference(): _value(nullptr), _isDeleted(nullptr), _strongRefCount(nullptr), _weakRefCount(nullptr), _mutex(nullptr) { }

  explicit OwningReference(T* value): _value(value), _isDeleted(new bool(false)), _strongRefCount(new size_t(1)), _weakRefCount(new size_t(0)), _mutex(new std::mutex()) {}

  OwningReference(const OwningReference& ref):
    _value(ref._value),
    _isDeleted(ref._isDeleted),
    _strongRefCount(ref._strongRefCount),
    _weakRefCount(ref._weakRefCount),
    _mutex(ref._mutex) {
      // increment ref count after copy
      std::unique_lock lock(*_mutex);
      (*_strongRefCount)++;
  }

  OwningReference(OwningReference&& ref):
    _value(ref._value),
    _isDeleted(ref._isDeleted),
    _strongRefCount(ref._strongRefCount),
    _weakRefCount(ref._weakRefCount),
    _mutex(ref._mutex) {
      ref._value = nullptr;
      ref._isDeleted = nullptr;
      ref._strongRefCount = nullptr;
      ref._weakRefCount = nullptr;
  }

  OwningReference& operator=(const OwningReference& ref) {
    if (this == &ref) return *this;

    if (_strongRefCount != nullptr) {
      // destroy previous pointer
      std::unique_lock lock(*_mutex);
      (*_strongRefCount)--;
      maybeDestroy();
    }

    _value = ref._value;
    _isDeleted = ref._isDeleted;
    _strongRefCount = ref._strongRefCount;
    _weakRefCount = ref._weakRefCount;
    _mutex = ref._mutex;
    if (_strongRefCount != nullptr) {
      std::unique_lock lock(*_mutex);
      (*_strongRefCount)++;
    }

    return *this;
  }

private:
  OwningReference(const BorrowingReference<T>& ref):
    _value(ref._value),
    _isDeleted(ref._isDeleted),
    _strongRefCount(ref._strongRefCount),
    _weakRefCount(ref._weakRefCount),
    _mutex(ref._mutex) {
      std::unique_lock lock(*_mutex);
      (*_strongRefCount)++;
  }

public:
  ~OwningReference() {
    if (_strongRefCount == nullptr) {
      // we are just a dangling nullptr.
      return;
    }
    
    std::unique_lock lock(*_mutex);
    
    // decrement strong ref count on destroy
    --(*_strongRefCount);
    maybeDestroy();
  }
  
  /**
   Get whether the `OwningReference<T>` is still pointing to a valid value, or not.
   */
  inline bool hasValue() const {
    return _value != nullptr && !(*_isDeleted);
  }
  
  /**
   Get a weak ("borrowing") reference to this owning reference
   */
  BorrowingReference<T> weak() const {
    return BorrowingReference(*this);
  }

  /**
   Delete and destroy the value this OwningReference is pointing to.
   This can even be called if there are still multiple strong references to the value.
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
    if (*_strongRefCount == 0) {
      // after no strong references exist anymore
      forceDestroy();
    }
    
    if (*_strongRefCount == 0 && *_weakRefCount == 0) {
      // free the full memory if there are no more references at all
      delete _mutex;
      delete _isDeleted;
      delete _strongRefCount;
      delete _weakRefCount;
    }
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

private:
  T* _value;
  bool* _isDeleted;
  size_t* _strongRefCount;
  size_t* _weakRefCount;
  std::mutex* _mutex;
};

}

#include "BorrowingReference+Owning.hpp"
