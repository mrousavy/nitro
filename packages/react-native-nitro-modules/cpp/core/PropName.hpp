//
// Created by Marc Rousavy on 09.10.25.
//

#pragma once

#include <jsi/jsi.h>
#include <string>

namespace margelo::nitro {

using namespace facebook;

/**
 * Represents a property name (key) inside an object.
 * This can either be a simple string, or a `Symbol`.
 * The string value has to be a static/const ASCII string.
 */
struct PropName final {
public:
  /**
   * Explicitly create a new `PropName` from the given string.
   * If the `PropName` should be a symbol, enable `isSymbol`.
   */
  explicit PropName(const char* name, bool isSymbol) : _name(name), _isSymbol(isSymbol) {}

  /**
   * Implicitly create a new `PropName` from a string.
   * This is not a `Symbol`.
   */
  PropName(const char* name) : PropName(name, false) {}

  /**
   * PropName -> JS Value
   */
  jsi::Value toJS(jsi::Runtime& runtime) const {
    if (_isSymbol) {
      jsi::Object symbolConstructor = runtime.global().getPropertyAsObject(runtime, "Symbol");
      jsi::Value symbol = symbolConstructor.getProperty(runtime, _name);
      if (symbol.isSymbol()) {
        // It is a Symbol of that name!
        return symbol;
      }
    }
    // It's a basic string.
    return jsi::String::createFromAscii(runtime, _name);
  }

  /**
   * PropName -> JS PropNameID
   */
  jsi::PropNameID toJSPropNameID(jsi::Runtime& runtime) const {
    jsi::Value value = toJS(runtime);
    if (value.isString()) [[likely]] {
      // It's a jsi::String
      return jsi::PropNameID::forString(runtime, value.getString(runtime));
    } else if (value.isSymbol()) {
      // It's a jsi::Symbol
      return jsi::PropNameID::forSymbol(runtime, value.getSymbol(runtime));
    } else [[unlikely]] {
      // It's a bird.. it's a plane.. actually no, wtf?
      throw std::runtime_error("PropName \"" + toString() + "\" is neither a String nor a Symbol!");
    }
  }

  std::string toString() const {
    return _name;
  }

  bool isSymbol() const {
    return _isSymbol;
  }

  /**
   * equals
   */
  bool operator==(const PropName& other) const {
    return std::strcmp(_name, other._name) == 0 && _isSymbol == other._isSymbol;
  }

private:
  const char* _name;
  bool _isSymbol;
};

} // namespace margelo::nitro

// Hash specialization for PropName
namespace std {
template <>
struct hash<margelo::nitro::PropName> {
  std::size_t operator()(const margelo::nitro::PropName& p) const noexcept {
    // Use both string value and the boolean in the hash
    return std::hash<std::string>()(p.toString()) ^ (std::hash<bool>()(p.isSymbol()) << 1);
  }
};
} // namespace std
