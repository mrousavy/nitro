
// TODO- CLEAN UP AFTER 0.87 becomes the norm

#pragma once

namespace margelo::nitro {

template <typename TRawProps>
auto getRawProp(const TRawProps& rawProps, const char* name, int /* preferred */)
    -> decltype(rawProps.at(name)) {
  return rawProps.at(name);
}

template <typename TRawProps>
auto getRawProp(const TRawProps& rawProps, const char* name, long /* fallback */)
    -> decltype(rawProps.at(name, nullptr, nullptr)) {
  return rawProps.at(name, nullptr, nullptr);
}

template <typename TRawProps>
auto getRawProp(const TRawProps& rawProps, const char* name)
    -> decltype(getRawProp(rawProps, name, 0)) {
  return getRawProp(rawProps, name, 0);
}

} // namespace margelo::nitro
