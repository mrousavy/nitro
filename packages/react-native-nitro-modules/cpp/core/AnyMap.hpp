//
// Created by Marc Rousavy on 30.07.24.
//

#pragma once

#include <map>
#include <string>
#include <variant>
#include <memory>

namespace margelo::nitro {

struct AnyValue;
using AnyArray = std::vector<AnyValue>;
using AnyObject = std::map<std::string, AnyValue>;

struct AnyValue : std::variant<std::monostate, bool, double, int64_t, std::string, AnyArray, AnyObject> {
    using std::variant<std::monostate, bool, double, int64_t, std::string, AnyArray, AnyObject>::variant;

    static AnyValue null() { return std::monostate(); }
    static AnyValue boolean(bool b) { return b; }
    static AnyValue number(double d) { return d; }
    static AnyValue bigint(int64_t b) { return b; }
    static AnyValue string(const std::string& s) { return s; }
    static AnyValue array(const AnyValue& arr) { return arr; }
    static AnyValue object(const AnyValue& obj) { return obj; }
};

class AnyMap {
public:
    explicit AnyMap() {}

public:
    /**
     * Returns whether the map contains the given key, or not.
     */
    bool contains(const std::string& key);

public:
    double getDouble(const std::string& key);
    bool getBoolean(const std::string& key);
    int64_t getBigInt(const std::string& key);
    std::string getString(const std::string& key);
    AnyArray getArray(const std::string& key);
    AnyObject getObject(const std::string& key);

public:
    void setDouble(const std::string& key, double value);
    void setBoolean(const std::string& key, bool value);
    void setBigInt(const std::string& key, int64_t value);
    void setString(const std::string& key, const std::string& value);
    void setArray(const std::string& key, const AnyArray& value);
    void setObject(const std::string& key, const AnyObject& value);

private:
    std::unordered_map<std::string, AnyValue> _map;
};

} // margelo::nitro
