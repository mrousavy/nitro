//
// Created by Marc Rousavy on 26.07.24.
//

#pragma once

#if __has_include(<NitroImageSpecJSI.h>)
#include <NitroImageSpecJSI.h>
#else
#error Cannot find react-native-nitro-image spec! Try cleaning your cache and re-running CodeGen!
#endif

namespace facebook::react {

// The base C++-based TurboModule. This is the entry point where all nitro modules get initialized.
class NativeNitroImage : public NativeNitroImageCxxSpec<NativeNitroImage> {
public:
  NativeNitroImage(std::shared_ptr<CallInvoker> jsInvoker);
  ~NativeNitroImage();

  void install(jsi::Runtime& runtime);

private:
  std::shared_ptr<CallInvoker> _callInvoker;
};

} // namespace facebook::react
