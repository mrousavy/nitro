//
//  HybridObjectRegistry.cpp
//  DoubleConversion
//
//  Created by Marc Rousavy on 22.07.24.
//

#include "HybridObjectRegistry.hpp"
#include "NitroLogger.hpp"

namespace margelo::nitro {

std::unordered_map<std::string, HybridObjectRegistry::HybridObjectConstructorFn>& HybridObjectRegistry::getRegistry() {
  static std::unordered_map<std::string, HybridObjectRegistry::HybridObjectConstructorFn> _constructorsMap;
  return _constructorsMap;
}

void HybridObjectRegistry::registerHybridObjectConstructor(const std::string& hybridObjectName, HybridObjectConstructorFn&& constructorFn) {
  Logger::log(TAG, "Registering HybridObject \"%s\"...", hybridObjectName);
  auto& map = HybridObjectRegistry::getRegistry();
#if DEBUG
  if (map.contains(hybridObjectName)) [[unlikely]] {
    auto message =
        "HybridObject \"" + std::string(hybridObjectName) +
        "\" has already been "
        "registered in the Nitro Modules HybridObjectRegistry! Suggestions:\n"
        "- If you just installed another library, maybe both libraries are using the same name?\n"
        "- If you just registered your own HybridObject, maybe you accidentally called `registerHybridObjectConstructor(...)` twice?";
    throw std::runtime_error(message);
  }
#endif
  map.insert({hybridObjectName, std::move(constructorFn)});
  Logger::log(TAG, "Successfully registered HybridObject \"%s\"!", hybridObjectName);
}

std::shared_ptr<HybridObject> HybridObjectRegistry::createHybridObject(const std::string& hybridObjectName) {
  auto& map = HybridObjectRegistry::getRegistry();
  auto fn = map.find(hybridObjectName);
  if (fn == map.end()) [[unlikely]] {
    auto message = "Cannot create an instance of HybridObject \"" + std::string(hybridObjectName) +
                   "\" - "
                   "It has not yet been registered in the Nitro Modules HybridObjectRegistry!";
    throw std::runtime_error(message);
  }
  std::shared_ptr<HybridObject> instance = fn->second();

#if DEBUG
  if (instance == nullptr) [[unlikely]] {
    throw std::runtime_error("Failed to create HybridObject \"" + hybridObjectName +
                             "\" - "
                             "The constructor returned a nullptr!");
  }
  if (instance->getName() != hybridObjectName) [[unlikely]] {
    throw std::runtime_error("HybridObject's name (\"" + instance->getName() +
                             "\") does not match"
                             "the name it was registered with (\"" +
                             hybridObjectName + "\")!");
  }
#endif

  return instance;
}

} // namespace margelo::nitro
