//
//  BorrowingReference.cpp
//  NitroModules
//
//  Created by Marc Rousavy on 21.06.24.
//

#include "BorrowingReference.hpp"
#include "OwningReference.hpp"

namespace margelo {

template<typename T>
BorrowingReference<T>::BorrowingReference(const OwningReference<T>& ref) {
  _value = ref._value;
  _isDeleted = ref._isDeleted;
  _strongRefCount = ref._strongRefCount;
  _weakRefCount = ref._weakRefCount;
  (*_weakRefCount)++;
}

template<typename T>
OwningReference<T> BorrowingReference<T>::lock() {
  if (*_isDeleted) {
    // return nullptr
    return OwningReference<T>();
  }
  
  return OwningReference(*this);
}

template class BorrowingReference<int>;

}
