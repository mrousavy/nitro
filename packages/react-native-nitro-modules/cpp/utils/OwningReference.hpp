//
//  OwningReference.hpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 23.06.24.
//

#pragma once

#include <cstddef>
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
class OwningReference {
public:
  OwningReference(): _value(nullptr), _isDeleted(nullptr), _strongRefCount(nullptr), _weakRefCount(nullptr) { }

  explicit OwningReference(T* value): _value(value), _isDeleted(new bool(false)), _strongRefCount(new size_t(1)), _weakRefCount(new size_t(0)) {}

  OwningReference(const OwningReference& ref):
    _value(ref._value),
    _isDeleted(ref._isDeleted),
    _strongRefCount(ref._strongRefCount),
    _weakRefCount(ref._weakRefCount) {
      // increment ref count after copy
      (*_strongRefCount)++;
  }

  OwningReference(OwningReference&& ref):
    _value(ref._value),
    _isDeleted(ref._isDeleted),
    _strongRefCount(ref._strongRefCount),
    _weakRefCount(ref._weakRefCount) {
      ref._value = nullptr;
      ref._isDeleted = nullptr;
      ref._strongRefCount = nullptr;
      ref._weakRefCount = nullptr;
  }

  OwningReference& operator=(const OwningReference& ref) {
    if (this == &ref) return *this;

    if (_strongRefCount != nullptr) {
      // destroy previous pointer
      (*_strongRefCount)--;
      maybeDestroy();
    }

    _value = ref._value;
    _isDeleted = ref._isDeleted;
    _strongRefCount = ref._strongRefCount;
    _weakRefCount = ref._weakRefCount;
    if (_strongRefCount != nullptr) {
      (*_strongRefCount)++;
    }

    return *this;
  }

private:
  OwningReference(const BorrowingReference<T>& ref):
    _value(ref._value),
    _isDeleted(ref._isDeleted),
    _strongRefCount(ref._strongRefCount),
    _weakRefCount(ref._weakRefCount) {
      (*_strongRefCount)++;
  }

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
  
  inline bool hasValue() const {
    return _value != nullptr && !(*_isDeleted);
  }

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

  /**
   Get a weak ("borrowing") reference to this owning reference
   */
  BorrowingReference<T> weak() {
    return BorrowingReference(*this);
  }

  /**
   Delete and destroy the value this OwningReference is pointing to.
   This can even be called if there are still multiple strong references to the value.
   */
  void destroy() {
    if (*_isDeleted) {
      // it has already been destroyed.
      return;
    }
    delete _value;
    *_isDeleted = true;
  }

private:
  void maybeDestroy() {
    if (*_strongRefCount == 0) {
      // after no strong references exist anymore
      destroy();
    }

    if (*_strongRefCount == 0 && *_weakRefCount == 0) {
      // free the full memory if there are no more references at all
      delete _isDeleted;
      delete _strongRefCount;
      delete _weakRefCount;
    }
  }

public:
  friend class BorrowingReference<T>;

private:
  T* _value;
  bool* _isDeleted;
  size_t* _strongRefCount;
  size_t* _weakRefCount;
};

}

#include "BorrowingReference+Owning.hpp"
