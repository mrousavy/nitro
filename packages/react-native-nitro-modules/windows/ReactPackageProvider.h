#pragma once

#include "ReactPackageProvider.g.h"

namespace winrt::NitroModules::implementation {

using winrt::Microsoft::ReactNative::IReactPackageBuilder;

struct ReactPackageProvider : ReactPackageProviderT<ReactPackageProvider> {
  ReactPackageProvider() = default;

  void CreatePackage(IReactPackageBuilder const& packageBuilder) noexcept;
};

} // namespace winrt::NitroModules::implementation

namespace winrt::NitroModules::factory_implementation {

using winrt::Microsoft::ReactNative::IReactPackageBuilder;

struct ReactPackageProvider : ReactPackageProviderT<ReactPackageProvider, implementation::ReactPackageProvider> {};

} // namespace winrt::NitroModules::factory_implementation
