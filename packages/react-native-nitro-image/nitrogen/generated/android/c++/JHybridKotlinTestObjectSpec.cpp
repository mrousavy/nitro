///
/// JHybridKotlinTestObjectSpec.cpp
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2024 Marc Rousavy @ Margelo
///

#include "JHybridKotlinTestObjectSpec.hpp"
#include <NitroModules/JSIConverter+JNI.hpp>

namespace margelo::nitro::image {

  jni::local_ref<JHybridKotlinTestObjectSpec::jhybriddata> JHybridKotlinTestObjectSpec::initHybrid(jni::alias_ref<jhybridobject> jThis) {
    return makeCxxInstance(jThis);
  }

  void JHybridKotlinTestObjectSpec::registerNatives() {
    registerHybrid({
      makeNativeMethod("initHybrid", JHybridKotlinTestObjectSpec::initHybrid),
    });
  }

  size_t JHybridKotlinTestObjectSpec::getExternalMemorySize() noexcept {
    static const auto method = _javaPart->getClass()->getMethod<jlong()>("getMemorySize");
    return method(_javaPart);
  }

  // Properties
  double JHybridKotlinTestObjectSpec::getNumberValue() {
    auto result = this->getNumberValueJNI();
    return result;
  }
  void JHybridKotlinTestObjectSpec::setNumberValue(double numberValue) {
    this->setNumberValueJNI(numberValue);
  }
  std::optional<double> JHybridKotlinTestObjectSpec::getOptionalNumber() {
    auto result = this->getOptionalNumberJNI();
    return result != nullptr ? std::make_optional(result->value()) : std::nullopt;
  }
  void JHybridKotlinTestObjectSpec::setOptionalNumber(std::optional<double> optionalNumber) {
    this->setOptionalNumberJNI(optionalNumber.has_value() ? jni::JDouble::valueOf(optionalNumber.value()) : nullptr);
  }
  std::vector<double> JHybridKotlinTestObjectSpec::getPrimitiveArray() {
    auto result = this->getPrimitiveArrayJNI();
    return [&]() {
      size_t size = result->size();
      std::vector<double> vector;
      vector.reserve(size);
      result->getRegion(0, size, vector.data());
      return vector;
    }();
  }
  void JHybridKotlinTestObjectSpec::setPrimitiveArray(const std::vector<double>& primitiveArray) {
    this->setPrimitiveArrayJNI([&]() {
      size_t size = primitiveArray.size();
      jni::local_ref<jni::JArrayDouble> array = jni::JArrayDouble::newArray(size);
      array->setRegion(0, size, primitiveArray.data());
      return array;
    }());
  }
  std::vector<Car> JHybridKotlinTestObjectSpec::getCarCollection() {
    auto result = this->getCarCollectionJNI();
    return [&]() {
      size_t size = result->size();
      std::vector<Car> vector;
      vector.reserve(size);
      for (size_t i = 0; i < size; i++) {
        auto element = result->getElement(i);
        vector.push_back(element->toCpp());
      }
      return vector;
    }();
  }
  void JHybridKotlinTestObjectSpec::setCarCollection(const std::vector<Car>& carCollection) {
    this->setCarCollectionJNI([&]() {
      size_t size = carCollection.size();
      jni::local_ref<jni::JArrayClass<JCar>> array = jni::JArrayClass<JCar>::newArray(size);
      for (size_t i = 0; i < size; i++) {
        const auto& element = carCollection[i];
        array->setElement(i, *JCar::fromCpp(element));
      }
      return array;
    }());
  }
  std::shared_ptr<ArrayBuffer> JHybridKotlinTestObjectSpec::getSomeBuffer() {
    auto result = this->getSomeBufferJNI();
    return result->cthis()->getArrayBuffer();
  }
  void JHybridKotlinTestObjectSpec::setSomeBuffer(const std::shared_ptr<ArrayBuffer>& someBuffer) {
    this->setSomeBufferJNI(JArrayBuffer::wrap(someBuffer));
  }
  std::unordered_map<std::string, std::string> JHybridKotlinTestObjectSpec::getSomeRecord() {
    auto result = this->getSomeRecordJNI();
    return [&]() {
      std::unordered_map<std::string, std::string> map;
      map.reserve(result->size());
      for (const auto& entry : *result) {
        map.emplace(entry.first->toStdString(), entry.second->toStdString());
      }
      return map;
    }();
  }
  void JHybridKotlinTestObjectSpec::setSomeRecord(const std::unordered_map<std::string, std::string>& someRecord) {
    this->setSomeRecordJNI([&]() {
      auto map = jni::JHashMap<jni::JString, jni::JString>::create(someRecord.size());
      for (const auto& entry : someRecord) {
        map->put(jni::make_jstring(entry.first), jni::make_jstring(entry.second));
      }
      return map;
    }());
  }

