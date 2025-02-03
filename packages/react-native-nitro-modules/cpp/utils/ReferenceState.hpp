//
//  ReferenceState.hpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 03.02.24.
//

#pragma once

#include <atomic>

namespace margelo::nitro {

struct ReferenceState {
  bool isDeleted;
  std::atomic_size_t strongRefCount;
  std::atomic_size_t weakRefCount;
  std::mutex mutex;

  explicit ReferenceState() : isDeleted(false), strongRefCount(1), weakRefCount(0) {}
};

} // namespace margelo::nitro
