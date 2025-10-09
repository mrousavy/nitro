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
   * Implicitly create a new `PropName` from a string.
   * This is not a `Symbol`.
   */
  PropName(const char* name): PropName(name, false) {}

public:
  /**
   * Create a new string-`PropName` for the given string.
   */
  static PropName string(const char* name);
  /**
   * Create a new symbol-`PropName` for the given string.
   *
   * This is the same as writing `Symbol.X ?? "X"` in JS, where
   * `X` is your Symbol's name.
   */
  static PropName symbol(const char* name);

private:
  explicit PropName(const char* name, bool isSymbol);

public:
  /**
   * PropName -> JS Value
   */
  jsi::Value toJS(jsi::Runtime& runtime) const;

  /**
   * PropName -> JS PropNameID
   */
  jsi::PropNameID toJSPropNameID(jsi::Runtime& runtime) const;

  std::string toString() const {
    return std::string(_name);
  }

  /**
   * equals
   */
  bool operator==(const PropName& other) const {
    return std::strcmp(_name, other._name) == 0 && _isSymbol == other._isSymbol;
  }

protected:
  friend std::hash<margelo::nitro::PropName>;

private:
  const char* _name;
  bool _isSymbol;
};

} // namespace margelo::nitro

/**
 * Hash specialization for PropName
 */
namespace std {
template <>
struct hash<margelo::nitro::PropName> {
  std::size_t operator()(const margelo::nitro::PropName& p) const noexcept {
    // Use both string value and the boolean in the hash
    return std::hash<std::string>()(p._name) ^ (std::hash<bool>()(p._isSymbol) << 1);
  }
};
} // namespace std
