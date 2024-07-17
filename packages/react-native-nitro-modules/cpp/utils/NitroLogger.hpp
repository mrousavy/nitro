//
// Created by Marc Rousavy on 05.03.24.
//

#pragma once

#include <iostream>
#include <string>
#include <cstdio>
#include <cstdarg>
#include <vector>

namespace margelo::nitro {

class Logger {
private:
  Logger() = delete;

public:
    template <typename... Args>
    static void log(const char* tag, const char* message, Args&&... args) {
        std::string formattedMessage = format(message, std::forward<Args>(args)...);
        std::cout << "[" << tag << "] " << formattedMessage << std::endl;
    }

private:
    template <typename... Args>
    static std::string format(const char* formatString, Args&&... args) {
        int size_s = std::snprintf(nullptr, 0, formatString, args...) + 1; // Extra space for '\0'
        if (size_s <= 0) {
            throw std::runtime_error("Error during formatting.");
        }
        auto size = static_cast<size_t>(size_s);
        std::vector<char> buf(size);
        std::snprintf(buf.data(), size, formatString, args...);
        return std::string(buf.data(), buf.data() + size - 1); // We don't want the '\0' inside
    }
};

} // namespace margelo::nitro
