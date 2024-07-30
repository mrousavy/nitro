//
//  OwningLock.hpp
//  Pods
//
//  Created by Marc Rousavy on 30.07.24.
//

#pragma once

namespace margelo::nitro {
template<typename T> class BorrowingReference;
template<typename T> class OwningReference;
}

#include <cstddef>
#include <mutex>
#include "BorrowingReference.hpp"

namespace margelo::nitro {

template<typename T>
class OwningLock final {
public:
  ~OwningLock() {
    _reference._mutex->unlock();
  }
  
private:
  explicit OwningLock(BorrowingReference<T> reference): _reference(reference) {
    _reference._mutex->lock();
  }
  
private:
  BorrowingReference<T> _reference;
  
private:
  friend class BorrowingReference<T>;
  friend class OwningReference<T>;
};

} // namespace margelo::nitro
