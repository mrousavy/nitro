//
//  NitroError.cpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 04.11.25
//

#include "NitroError.hpp"
#include <exception>
#include <jsi/jsi.h>

namespace margelo::nitro {

using namespace facebook;

jsi::JSError NitroError::toJS(jsi::Runtime& runtime) const {
  // 1. Create a base JS Error with a message
  jsi::JSError error(runtime, _message, _stacktrace);
  
  // 2. Set the `type` property on the JS Object -
  //    it's a reference type, so it should update the underlying `error` instance
  error.value().asObject(runtime).setProperty(runtime, "type", _typename);
  
  // 3. Return it again
  return error;
}

} // namespace margelo::nitro
