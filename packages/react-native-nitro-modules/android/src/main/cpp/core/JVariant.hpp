//
//  JVariant.hpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 14.07.24.
//

#pragma once

#include "TypeIndex.hpp"
#include <fbjni/fbjni.h>
#include <string_view>
#include <tuple>
#include <type_traits>

namespace margelo::nitro {

    using namespace facebook;

    constexpr const char* ordinalNames[] = {
            "First", "Second", "Third", "Fourth", "Fifth",
            "Sixth", "Seventh", "Eighth", "Ninth"
    };

    template<size_t Index>
    constexpr const char* getOrdinalName() {
        static_assert(Index >= 1 && Index <= 9, "Index out of range");
        return ordinalNames[Index - 1];
    }

    template<size_t VariantSize>
    constexpr const char* getVariantDescriptor() {
        static_assert(VariantSize >= 2 && VariantSize <= 9, "Variant size out of range");
        if constexpr (VariantSize == 2) return "Lcom/margelo/nitro/Variant2";
        else if constexpr (VariantSize == 3) return "Lcom/margelo/nitro/Variant3";
        else if constexpr (VariantSize == 4) return "Lcom/margelo/nitro/Variant4";
        else if constexpr (VariantSize == 5) return "Lcom/margelo/nitro/Variant5";
        else if constexpr (VariantSize == 6) return "Lcom/margelo/nitro/Variant6";
        else if constexpr (VariantSize == 7) return "Lcom/margelo/nitro/Variant7";
        else if constexpr (VariantSize == 8) return "Lcom/margelo/nitro/Variant8";
        else if constexpr (VariantSize == 9) return "Lcom/margelo/nitro/Variant9";
    }

/**
 * Variant2, Variant3, Variant4, ...
 */
    template <typename... Ts>
    class JVariant : public jni::JavaClass<JVariant<Ts...>> {
    public:
        using Base = jni::JavaClass<JVariant<Ts...>>;
        using Base::self;
        static constexpr size_t variantSize = sizeof...(Ts);
        static constexpr auto kJavaDescriptor = getVariantDescriptor<sizeof...(Ts)>();

        /**
         * Variant2.First, Variant2.Second, Variant3.First, Variant3.Second, Variant3.Third, ...
         */
        template <size_t Index>
        struct JTypeClass : public jni::JavaClass<JTypeClass<Index>, JVariant<Ts...>> {
            static constexpr const char* kJavaDescriptor = []() {
                constexpr size_t variantSize = sizeof...(Ts);
                constexpr const char* variantDescriptor = getVariantDescriptor<variantSize>();
                constexpr const char* ordinalName = getOrdinalName<Index>();
                constexpr size_t len = strlen(variantDescriptor) + 1 + strlen(ordinalName);
                char buffer[len + 1] = {};
                size_t pos = 0;

                // Copy the variant descriptor
                for (size_t i = 0; variantDescriptor[i] != '\0'; ++i, ++pos) {
                    buffer[pos] = variantDescriptor[i];
                }

                // Append the '$' character
                buffer[pos++] = '$';

                // Append the ordinal name
                for (size_t i = 0; ordinalName[i] != '\0'; ++i, ++pos) {
                    buffer[pos] = ordinalName[i];
                }

                buffer[pos] = '\0';
                return buffer;
            }();

            using Base = jni::JavaClass<JTypeClass<Index>, JVariant<Ts...>>;
            using Base::self;

            using T = std::tuple_element_t<Index - 1, std::tuple<Ts...>>;
            T getValue() {
                static const auto method = JTypeClass::javaClassStatic()->getMethod<T()>("getValue");
                return method(self());
            }

            static jni::local_ref<JTypeClass<Index>> create(jni::alias_ref<T> arg) {
                return Base::newInstance(arg);
            }
        };

        template <typename T>
        using JClassForType = JTypeClass<type_index<T, Ts...>::value>;

        /**
         * Create VariantN.N(T)
         */
        template <typename T>
        static jni::local_ref<JVariant<Ts...>> create(T value) {
            using Inner = JClassForType<T>;
            return Inner::create(value);
        }

        /**
         * Check if VariantN is .N(T)
         */
        template <typename T>
        bool is() {
            using JavaClass = JClassForType<T>;
            return jni::isObjectRefType(self(), JavaClass::javaClassStatic());
        }

        /**
         * Get a VariantN.N's .N(T)
         */
        template <typename T>
        T get() {
            using JavaClass = JClassForType<T>;
            return jni::static_ref_cast<JavaClass>(self())->getValue();
        }
    };

} // namespace margelo::nitro
