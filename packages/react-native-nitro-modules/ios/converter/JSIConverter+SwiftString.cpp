//
// Created by Marc Rousavy on 20.01.26.
//

#include "JSIConverter+SwiftString.hpp"
#include "JSIConverter.hpp"
#include <jsi/jsi.h>
#include <NitroModules/NitroModules-Swift-Cxx-Umbrella.hpp>
#include <string>
#include <array>
#include <vector>
#include <cstdint>

namespace margelo::nitro {

template <size_t InlineCapacity>
struct SmallUtf8Buffer {
private:
  std::array<uint8_t, InlineCapacity> _inlineBuf{};
  std::vector<uint8_t> _heapBuf;
  size_t _size = 0;
  bool _usingHeap = false;

public:
  void push(uint8_t b) {
    if (!_usingHeap) {
      if (_size < InlineCapacity) {
        _inlineBuf[_size++] = b;
        return;
      }
      // Spill to heap: move inline bytes into vector
      _usingHeap = true;
      _heapBuf.reserve(InlineCapacity * 2);
      _heapBuf.insert(_heapBuf.end(), _inlineBuf.begin(), _inlineBuf.begin() + _size);
    }
    _heapBuf.push_back(b);
    ++_size;
  }

  const uint8_t* data() const {
    return _usingHeap ? _heapBuf.data() : _inlineBuf.data();
  }
  const size_t size() const {
    return _size;
  }
};


using namespace facebook;

swift::String JSIConverter<swift::String>::fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
  jsi::String jsString = arg.getString(runtime);
  // Concat pieces of jsi::String into swift::String - some segments may be ascii, others UTF
  swift::String string = swift::String::init();
  auto callback = [&](bool ascii, const void* data, size_t length) {
    if (ascii) {
      swift::String sequence = NitroModules::StringUtils::createASCIIString(data, length);
      string.appendContentsOf(sequence);
    } else {
      const uint16_t* utf16Bytes = static_cast<const uint16_t*>(data);
      swift::String sequence = NitroModules::StringUtils::createUTF16String(utf16Bytes, length);
      string.appendContentsOf(sequence);
    }
  };
  jsString.getStringData(runtime, callback);
  // Return result
  return string;
}

jsi::Value JSIConverter<swift::String>::toJSI(jsi::Runtime& runtime, const swift::String& string) {
  SmallUtf8Buffer<256> buffer;
  bool isAscii = true;

  // Iterate through String's UTF8View
  swift::UTF8View view = string.getUtf8();
  swift::String_Index index = view.getStartIndex();
  swift::String_Index end = view.getEndIndex();
  const size_t endOffset = end.getEncodedOffset();

  while (index.getEncodedOffset() != endOffset) {
    // Copy byte into our buffer
    uint8_t b = static_cast<uint8_t>(view[index]);
    if (isAscii && (b & 0x80u)) isAscii = false;
    buffer.push(b);

    // Go to next string index
    auto next = view.indexAfter(index);
    index = next;
  }

  if (isAscii) {
    // Ascii is the fast path and requires less storage or conversions.
    auto data = reinterpret_cast<const char*>(buffer.data());
    return jsi::String::createFromAscii(runtime, data, buffer.size());
  } else {
    // UTF8 (or implicitly UTF16) is required for special characters.
    return jsi::String::createFromUtf8(runtime, buffer.data(), buffer.size());
  }
}

bool JSIConverter<swift::String>::canConvert(jsi::Runtime& runtime, const jsi::Value& value) {
  return value.isString();
}

} // namespace margelo::nitro
