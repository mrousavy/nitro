///
/// HybridTestObjectSwiftKotlinSpec.cpp
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2025 Marc Rousavy @ Margelo
///

#include "HybridTestObjectSwiftKotlinSpec.hpp"

namespace margelo::nitro::image {

  void HybridTestObjectSwiftKotlinSpec::loadHybridMethods() {
    // load base methods/properties
    HybridObject::loadHybridMethods();
    // load custom methods/properties
    registerHybrids(this, [](Prototype& prototype) {
      prototype.registerHybridGetter("thisObject", &HybridTestObjectSwiftKotlinSpec::getThisObject);
      prototype.registerHybridGetter("optionalHybrid", &HybridTestObjectSwiftKotlinSpec::getOptionalHybrid);
      prototype.registerHybridSetter("optionalHybrid", &HybridTestObjectSwiftKotlinSpec::setOptionalHybrid);
      prototype.registerHybridGetter("numberValue", &HybridTestObjectSwiftKotlinSpec::getNumberValue);
      prototype.registerHybridSetter("numberValue", &HybridTestObjectSwiftKotlinSpec::setNumberValue);
      prototype.registerHybridGetter("boolValue", &HybridTestObjectSwiftKotlinSpec::getBoolValue);
      prototype.registerHybridSetter("boolValue", &HybridTestObjectSwiftKotlinSpec::setBoolValue);
      prototype.registerHybridGetter("stringValue", &HybridTestObjectSwiftKotlinSpec::getStringValue);
      prototype.registerHybridSetter("stringValue", &HybridTestObjectSwiftKotlinSpec::setStringValue);
      prototype.registerHybridGetter("bigintValue", &HybridTestObjectSwiftKotlinSpec::getBigintValue);
      prototype.registerHybridSetter("bigintValue", &HybridTestObjectSwiftKotlinSpec::setBigintValue);
      prototype.registerHybridGetter("stringOrUndefined", &HybridTestObjectSwiftKotlinSpec::getStringOrUndefined);
      prototype.registerHybridSetter("stringOrUndefined", &HybridTestObjectSwiftKotlinSpec::setStringOrUndefined);
      prototype.registerHybridGetter("stringOrNull", &HybridTestObjectSwiftKotlinSpec::getStringOrNull);
      prototype.registerHybridSetter("stringOrNull", &HybridTestObjectSwiftKotlinSpec::setStringOrNull);
      prototype.registerHybridGetter("optionalString", &HybridTestObjectSwiftKotlinSpec::getOptionalString);
      prototype.registerHybridSetter("optionalString", &HybridTestObjectSwiftKotlinSpec::setOptionalString);
      prototype.registerHybridGetter("optionalArray", &HybridTestObjectSwiftKotlinSpec::getOptionalArray);
      prototype.registerHybridSetter("optionalArray", &HybridTestObjectSwiftKotlinSpec::setOptionalArray);
      prototype.registerHybridGetter("optionalEnum", &HybridTestObjectSwiftKotlinSpec::getOptionalEnum);
      prototype.registerHybridSetter("optionalEnum", &HybridTestObjectSwiftKotlinSpec::setOptionalEnum);
      prototype.registerHybridGetter("optionalOldEnum", &HybridTestObjectSwiftKotlinSpec::getOptionalOldEnum);
      prototype.registerHybridSetter("optionalOldEnum", &HybridTestObjectSwiftKotlinSpec::setOptionalOldEnum);
      prototype.registerHybridGetter("optionalCallback", &HybridTestObjectSwiftKotlinSpec::getOptionalCallback);
      prototype.registerHybridSetter("optionalCallback", &HybridTestObjectSwiftKotlinSpec::setOptionalCallback);
      prototype.registerHybridGetter("someVariant", &HybridTestObjectSwiftKotlinSpec::getSomeVariant);
      prototype.registerHybridSetter("someVariant", &HybridTestObjectSwiftKotlinSpec::setSomeVariant);
      prototype.registerHybridMethod("newTestObject", &HybridTestObjectSwiftKotlinSpec::newTestObject);
      prototype.registerHybridMethod("simpleFunc", &HybridTestObjectSwiftKotlinSpec::simpleFunc);
      prototype.registerHybridMethod("addNumbers", &HybridTestObjectSwiftKotlinSpec::addNumbers);
      prototype.registerHybridMethod("addStrings", &HybridTestObjectSwiftKotlinSpec::addStrings);
      prototype.registerHybridMethod("multipleArguments", &HybridTestObjectSwiftKotlinSpec::multipleArguments);
      prototype.registerHybridMethod("bounceStrings", &HybridTestObjectSwiftKotlinSpec::bounceStrings);
      prototype.registerHybridMethod("bounceNumbers", &HybridTestObjectSwiftKotlinSpec::bounceNumbers);
      prototype.registerHybridMethod("bounceStructs", &HybridTestObjectSwiftKotlinSpec::bounceStructs);
      prototype.registerHybridMethod("bounceEnums", &HybridTestObjectSwiftKotlinSpec::bounceEnums);
      prototype.registerHybridMethod("complexEnumCallback", &HybridTestObjectSwiftKotlinSpec::complexEnumCallback);
      prototype.registerHybridMethod("createMap", &HybridTestObjectSwiftKotlinSpec::createMap);
      prototype.registerHybridMethod("mapRoundtrip", &HybridTestObjectSwiftKotlinSpec::mapRoundtrip);
      prototype.registerHybridMethod("funcThatThrows", &HybridTestObjectSwiftKotlinSpec::funcThatThrows);
      prototype.registerHybridMethod("funcThatThrowsBeforePromise", &HybridTestObjectSwiftKotlinSpec::funcThatThrowsBeforePromise);
      prototype.registerHybridMethod("throwError", &HybridTestObjectSwiftKotlinSpec::throwError);
      prototype.registerHybridMethod("tryOptionalParams", &HybridTestObjectSwiftKotlinSpec::tryOptionalParams);
      prototype.registerHybridMethod("tryMiddleParam", &HybridTestObjectSwiftKotlinSpec::tryMiddleParam);
      prototype.registerHybridMethod("tryOptionalEnum", &HybridTestObjectSwiftKotlinSpec::tryOptionalEnum);
      prototype.registerHybridMethod("bounceMap", &HybridTestObjectSwiftKotlinSpec::bounceMap);
      prototype.registerHybridMethod("calculateFibonacciSync", &HybridTestObjectSwiftKotlinSpec::calculateFibonacciSync);
      prototype.registerHybridMethod("calculateFibonacciAsync", &HybridTestObjectSwiftKotlinSpec::calculateFibonacciAsync);
      prototype.registerHybridMethod("wait", &HybridTestObjectSwiftKotlinSpec::wait);
      prototype.registerHybridMethod("promiseThrows", &HybridTestObjectSwiftKotlinSpec::promiseThrows);
      prototype.registerHybridMethod("awaitAndGetPromise", &HybridTestObjectSwiftKotlinSpec::awaitAndGetPromise);
      prototype.registerHybridMethod("awaitAndGetComplexPromise", &HybridTestObjectSwiftKotlinSpec::awaitAndGetComplexPromise);
      prototype.registerHybridMethod("awaitPromise", &HybridTestObjectSwiftKotlinSpec::awaitPromise);
      prototype.registerHybridMethod("callCallback", &HybridTestObjectSwiftKotlinSpec::callCallback);
      prototype.registerHybridMethod("callAll", &HybridTestObjectSwiftKotlinSpec::callAll);
      prototype.registerHybridMethod("callWithOptional", &HybridTestObjectSwiftKotlinSpec::callWithOptional);
      prototype.registerHybridMethod("callSumUpNTimes", &HybridTestObjectSwiftKotlinSpec::callSumUpNTimes);
      prototype.registerHybridMethod("callbackAsyncPromise", &HybridTestObjectSwiftKotlinSpec::callbackAsyncPromise);
      prototype.registerHybridMethod("callbackAsyncPromiseBuffer", &HybridTestObjectSwiftKotlinSpec::callbackAsyncPromiseBuffer);
      prototype.registerHybridMethod("getComplexCallback", &HybridTestObjectSwiftKotlinSpec::getComplexCallback);
      prototype.registerHybridMethod("getValueFromJSCallbackAndWait", &HybridTestObjectSwiftKotlinSpec::getValueFromJSCallbackAndWait);
      prototype.registerHybridMethod("getValueFromJsCallback", &HybridTestObjectSwiftKotlinSpec::getValueFromJsCallback);
      prototype.registerHybridMethod("getCar", &HybridTestObjectSwiftKotlinSpec::getCar);
      prototype.registerHybridMethod("isCarElectric", &HybridTestObjectSwiftKotlinSpec::isCarElectric);
      prototype.registerHybridMethod("getDriver", &HybridTestObjectSwiftKotlinSpec::getDriver);
      prototype.registerHybridMethod("jsStyleObjectAsParameters", &HybridTestObjectSwiftKotlinSpec::jsStyleObjectAsParameters);
      prototype.registerHybridMethod("createArrayBuffer", &HybridTestObjectSwiftKotlinSpec::createArrayBuffer);
      prototype.registerHybridMethod("getBufferLastItem", &HybridTestObjectSwiftKotlinSpec::getBufferLastItem);
      prototype.registerHybridMethod("setAllValuesTo", &HybridTestObjectSwiftKotlinSpec::setAllValuesTo);
      prototype.registerHybridMethod("createArrayBufferAsync", &HybridTestObjectSwiftKotlinSpec::createArrayBufferAsync);
      prototype.registerHybridMethod("createChild", &HybridTestObjectSwiftKotlinSpec::createChild);
      prototype.registerHybridMethod("createBase", &HybridTestObjectSwiftKotlinSpec::createBase);
      prototype.registerHybridMethod("createBaseActualChild", &HybridTestObjectSwiftKotlinSpec::createBaseActualChild);
      prototype.registerHybridMethod("bounceChild", &HybridTestObjectSwiftKotlinSpec::bounceChild);
      prototype.registerHybridMethod("bounceBase", &HybridTestObjectSwiftKotlinSpec::bounceBase);
      prototype.registerHybridMethod("bounceChildBase", &HybridTestObjectSwiftKotlinSpec::bounceChildBase);
      prototype.registerHybridMethod("castBase", &HybridTestObjectSwiftKotlinSpec::castBase);
    });
  }

} // namespace margelo::nitro::image
