//
//  HybridViewProps.hpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 19.08.26.
//

#pragma once

#include "CachedProp.hpp"
#include "NitroHash.hpp"
#include "PropNameIDCache.hpp"

#include <react/renderer/components/view/ViewProps.h>
#include <react/renderer/core/PropsParserContext.h>
#include <react/renderer/core/RawProps.h>
#include <react/renderer/core/RawValue.h>

#include <cstddef>
#include <exception>
#include <functional>
#include <optional>
#include <stdexcept>
#include <string>
#include <string_view>
#include <type_traits>
#include <utility>

namespace margelo::nitro {

using namespace facebook;

/**
 * A compile-time string that can be used as a non-type template parameter.
 */
template <size_t Size> struct FixedString final {
public:
  char value[Size]{};

public:
  constexpr FixedString(const char (&string)[Size]) noexcept {
    for (size_t index = 0; index < Size; index++) {
      value[index] = string[index];
    }
  }

  [[nodiscard]]
  constexpr const char *data() const noexcept {
    return value;
  }

  [[nodiscard]]
  constexpr std::string_view stringView() const noexcept {
    return std::string_view(value, Size - 1);
  }

  template <size_t OtherSize>
  [[nodiscard]]
  constexpr bool
  operator==(const FixedString<OtherSize> &other) const noexcept {
    return stringView() == other.stringView();
  }
};

template <size_t Size> FixedString(const char (&)[Size]) -> FixedString<Size>;

/**
 * Describes a single prop on a `HybridViewProps` type.
 */
template <FixedString Name, typename TValue> struct ViewProp final {
public:
  using Type = TValue;
  static constexpr auto name = Name;
};

namespace detail {

template <typename T> struct IsViewProp : std::false_type {};

template <FixedString Name, typename TValue>
struct IsViewProp<ViewProp<Name, TValue>> : std::true_type {};

template <typename T> struct IsStdFunction : std::false_type {};

template <typename TResult, typename... TArgs>
struct IsStdFunction<std::function<TResult(TArgs...)>> : std::true_type {};

template <typename T>
struct IsFunctionViewProp : IsStdFunction<std::remove_cv_t<T>> {};

template <typename T>
struct IsFunctionViewProp<std::optional<T>> : IsFunctionViewProp<T> {};

template <typename... TProps> struct HasUniqueViewPropNames;

template <> struct HasUniqueViewPropNames<> : std::true_type {};

template <typename TProp, typename... TRest>
struct HasUniqueViewPropNames<TProp, TRest...>
    : std::bool_constant<((TProp::name != TRest::name) && ...) &&
                         HasUniqueViewPropNames<TRest...>::value> {};

template <FixedString Name, typename... TProps> struct FindViewProp;

template <FixedString Name> struct FindViewProp<Name> {
  using Type = void;
};

template <FixedString Name, typename TProp, typename... TRest>
struct FindViewProp<Name, TProp, TRest...> {
  using Type = std::conditional_t<Name == TProp::name, TProp,
                                  typename FindViewProp<Name, TRest...>::Type>;
};

template <typename TProp> struct ViewPropStorage {
public:
  using Type = typename TProp::Type;

public:
  CachedProp<Type> cachedProp;

public:
  ViewPropStorage() = default;
  explicit ViewPropStorage(CachedProp<Type> &&prop)
      : cachedProp(std::move(prop)) {}
};

template <FixedString ViewName, typename TProp>
CachedProp<typename TProp::Type>
parseViewProp(const react::RawProps &rawProps,
              const CachedProp<typename TProp::Type> &sourceProp) {
  try {
    // This lookup must happen for every prop, and in the order in which the
    // ViewProp descriptors were supplied to HybridViewProps.
    const react::RawValue *rawValue =
        rawProps.at(TProp::name.data(), nullptr, nullptr);
    if (rawValue == nullptr) {
      return sourceProp;
    }

    const auto &[runtime, value] =
        (std::pair<jsi::Runtime *, jsi::Value>)*rawValue;
    if constexpr (IsFunctionViewProp<typename TProp::Type>::value) {
      // React Native cannot transport functions as regular props. Nitrogen
      // wraps them as `{ f: function }`, so unwrap `f` before converting and
      // before comparing the JSI value with the cached value.
      jsi::Value function = value.asObject(*runtime).getProperty(
          *runtime, PropNameIDCache::get(*runtime, "f"));
      return CachedProp<typename TProp::Type>::fromRawValue(*runtime, function,
                                                            sourceProp);
    } else {
      return CachedProp<typename TProp::Type>::fromRawValue(*runtime, value,
                                                            sourceProp);
    }
  } catch (const std::exception &exception) {
    throw std::runtime_error(std::string(ViewName.data()) + "." +
                             TProp::name.data() + ": " + exception.what());
  }
}

} // namespace detail

/**
 * The React Native props for a Nitro Hybrid View.
 *
 * Each `ViewProp` descriptor declares a prop name and its converted C++ type.
 * This class owns RawProps lookup, function unwrapping, conversion, caching,
 * and filtering for all declared props.
 */
template <FixedString ViewName, typename... TProps>
class HybridViewProps final : public react::ViewProps,
                              private detail::ViewPropStorage<TProps>... {
  static_assert(
      (detail::IsViewProp<TProps>::value && ...),
      "HybridViewProps only accepts ViewProp<Name, Type> descriptors.");
  static_assert(
      detail::HasUniqueViewPropNames<TProps...>::value,
      "HybridViewProps cannot contain multiple props with the same name.");

public:
  HybridViewProps() = default;

  HybridViewProps(const react::PropsParserContext &context,
                  const HybridViewProps &sourceProps,
                  const react::RawProps &rawProps)
      : react::ViewProps(context, sourceProps, rawProps, filterObjectKeys),
        detail::ViewPropStorage<TProps>(detail::parseViewProp<ViewName, TProps>(
            rawProps,
            static_cast<const detail::ViewPropStorage<TProps> &>(sourceProps)
                .cachedProp))... {}

public:
  template <FixedString Name>
  [[nodiscard]]
  decltype(auto) get() noexcept {
    using TProp = typename detail::FindViewProp<Name, TProps...>::Type;
    if constexpr (std::is_void_v<TProp>) {
      static_assert(!std::is_void_v<TProp>,
                    "HybridViewProps does not contain a prop with this name.");
    } else {
      return (static_cast<detail::ViewPropStorage<TProp> &>(*this).cachedProp);
    }
  }

  template <FixedString Name>
  [[nodiscard]]
  decltype(auto) get() const noexcept {
    using TProp = typename detail::FindViewProp<Name, TProps...>::Type;
    if constexpr (std::is_void_v<TProp>) {
      static_assert(!std::is_void_v<TProp>,
                    "HybridViewProps does not contain a prop with this name.");
    } else {
      return (static_cast<const detail::ViewPropStorage<TProp> &>(*this)
                  .cachedProp);
    }
  }

private:
  static bool filterObjectKeys(const std::string &propName) {
    const uint64_t propHash = hashString(propName);
    return (false || ... ||
            (propHash == hashString(TProps::name.stringView())));
  }
};

} // namespace margelo::nitro
