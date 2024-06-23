//
// Created by Marc Rousavy on 20.02.24.
//

#include "TestHybridObject.hpp"

namespace margelo {

void TestHybridObject::loadHybridMethods() {
  // this.int get & set
  registerHybridGetter("int", &TestHybridObject::getInt, this);
  registerHybridSetter("int", &TestHybridObject::setInt, this);
  // this.string get & set
  registerHybridGetter("string", &TestHybridObject::getString, this);
  registerHybridSetter("string", &TestHybridObject::setString, this);
  // this.nullableString get & set
  registerHybridGetter("nullableString", &TestHybridObject::getNullableString, this);
  registerHybridSetter("nullableString", &TestHybridObject::setNullableString, this);
  // methods
  registerHybridMethod("multipleArguments", &TestHybridObject::multipleArguments, this);
  // callbacks
  registerHybridMethod("getIntGetter", &TestHybridObject::getIntGetter, this);
  registerHybridMethod("sayHelloCallback", &TestHybridObject::sayHelloCallback, this);
  // custom types
  registerHybridMethod("createNewHybridObject", &TestHybridObject::createNewHybridObject, this);
  // Promises
  registerHybridMethod("calculateFibonacci", &TestHybridObject::calculateFibonacci, this);
  registerHybridMethod("calculateFibonacciAsync", &TestHybridObject::calculateFibonacciAsync, this);
  // Error
  registerHybridMethod("throwError", &TestHybridObject::throwError, this);
}

} // namespace margelo
