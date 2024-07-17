//
//  MaybeValue.hpp
//  Pods
//
//  Created by Marc Rousavy on 17.07.24.
//

#pragma once

#include <string>
#include <swift/bridging>

namespace margelo {

/**
 * The state of MaybeValue - either it has a value (VALUE),
 * or it has no value but has an error (ERROR).
 */
enum class State {
  VALUE SWIFT_NAME(value),
  ERROR SWIFT_NAME(error)
};

/**
 * Represents an optional value, or an error if no value exists.
 */
template<typename T>
struct MaybeValue {
public:
  MaybeValue(const T& value) SWIFT_NAME(init(value:))
    : _value(value), _error(std::nullopt), _state(State::VALUE) { }
  MaybeValue(const std::string& error) SWIFT_NAME(init(error:))
    : _value(std::nullopt), _error(error), _state(State::ERROR) {  }
  
public:
  inline State getState() const SWIFT_COMPUTED_PROPERTY {
    return _state;
  }
  
  inline const T& getValue() const SWIFT_COMPUTED_PROPERTY {
    return _value.value();
  }
  
  inline const std::string& getError() const SWIFT_COMPUTED_PROPERTY {
    return _error.value();
  }
  
private:
  std::optional<T> _value;
  std::optional<std::string> _error;
  State _state;
};

} // namespace margelo