  // Methods
  std::future<void> JHybridKotlinTestObjectSpec::asyncTest() {
    auto result = this->asyncTestJNI();
    return [&]() {
      auto promise = std::make_shared<std::promise<void>>();
      result->cthis()->addOnResolvedListener([=](const jni::alias_ref<jni::JObject>& boxedResult) {
        promise->set_value();
      });
      result->cthis()->addOnRejectedListener([=](const jni::alias_ref<jni::JString>& message) {
        std::runtime_error error(message->toStdString());
        promise->set_exception(std::make_exception_ptr(error));
      });
      return promise->get_future();
    }();
  }
  std::shared_ptr<AnyMap> JHybridKotlinTestObjectSpec::createMap() {
    auto result = this->createMapJNI();
    return result->cthis()->getMap();
  }
  void JHybridKotlinTestObjectSpec::addOnPersonBornListener(const std::function<void(const Person& /* p */)>& callback) {
    this->addOnPersonBornListenerJNI(JFunc_void_Person::fromCpp(callback));
  }

  // JNI Properties
  double JHybridKotlinTestObjectSpec::getNumberValueJNI() {
    static const auto method = _javaPart->getClass()->getMethod<double()>("getNumberValue");
    return method(_javaPart);
  }
  void JHybridKotlinTestObjectSpec::setNumberValueJNI(double numberValue) {
    static const auto method = _javaPart->getClass()->getMethod<void(double /* numberValue */)>("setNumberValue");
    return method(_javaPart, numberValue);
  }
  jni::alias_ref<jni::JDouble> JHybridKotlinTestObjectSpec::getOptionalNumberJNI() {
    static const auto method = _javaPart->getClass()->getMethod<jni::alias_ref<jni::JDouble>()>("getOptionalNumber");
    return method(_javaPart);
  }
  void JHybridKotlinTestObjectSpec::setOptionalNumberJNI(jni::alias_ref<jni::JDouble> optionalNumber) {
    static const auto method = _javaPart->getClass()->getMethod<void(jni::alias_ref<jni::JDouble> /* optionalNumber */)>("setOptionalNumber");
    return method(_javaPart, optionalNumber);
  }
  jni::alias_ref<jni::JArrayDouble> JHybridKotlinTestObjectSpec::getPrimitiveArrayJNI() {
    static const auto method = _javaPart->getClass()->getMethod<jni::alias_ref<jni::JArrayDouble>()>("getPrimitiveArray");
    return method(_javaPart);
  }
  void JHybridKotlinTestObjectSpec::setPrimitiveArrayJNI(const jni::alias_ref<jni::JArrayDouble>& primitiveArray) {
    static const auto method = _javaPart->getClass()->getMethod<void(jni::alias_ref<jni::JArrayDouble> /* primitiveArray */)>("setPrimitiveArray");
    return method(_javaPart, primitiveArray);
  }
  jni::alias_ref<jni::JArrayClass<JCar>> JHybridKotlinTestObjectSpec::getCarCollectionJNI() {
    static const auto method = _javaPart->getClass()->getMethod<jni::alias_ref<jni::JArrayClass<JCar>>()>("getCarCollection");
    return method(_javaPart);
  }
  void JHybridKotlinTestObjectSpec::setCarCollectionJNI(const jni::alias_ref<jni::JArrayClass<JCar>>& carCollection) {
    static const auto method = _javaPart->getClass()->getMethod<void(jni::alias_ref<jni::JArrayClass<JCar>> /* carCollection */)>("setCarCollection");
    return method(_javaPart, carCollection);
  }
  jni::alias_ref<JArrayBuffer::javaobject> JHybridKotlinTestObjectSpec::getSomeBufferJNI() {
    static const auto method = _javaPart->getClass()->getMethod<jni::alias_ref<JArrayBuffer::javaobject>()>("getSomeBuffer");
    return method(_javaPart);
  }
  void JHybridKotlinTestObjectSpec::setSomeBufferJNI(const jni::alias_ref<JArrayBuffer::javaobject>& someBuffer) {
    static const auto method = _javaPart->getClass()->getMethod<void(jni::alias_ref<JArrayBuffer::javaobject> /* someBuffer */)>("setSomeBuffer");
    return method(_javaPart, someBuffer);
  }
  jni::alias_ref<jni::JMap<jni::JString, jni::JString>> JHybridKotlinTestObjectSpec::getSomeRecordJNI() {
    static const auto method = _javaPart->getClass()->getMethod<jni::alias_ref<jni::JMap<jni::JString, jni::JString>>()>("getSomeRecord");
    return method(_javaPart);
  }
  void JHybridKotlinTestObjectSpec::setSomeRecordJNI(const jni::alias_ref<jni::JMap<jni::JString, jni::JString>>& someRecord) {
    static const auto method = _javaPart->getClass()->getMethod<void(jni::alias_ref<jni::JMap<jni::JString, jni::JString>> /* someRecord */)>("setSomeRecord");
    return method(_javaPart, someRecord);
  }

