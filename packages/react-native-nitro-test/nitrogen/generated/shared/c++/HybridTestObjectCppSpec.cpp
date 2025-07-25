///
/// HybridTestObjectCppSpec.cpp
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2025 Marc Rousavy @ Margelo
///

#include "HybridTestObjectCppSpec.hpp"

namespace margelo::nitro::test {

  void HybridTestObjectCppSpec::loadHybridMethods() {
    // load base methods/properties
    HybridObject::loadHybridMethods();
    // load custom methods/properties
    registerHybrids(this, [](Prototype& prototype) {
      prototype.registerHybridGetter("someTuple", &HybridTestObjectCppSpec::getSomeTuple);
      prototype.registerHybridSetter("someTuple", &HybridTestObjectCppSpec::setSomeTuple);
      prototype.registerHybridGetter("thisObject", &HybridTestObjectCppSpec::getThisObject);
      prototype.registerHybridGetter("optionalHybrid", &HybridTestObjectCppSpec::getOptionalHybrid);
      prototype.registerHybridSetter("optionalHybrid", &HybridTestObjectCppSpec::setOptionalHybrid);
      prototype.registerHybridGetter("numberValue", &HybridTestObjectCppSpec::getNumberValue);
      prototype.registerHybridSetter("numberValue", &HybridTestObjectCppSpec::setNumberValue);
      prototype.registerHybridGetter("boolValue", &HybridTestObjectCppSpec::getBoolValue);
      prototype.registerHybridSetter("boolValue", &HybridTestObjectCppSpec::setBoolValue);
      prototype.registerHybridGetter("stringValue", &HybridTestObjectCppSpec::getStringValue);
      prototype.registerHybridSetter("stringValue", &HybridTestObjectCppSpec::setStringValue);
      prototype.registerHybridGetter("bigintValue", &HybridTestObjectCppSpec::getBigintValue);
      prototype.registerHybridSetter("bigintValue", &HybridTestObjectCppSpec::setBigintValue);
      prototype.registerHybridGetter("stringOrUndefined", &HybridTestObjectCppSpec::getStringOrUndefined);
      prototype.registerHybridSetter("stringOrUndefined", &HybridTestObjectCppSpec::setStringOrUndefined);
      prototype.registerHybridGetter("stringOrNull", &HybridTestObjectCppSpec::getStringOrNull);
      prototype.registerHybridSetter("stringOrNull", &HybridTestObjectCppSpec::setStringOrNull);
      prototype.registerHybridGetter("optionalString", &HybridTestObjectCppSpec::getOptionalString);
      prototype.registerHybridSetter("optionalString", &HybridTestObjectCppSpec::setOptionalString);
      prototype.registerHybridGetter("optionalArray", &HybridTestObjectCppSpec::getOptionalArray);
      prototype.registerHybridSetter("optionalArray", &HybridTestObjectCppSpec::setOptionalArray);
      prototype.registerHybridGetter("optionalEnum", &HybridTestObjectCppSpec::getOptionalEnum);
      prototype.registerHybridSetter("optionalEnum", &HybridTestObjectCppSpec::setOptionalEnum);
      prototype.registerHybridGetter("optionalOldEnum", &HybridTestObjectCppSpec::getOptionalOldEnum);
      prototype.registerHybridSetter("optionalOldEnum", &HybridTestObjectCppSpec::setOptionalOldEnum);
      prototype.registerHybridGetter("optionalCallback", &HybridTestObjectCppSpec::getOptionalCallback);
      prototype.registerHybridSetter("optionalCallback", &HybridTestObjectCppSpec::setOptionalCallback);
      prototype.registerHybridGetter("someVariant", &HybridTestObjectCppSpec::getSomeVariant);
      prototype.registerHybridSetter("someVariant", &HybridTestObjectCppSpec::setSomeVariant);
      prototype.registerHybridMethod("getVariantTuple", &HybridTestObjectCppSpec::getVariantTuple);
      prototype.registerHybridMethod("flip", &HybridTestObjectCppSpec::flip);
      prototype.registerHybridMethod("passTuple", &HybridTestObjectCppSpec::passTuple);
      prototype.registerHybridMethod("newTestObject", &HybridTestObjectCppSpec::newTestObject);
      prototype.registerHybridMethod("getVariantHybrid", &HybridTestObjectCppSpec::getVariantHybrid);
      prototype.registerHybridMethod("simpleFunc", &HybridTestObjectCppSpec::simpleFunc);
      prototype.registerHybridMethod("addNumbers", &HybridTestObjectCppSpec::addNumbers);
      prototype.registerHybridMethod("addStrings", &HybridTestObjectCppSpec::addStrings);
      prototype.registerHybridMethod("multipleArguments", &HybridTestObjectCppSpec::multipleArguments);
      prototype.registerHybridMethod("bounceStrings", &HybridTestObjectCppSpec::bounceStrings);
      prototype.registerHybridMethod("bounceNumbers", &HybridTestObjectCppSpec::bounceNumbers);
      prototype.registerHybridMethod("bounceStructs", &HybridTestObjectCppSpec::bounceStructs);
      prototype.registerHybridMethod("bounceEnums", &HybridTestObjectCppSpec::bounceEnums);
      prototype.registerHybridMethod("complexEnumCallback", &HybridTestObjectCppSpec::complexEnumCallback);
      prototype.registerHybridMethod("createMap", &HybridTestObjectCppSpec::createMap);
      prototype.registerHybridMethod("mapRoundtrip", &HybridTestObjectCppSpec::mapRoundtrip);
      prototype.registerHybridMethod("getMapKeys", &HybridTestObjectCppSpec::getMapKeys);
      prototype.registerHybridMethod("bounceMap", &HybridTestObjectCppSpec::bounceMap);
      prototype.registerHybridMethod("extractMap", &HybridTestObjectCppSpec::extractMap);
      prototype.registerHybridMethod("funcThatThrows", &HybridTestObjectCppSpec::funcThatThrows);
      prototype.registerHybridMethod("funcThatThrowsBeforePromise", &HybridTestObjectCppSpec::funcThatThrowsBeforePromise);
      prototype.registerHybridMethod("throwError", &HybridTestObjectCppSpec::throwError);
      prototype.registerHybridMethod("tryOptionalParams", &HybridTestObjectCppSpec::tryOptionalParams);
      prototype.registerHybridMethod("tryMiddleParam", &HybridTestObjectCppSpec::tryMiddleParam);
      prototype.registerHybridMethod("tryOptionalEnum", &HybridTestObjectCppSpec::tryOptionalEnum);
      prototype.registerHybridMethod("add1Hour", &HybridTestObjectCppSpec::add1Hour);
      prototype.registerHybridMethod("currentDate", &HybridTestObjectCppSpec::currentDate);
      prototype.registerHybridMethod("calculateFibonacciSync", &HybridTestObjectCppSpec::calculateFibonacciSync);
      prototype.registerHybridMethod("calculateFibonacciAsync", &HybridTestObjectCppSpec::calculateFibonacciAsync);
      prototype.registerHybridMethod("wait", &HybridTestObjectCppSpec::wait);
      prototype.registerHybridMethod("promiseThrows", &HybridTestObjectCppSpec::promiseThrows);
      prototype.registerHybridMethod("awaitAndGetPromise", &HybridTestObjectCppSpec::awaitAndGetPromise);
      prototype.registerHybridMethod("awaitAndGetComplexPromise", &HybridTestObjectCppSpec::awaitAndGetComplexPromise);
      prototype.registerHybridMethod("awaitPromise", &HybridTestObjectCppSpec::awaitPromise);
      prototype.registerHybridMethod("callCallback", &HybridTestObjectCppSpec::callCallback);
      prototype.registerHybridMethod("callAll", &HybridTestObjectCppSpec::callAll);
      prototype.registerHybridMethod("callWithOptional", &HybridTestObjectCppSpec::callWithOptional);
      prototype.registerHybridMethod("callSumUpNTimes", &HybridTestObjectCppSpec::callSumUpNTimes);
      prototype.registerHybridMethod("callbackAsyncPromise", &HybridTestObjectCppSpec::callbackAsyncPromise);
      prototype.registerHybridMethod("callbackAsyncPromiseBuffer", &HybridTestObjectCppSpec::callbackAsyncPromiseBuffer);
      prototype.registerHybridMethod("getComplexCallback", &HybridTestObjectCppSpec::getComplexCallback);
      prototype.registerHybridMethod("getValueFromJSCallbackAndWait", &HybridTestObjectCppSpec::getValueFromJSCallbackAndWait);
      prototype.registerHybridMethod("getValueFromJsCallback", &HybridTestObjectCppSpec::getValueFromJsCallback);
      prototype.registerHybridMethod("getCar", &HybridTestObjectCppSpec::getCar);
      prototype.registerHybridMethod("isCarElectric", &HybridTestObjectCppSpec::isCarElectric);
      prototype.registerHybridMethod("getDriver", &HybridTestObjectCppSpec::getDriver);
      prototype.registerHybridMethod("jsStyleObjectAsParameters", &HybridTestObjectCppSpec::jsStyleObjectAsParameters);
      prototype.registerHybridMethod("createArrayBuffer", &HybridTestObjectCppSpec::createArrayBuffer);
      prototype.registerHybridMethod("createArrayBufferFromNativeBuffer", &HybridTestObjectCppSpec::createArrayBufferFromNativeBuffer);
      prototype.registerHybridMethod("copyBuffer", &HybridTestObjectCppSpec::copyBuffer);
      prototype.registerHybridMethod("getBufferLastItem", &HybridTestObjectCppSpec::getBufferLastItem);
      prototype.registerHybridMethod("setAllValuesTo", &HybridTestObjectCppSpec::setAllValuesTo);
      prototype.registerHybridMethod("createArrayBufferAsync", &HybridTestObjectCppSpec::createArrayBufferAsync);
      prototype.registerHybridMethod("bounceArrayBuffer", &HybridTestObjectCppSpec::bounceArrayBuffer);
      prototype.registerHybridMethod("passVariant", &HybridTestObjectCppSpec::passVariant);
      prototype.registerHybridMethod("getVariantEnum", &HybridTestObjectCppSpec::getVariantEnum);
      prototype.registerHybridMethod("getVariantWeirdNumbersEnum", &HybridTestObjectCppSpec::getVariantWeirdNumbersEnum);
      prototype.registerHybridMethod("getVariantObjects", &HybridTestObjectCppSpec::getVariantObjects);
      prototype.registerHybridMethod("passNamedVariant", &HybridTestObjectCppSpec::passNamedVariant);
      prototype.registerHybridMethod("createChild", &HybridTestObjectCppSpec::createChild);
      prototype.registerHybridMethod("createBase", &HybridTestObjectCppSpec::createBase);
      prototype.registerHybridMethod("createBaseActualChild", &HybridTestObjectCppSpec::createBaseActualChild);
      prototype.registerHybridMethod("bounceChild", &HybridTestObjectCppSpec::bounceChild);
      prototype.registerHybridMethod("bounceBase", &HybridTestObjectCppSpec::bounceBase);
      prototype.registerHybridMethod("bounceChildBase", &HybridTestObjectCppSpec::bounceChildBase);
      prototype.registerHybridMethod("castBase", &HybridTestObjectCppSpec::castBase);
      prototype.registerHybridMethod("callbackSync", &HybridTestObjectCppSpec::callbackSync);
      prototype.registerHybridMethod("getIsViewBlue", &HybridTestObjectCppSpec::getIsViewBlue);
    });
  }

} // namespace margelo::nitro::test
