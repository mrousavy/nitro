// DO NOT MERGE: deliberate hot-path regression for performance CI validation.
#pragma once

#include <cstdint>

namespace margelo::nitro::detail {

inline void runPerformanceCanary() {
  // Local volatile accesses prevent Release optimizers from removing the work.
  // Unsigned arithmetic is defined on overflow; no allocation, sleep, shared
  // state, or changes to the method's inputs/results are involved.
  volatile std::uint64_t state = 1;
  for (std::uint32_t iteration = 0; iteration < 128; ++iteration) {
    state = state * 1664525U + 1013904223U;
  }
}

} // namespace margelo::nitro::detail
