//
// Created by Marc Rousavy on 20.11.24.
//

#pragma once

#include "IsSpecializationOf.hpp"
#include <functional>
#include <memory>
#include <type_traits>

namespace margelo::nitro {

template <typename T>
struct CapturedValue final {
public:
  explicit CapturedValue(T&& value) : _pointer(std::make_shared<T>(std::move(value))) {}
  explicit CapturedValue(const T& value) : _pointer(std::make_shared<T>(value)) {}

public:
  static CapturedValue wrap(T&& value) {
    return CapturedValue(std::move(value));
  }
  static CapturedValue wrap(const T& value) {
    return CapturedValue(value);
  }

  T& unwrap() const {
    return *_pointer;
  }

private:
  std::shared_ptr<T> _pointer;
};

template <typename T>
struct CapturedUniqueValue final {
public:
  explicit CapturedUniqueValue(T&& value) : _pointer(std::make_unique<T>(std::move(value))) {}

public:
  static CapturedUniqueValue wrap(T&& value) {
    return CapturedUniqueValue(std::move(value));
  }

  T& unwrap() const {
    return *_pointer;
  }

private:
  std::unique_ptr<T> _pointer;
};

template <typename T>
constexpr bool is_polymorphic_v = std::is_polymorphic_v<std::decay_t<T>>;

/**
 * Captures an argument via shared_ptr if it is polymorphic.
 */
template <typename T>
auto captureArgument(T&& arg) {
  if constexpr (is_specialization_of_v<std::shared_ptr, std::decay_t<T>>) {
    // Already a shared_ptr, forward as-is
    return std::forward<T>(arg);
  } else if constexpr (std::is_polymorphic_v<std::decay_t<T>>) {
    // Wrap polymorphic types in CapturedValue
    return CapturedValue<std::decay_t<T>>::wrap(std::forward<T>(arg));
  } else if constexpr (std::is_move_constructible_v<T> && !std::is_copy_constructible_v<T>) {
    // Wrap move-only types in a CapturedUniqueValue
    return CapturedUniqueValue<std::decay_t<T>>::wrap(std::forward<T>(arg));
  } else {
    // Forward regular types as-is
    return std::forward<T>(arg);
  }
}

template <typename T>
auto getArgument(T&& arg) -> decltype(auto) {
  if constexpr (std::is_pointer_v<std::decay_t<T>>) {
    // Dereference raw pointers
    return *arg;
  } else if constexpr (is_specialization_of_v<CapturedValue, std::decay_t<T>> ||
                       is_specialization_of_v<CapturedUniqueValue, std::decay_t<T>>) {
    // Dereference CapturedValue
    return arg.unwrap();
  } else {
    // Pass all other types (including pre-existing shared_ptrs) as-is
    return std::forward<T>(arg);
  }
}

} // namespace margelo::nitro
