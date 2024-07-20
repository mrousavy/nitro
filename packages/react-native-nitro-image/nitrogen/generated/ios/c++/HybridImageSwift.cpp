#include "HybridImageSwift.hpp"
#include "NitroImage-Swift.h"

HybridImageSwift::HybridImageSwift(NitroImage::ImageSpecCxx* spec): HybridImage(), _swiftPart(nullptr) {
}

std::shared_ptr<ArrayBuffer> HybridImageSwift::toArrayBuffer(ImageFormat format) {
  throw std::runtime_error("toArrayBuffer is not yet implemented!");
}

std::future<void> HybridImageSwift::saveToFile(const std::string& path) {
  throw std::runtime_error("saveToFile is not yet implemented!");
}


