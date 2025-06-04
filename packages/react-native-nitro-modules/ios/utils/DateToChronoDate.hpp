//
//  DateToChronoDate.hpp
//  NitroModules
//
//  Created by Marc Rousavy on 04.06.25.
//

#pragma once

#include "NitroTypeInfo.hpp"
#include <chrono>

namespace margelo::nitro {

struct ChronoHelper {
public:
  static bool doooo() {
    return false;
  }
};

static inline void dummyFonc() {
  return;
}

static inline std::chrono::system_clock::time_point chronoDateFromMillisecondsSinceEpoch(double msSinceEpoch) {
  auto durationMs = chrono::duration<double, std::milli>(msSinceEpoch);
  auto duration = chrono::duration_cast<chrono::system_clock::duration>(durationMs);
  auto date = chrono::system_clock::time_point(duration);
  return date;
}

} // namespace margelo::nitro