  // JNI Methods
  jni::alias_ref<JPromise::javaobject> JHybridKotlinTestObjectSpec::asyncTestJNI() {
    static const auto method = _javaPart->getClass()->getMethod<jni::alias_ref<JPromise::javaobject>()>("asyncTest");
    return method(_javaPart);
  }
  jni::alias_ref<JAnyMap::javaobject> JHybridKotlinTestObjectSpec::createMapJNI() {
    static const auto method = _javaPart->getClass()->getMethod<jni::alias_ref<JAnyMap::javaobject>()>("createMap");
    return method(_javaPart);
  }
  void JHybridKotlinTestObjectSpec::addOnPersonBornListenerJNI(const jni::alias_ref<JFunc_void_Person::javaobject>& callback) {
    static const auto method = _javaPart->getClass()->getMethod<void(jni::alias_ref<JFunc_void_Person::javaobject> /* callback */)>("addOnPersonBornListener");
    return method(_javaPart, callback);
  }

  void JHybridKotlinTestObjectSpec::loadHybridMethods() {
    // Load base Prototype methods
    HybridKotlinTestObjectSpec::loadHybridMethods();
    // Override base Prototype methods with JNI methods
    registerHybrids(this, [](Prototype& prototype) {
      prototype.registerHybridGetter("numberValue", &JHybridKotlinTestObjectSpec::getNumberValueJNI);
      prototype.registerHybridSetter("numberValue", &JHybridKotlinTestObjectSpec::setNumberValueJNI);
      prototype.registerHybridGetter("optionalNumber", &JHybridKotlinTestObjectSpec::getOptionalNumberJNI);
      prototype.registerHybridSetter("optionalNumber", &JHybridKotlinTestObjectSpec::setOptionalNumberJNI);
      prototype.registerHybridGetter("primitiveArray", &JHybridKotlinTestObjectSpec::getPrimitiveArrayJNI);
      prototype.registerHybridSetter("primitiveArray", &JHybridKotlinTestObjectSpec::setPrimitiveArrayJNI);
      prototype.registerHybridGetter("carCollection", &JHybridKotlinTestObjectSpec::getCarCollectionJNI);
      prototype.registerHybridSetter("carCollection", &JHybridKotlinTestObjectSpec::setCarCollectionJNI);
      prototype.registerHybridGetter("someBuffer", &JHybridKotlinTestObjectSpec::getSomeBufferJNI);
      prototype.registerHybridSetter("someBuffer", &JHybridKotlinTestObjectSpec::setSomeBufferJNI);
      prototype.registerHybridGetter("someRecord", &JHybridKotlinTestObjectSpec::getSomeRecordJNI);
      prototype.registerHybridSetter("someRecord", &JHybridKotlinTestObjectSpec::setSomeRecordJNI);
      prototype.registerHybridMethod("asyncTest", &JHybridKotlinTestObjectSpec::asyncTestJNI);
      prototype.registerHybridMethod("createMap", &JHybridKotlinTestObjectSpec::createMapJNI);
      prototype.registerHybridMethod("addOnPersonBornListener", &JHybridKotlinTestObjectSpec::addOnPersonBornListenerJNI);
    });
  }

} // namespace margelo::nitro::image
