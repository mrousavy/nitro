#include "UIThreadDispatcher.hpp"

namespace margelo::nitro {

UIThreadDispatcher::UIThreadDispatcher() : _queue(dispatch_get_main_queue()) {}

void UIThreadDispatcher::runSync(std::function<void()>&& function) {
  std::function<void()> funcCopy = function;
  dispatch_sync(_queue, ^{
    funcCopy();
  });
}

void UIThreadDispatcher::runAsync(std::function<void()>&& function) {
  std::function<void()> funcCopy = function;
  dispatch_async(_queue, ^{
    funcCopy();
  });
}

} // namespace margelo::nitro
