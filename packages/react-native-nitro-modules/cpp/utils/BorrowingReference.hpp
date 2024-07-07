//
//  BorrowingReference.hpp
//  NitroModules
//
//  Created by Marc Rousavy on 21.06.24.
//

#pragma once

#include <cstddef>

namespace margelo {

// forward-declaration to avoid duplicate symbols
template<typename T>
class OwningReference;

template<typename T>
class BorrowingReference {
private:
  explicit BorrowingReference(const OwningReference<T>& ref);
  
public:
  BorrowingReference(): _value(nullptr), _isDeleted(nullptr), _strongRefCount(nullptr), _weakRefCount(nullptr) { }
  
  BorrowingReference(const BorrowingReference& ref):
    _value(ref._value),
    _isDeleted(ref._isDeleted),
    _strongRefCount(ref._strongRefCount),
    _weakRefCount(ref._weakRefCount) {
      // increment ref count after copy
      (*_weakRefCount)++;
  }

  BorrowingReference(BorrowingReference&& ref):
    _value(ref._value),
    _isDeleted(ref._isDeleted),
    _strongRefCount(ref._strongRefCount),
    _weakRefCount(ref._weakRefCount) {
      ref._value = nullptr;
      ref._isDeleted = nullptr;
      ref._strongRefCount = nullptr;
      ref._weakRefCount = nullptr;
  }
  
  BorrowingReference& operator=(const BorrowingReference& ref) {
    if (this == &ref) return *this;
    
    if (_weakRefCount != nullptr) {
      // destroy previous pointer
      (*_weakRefCount)--;
      maybeDestroy();
    }
    
    _value = ref._value;
    _isDeleted = ref._isDeleted;
    _strongRefCount = ref._strongRefCount;
    _weakRefCount = ref._weakRefCount;
    if (_weakRefCount != nullptr) {
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
  OwningReference<T> lock();
  
public:
  friend class OwningReference<T>;
  
private:
  void maybeDestroy() {
    if (*_strongRefCount == 0 && *_weakRefCount == 0) {
      // free the full memory if there are no more references at all
      if (!(*_isDeleted)) {
        delete _value;
      }
      delete _isDeleted;
      delete _strongRefCount;
      delete _weakRefCount;
    }
  }
  
private:
  T* _value;
  bool* _isDeleted;
  size_t* _strongRefCount;
  size_t* _weakRefCount;
};

} // namespace margelo
