//
//  ViewPropParser.hpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 19.08.26.
//

#pragma once

#include "CachedProp.hpp"
#include "PropNameIDCache.hpp"

#include <react/renderer/core/RawProps.h>
#include <react/renderer/core/RawValue.h>

#include <exception>
#include <functional>
#include <optional>
#include <stdexcept>
#include <string>
#include <type_traits>
#include <utility>

namespace margelo::nitro {

using namespace facebook;

namespace detail {

  template <typename T>
  struct IsFunctionProp : std::false_type {};

  template <typename TResult, typename... TArgs>
  struct IsFunctionProp<std::function<TResult(TArgs...)>> : std::true_type {};

  template <typename T>
  struct IsFunctionProp<std::optional<T>> : IsFunctionProp<T> {};

} // namespace detail

/**
 * Parses one generated Hybrid View prop from React Native's RawProps.
 *
 * This owns Nitro's conversion and caching behavior so generated Props classes
 * only need to declare their named CachedProp members and connect each member
 * to its React prop name.
 */
template <typename T>
CachedProp<T> parseViewProp(const char* viewName, const char* propName, const react::RawProps& rawProps, const CachedProp<T>& sourceProp) {
  try {
    const react::RawValue* rawValue = rawProps.at(propName, nullptr, nullptr);
    if (rawValue == nullptr) {
      return sourceProp;
    }

    auto [runtime, value] = static_cast<std::pair<jsi::Runtime*, jsi::Value>>(*rawValue);

    if constexpr (detail::IsFunctionProp<std::remove_cv_t<T>>::value) {
      // React Native cannot transport functions as regular props. Nitrogen
      // wraps them as `{ f: function }`, so unwrap `f` before converting and
      // caching the JSI value.
      jsi::Value function = value.asObject(*runtime).getProperty(*runtime, PropNameIDCache::get(*runtime, "f"));
      return CachedProp<T>::fromRawValue(*runtime, function, sourceProp);
    } else {
      return CachedProp<T>::fromRawValue(*runtime, value, sourceProp);
    }
  } catch (const std::exception& exception) {
    throw std::runtime_error(std::string(viewName) + "." + propName + ": " + exception.what());
  }
}

} // namespace margelo::nitro
