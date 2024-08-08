//
//  BorrowingReference+Owning.hpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 23.06.24.
//

#pragma once

#include "OwningReference.hpp"

namespace margelo::nitro {

template <typename T>
BorrowingReference<T>::BorrowingReference(const OwningReference<T>& ref) {
  _value = ref._value;
  _isDeleted = ref._isDeleted;
  _strongRefCount = ref._strongRefCount;
  _weakRefCount = ref._weakRefCount;
  _mutex = ref._mutex;
  (*_weakRefCount)++;
}

template <typename T>
OwningReference<T> BorrowingReference<T>::lock() const {
  std::unique_lock lock(*_mutex);

  if (*_isDeleted) {
    // return nullptr
    return OwningReference<T>();
  }

  return OwningReference(*this);
}

} // namespace margelo::nitro
