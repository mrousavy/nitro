#include "RawPropsCompat.hpp"
#include <cxxreact/ReactNativeVersion.h>

namespace margelo::nitro {

namespace RawPropsCompat {
  using namespace facebook;

  const react::RawValue* at(const react::RawProps& props, const char* name) {
#if REACT_NATIVE_VERSION_MAJOR > 0 || REACT_NATIVE_VERSION_MINOR > 86
    // react-native 0.87 removed the `at(name, prefix, suffix)` overload of
    // `react::RawProps` in favor of a single-argument `at(name)`.
    return props.at(name);
#else
    // This is for RN < 0.86
    return props.at(name, nullptr, nullptr);
#endif
  }

} // namespace RawPropsCompat
} // namespace margelo::nitro
