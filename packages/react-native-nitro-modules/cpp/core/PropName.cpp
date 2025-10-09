//
// Created by Marc Rousavy on 09.10.25.
//

#include "PropName.hpp"
#include <jsi/jsi.h>
#include <string>

namespace margelo::nitro {

using namespace facebook;

/**
 * Constructor
 */
PropName::PropName(const char* name, bool isSymbol) : _name(name), _isSymbol(isSymbol) {}

PropName PropName::string(const char* name) {
  return PropName(name, false);
}

PropName PropName::symbol(const char* name) {
  return PropName(name, true);
}

/**
 * PropName -> jsi::Value
 */
jsi::Value PropName::toJS(jsi::Runtime& runtime) const {
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
 * PropName -> jsi::PropNameID
 */
jsi::PropNameID PropName::toJSPropNameID(jsi::Runtime& runtime) const {
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

} // namespace margelo::nitro
