//
// Created by Marc Rousavy on 22.02.24.
//

#pragma once

#include "HybridObject.hpp"
#include <optional>
#include <string>
#include <vector>

namespace margelo {

class TestHybridObject : public HybridObject {
public:
  explicit TestHybridObject() : HybridObject("TestHybridObject") {}

public:
  int getInt() {
    return _int;
  }
  void setInt(int newValue) {
    _int = newValue;
  }
  std::string getString() {
    return _string;
  }
  void setString(const std::string& newValue) {
    _string = newValue;
  }
  std::optional<std::string> getNullableString() {
    return _nullableString;
  }
  void setNullableString(std::optional<std::string> string) {
    _nullableString = string;
  }

  std::unordered_map<std::string, double> multipleArguments(int first, bool second, std::string third) {
    return std::unordered_map<std::string, double>{{"first", 5312}, {"second", 532233}, {"third", 2786}};
  }

  std::function<int()> getIntGetter() {
    return [this]() -> int { return this->_int; };
  }
  void sayHelloCallback(std::function<void(std::string)> callback) {
    callback("Test Hybrid");
  }
  std::shared_ptr<TestHybridObject> createNewHybridObject() {
    return std::make_shared<TestHybridObject>();
  }

  uint64_t calculateFibonacci(int count) {
    if (count < 0)
      throw std::invalid_argument("Cannot calculate fibonacci for " + std::to_string(count) + " - it needs to be at least 0!");
    if (count == 0)
      return 0;
    if (count == 1)
      return 1;
    if (count >= 94)
      throw std::invalid_argument("Cannot calculate fibonacci for " + std::to_string(count) +
                                  " - it needs to be 94 at max, the number will overflow!");

    uint64_t prev = 0;
    uint64_t current = 1;
    for (unsigned int i = 2; i <= count; ++i) {
      uint64_t next = prev + current;
      prev = current;
      current = next;
    }
    return current;
  }

  std::future<uint64_t> calculateFibonacciAsync(int count) {
    return std::async(std::launch::async, [count, this]() { return this->calculateFibonacci(count); });
  }

private:
  int _int;
  std::string _string;
  std::optional<std::string> _nullableString;

  void loadHybridMethods() override;
};

} // namespace margelo
