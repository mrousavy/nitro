//
// Created by Marc Rousavy on 09.10.25.
//

#pragma once
#include <jsi/jsi.h>

namespace margelo::nitro {

/**
 * Represents a property name (key) inside an object.
 * This can either be a simple string, or a `Symbol`.
 * The string value has to be a static/const ASCII string.
 */
struct PropName final {
public:
  explicit PropName(const char* name, bool isSymbol = false):
    _name(name), _isSymbol(isSymbol) { }
  
  jsi::Value toJS(jsi::Runtime& runtime) const {
    if (_isSymbol) {
      jsi::Object symbolConstructor = runtime.global().getPropertyAsObject(runtime, "Symbol");
      jsi::Value symbol = symbolConstructor.getProperty(runtime, _name);
      if (symbol.isSymbol()) {
        return symbol;
      }
    }
    return jsi::String::createFromAscii(runtime, _name);
  }
  
  std::string toString() const {
    return _name;
  }
  
private:
  const char* _name;
  bool _isSymbol;
};

}
