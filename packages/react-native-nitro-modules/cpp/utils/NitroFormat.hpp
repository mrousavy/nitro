//
//  NitroFormat.hpp
//  Nitro
//
//  Created by Marc Rousavy on 15.10.25.
//

#pragma once
#include <string>

#if defined(__APPLE__) && defined(TARGET_OS_IPHONE) && TARGET_OS_IPHONE

// On Apple, we use fmt's format helper since std::format is broken in Apple Clang 20.
#include <fmt/format.h>

namespace margelo::nitro {
template <class... Args>
inline std::string format(fmt::format_string<Args...> fmt, Args&&... args) {
  return fmt::format(fmt, std::forward<Args>(args)...);
}
}
#else

// Outside of Apple, we can use C++ 20 std::format
#include <format>

namespace margelo::nitro {
template <class... Args>
inline std::string format(std::format_string<Args...> fmt, Args&&... args) {
  return std::format(fmt, std::forward<Args>(args)...);
}
}
#endif
