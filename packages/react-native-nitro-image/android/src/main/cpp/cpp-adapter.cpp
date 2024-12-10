#include <fbjni/fbjni.h>
#include <jni.h>

#include "NitroImageOnLoad.hpp"



JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void*) {
  return facebook::jni::initialize(vm, [=] {
      margelo::nitro::image::initialize(vm);

      // Add our custom component ComponentDescriptor
//      DefaultComponentsRegistry::sharedProviderRegistry()->add()
//      auto provider = concreteComponentDescriptorProvider<CustomViewComponentDescriptor>();
//      facebook::react::CoreComponentsRegistry::sharedProviderRegistry()->add(std::move(provider));
  });
}
