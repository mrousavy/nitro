//
//  NitroConcepts.hpp
//  NitroModules
//
//  Created by Marc Rousavy on 09.02.25.
//

#pragma once

#include <concepts>
#include <memory>
#include <type_traits>

namespace margelo::nitro {
class HybridObject;
}
namespace facebook::jsi {
class MutableBuffer;
class HostObject;
} // namespace facebook::jsi

namespace margelo::nitro {

/**
 * Any `HybridObject`, or a subclass of it.
 */
template <typename T>
concept SomeHybridObject = std::is_base_of_v<HybridObject, T>;

/**
 * A `std::shared_ptr` to any `HybridObject`, or a subclass of it.
 */
template <typename T>
concept SomeHybridObjectSharedPtr = requires {
  typename T::element_type;
}
&&std::same_as<T, std::shared_ptr<typename T::element_type>>&& std::is_base_of_v<HybridObject, typename T::element_type>;

/**
 * A `std::shared_ptr` to any `jsi::HostObject`, or a subclass of it.
 */
template <typename T>
concept SomeHostObjectSharedPtr = requires {
  typename T::element_type;
}
&&std::same_as<T, std::shared_ptr<typename T::element_type>>&& std::is_base_of_v<jsi::HostObject, typename T::element_type>;

/**
 * A `std::shared_ptr` to a `jsi::MutableBuffer` or a sub-class of it.
 */
template <typename T>
concept SomeMutableBuffer = requires {
  typename T::element_type;
}
&&std::same_as<T, std::shared_ptr<typename T::element_type>>&& std::is_base_of_v<jsi::MutableBuffer, typename T::element_type>;

} // namespace margelo::nitro
