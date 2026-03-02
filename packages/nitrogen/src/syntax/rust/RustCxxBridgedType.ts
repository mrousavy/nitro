import type { Language } from "../../getPlatformSpecs.js";
import type { BridgedType } from "../BridgedType.js";
import { getReferencedTypes } from "../getReferencedTypes.js";
import type { SourceFile, SourceImport } from "../SourceFile.js";
import { EnumType } from "../types/EnumType.js";
import { FunctionType } from "../types/FunctionType.js";
import { getTypeAs } from "../types/getTypeAs.js";
import { HybridObjectType } from "../types/HybridObjectType.js";
import { OptionalType } from "../types/OptionalType.js";
import { StructType } from "../types/StructType.js";
import type { Type } from "../types/Type.js";
import { PromiseType } from "../types/PromiseType.js";
import { VariantType } from "../types/VariantType.js";
import { ArrayType } from "../types/ArrayType.js";
import { RecordType } from "../types/RecordType.js";
import { TupleType } from "../types/TupleType.js";
import { createRustEnum } from "./RustEnum.js";
import { createRustFunction } from "./RustFunction.js";
import { createRustStruct } from "./RustStruct.js";
import { createRustVariant } from "./RustVariant.js";
import { createRustAnyMap } from "./RustAnyMap.js";
import { getHybridObjectName } from "../getHybridObjectName.js";
import { toSnakeCase } from "../helpers.js";
import { NitroConfig } from "../../config/NitroConfig.js";

/**
 * Monotonic counter for generating unique C++ variable names in nested
 * conversions. Without this, nested struct/optional/array conversions would
 * reuse variable names like `__s`, causing "cannot appear in its own initializer" errors.
 */
let _cppVarId = 0;
function nextCppId(): number {
  return _cppVarId++;
}

/**
 * Bridges types between Rust and C++ across the `extern "C"` FFI boundary.
 *
 * At the FFI boundary, only C-compatible types can cross:
 * - Primitives (f64, bool, i64, u64, i32) pass directly
 * - Strings become *const c_char
 * - Enums pass as i32 discriminants
 * - Complex types (arrays, optionals, structs, etc.) pass as opaque void* pointers
 *
 * Cross-allocator note: Complex types are heap-allocated by one side (C++ `new`)
 * and freed by the other (Rust `Box::from_raw`). This relies on both sides using
 * the same system allocator, which is guaranteed on Android NDK and iOS/macOS.
 * Custom allocators (e.g. `#[global_allocator]` or overridden `operator new`)
 * would break this assumption.
 */
export class RustCxxBridgedType implements BridgedType<"rust", "c++"> {
  readonly type: Type;

  constructor(type: Type) {
    this.type = type;
  }

  get hasType(): boolean {
    return this.type.kind !== "void" && this.type.kind !== "null";
  }

  get canBePassedByReference(): boolean {
    return this.type.canBePassedByReference;
  }

  get needsSpecialHandling(): boolean {
    switch (this.type.kind) {
      case "string":
      case "array":
      case "optional":
      case "record":
      case "enum":
      case "struct":
      case "variant":
      case "function":
      case "hybrid-object":
      case "promise":
      case "array-buffer":
      case "date":
      case "error":
      case "map":
      case "tuple":
        return true;
      default:
        return false;
    }
  }

  getRequiredImports(language: Language): SourceImport[] {
    const imports = this.type.getRequiredImports(language);

    // When a Rust-implemented hybrid-object is used in a Rust bridge context,
    // the C++ side needs the Rust bridge header to reconstruct a shared_ptr.
    // Non-Rust HybridObjects are passed through as opaque shared_ptr<Spec>.
    if (language === "c++" && this.type.kind === "hybrid-object") {
      const hybridType = getTypeAs(this.type, HybridObjectType);
      if (this.isRustImplementedHybridObject(hybridType)) {
        const hybridName = getHybridObjectName(hybridType.hybridObjectName);
        imports.push({
          name: `${hybridName.HybridTSpecRust}.hpp`,
          language: "c++",
          space: "user",
        });
      }
    }

    const referencedTypes = getReferencedTypes(this.type);
    for (const t of referencedTypes) {
      if (t === this.type) continue;
      const bridged = new RustCxxBridgedType(t);
      imports.push(...bridged.getRequiredImports(language));
    }

    return imports;
  }

  getExtraFiles(): SourceFile[] {
    const files: SourceFile[] = [];

    switch (this.type.kind) {
      case "enum": {
        const enumType = getTypeAs(this.type, EnumType);
        files.push(createRustEnum(enumType));
        break;
      }
      case "struct": {
        const structType = getTypeAs(this.type, StructType);
        files.push(
          createRustStruct(structType.structName, structType.properties),
        );
        break;
      }
      case "variant": {
        const variantType = getTypeAs(this.type, VariantType);
        files.push(createRustVariant(variantType));
        break;
      }
      case "function": {
        const funcType = getTypeAs(this.type, FunctionType);
        files.push(createRustFunction(funcType));
        break;
      }
      case "map": {
        files.push(createRustAnyMap());
        break;
      }
    }

    // Recursively collect extra files from referenced types
    const referencedTypes = getReferencedTypes(this.type);
    for (const t of referencedTypes) {
      if (t === this.type) continue;
      const bridged = new RustCxxBridgedType(t);
      files.push(...bridged.getExtraFiles());
    }

    return files;
  }

  /**
   * Returns the type as it appears at the FFI boundary.
   */
  getTypeCode(language: "rust" | "c++"): string {
    switch (this.type.kind) {
      case "void":
        return language === "c++" ? "void" : "()";
      case "null":
        return language === "c++" ? "void" : "()";
      case "number":
        return language === "c++" ? "double" : "f64";
      case "boolean":
        return language === "c++" ? "bool" : "bool";
      case "int64":
        return language === "c++" ? "int64_t" : "i64";
      case "uint64":
        return language === "c++" ? "uint64_t" : "u64";
      case "string":
        return language === "c++" ? "const char*" : "*const std::ffi::c_char";
      case "enum":
        return language === "c++" ? "int32_t" : "i32";
      case "date":
        return language === "c++" ? "double" : "f64";
      case "error":
        return language === "c++" ? "const char*" : "*const std::ffi::c_char";
      case "hybrid-object":
      case "array-buffer":
      case "array":
      case "optional":
      case "record":
      case "struct":
      case "variant":
      case "tuple":
      case "function":
      case "promise":
      case "map":
        return language === "c++" ? "void*" : "*mut std::ffi::c_void";
      default:
        return this.type.getCode(language);
    }
  }

  /**
   * Generates code to convert a value from one language to the other at the FFI boundary.
   */
  parse(
    parameterName: string,
    from: "c++" | "rust",
    to: "rust" | "c++",
    inLanguage: "rust" | "c++",
  ): string {
    if (from === "c++" && to === "rust") {
      return this.parseFromCppToRust(parameterName, inLanguage);
    } else if (from === "rust" && to === "c++") {
      return this.parseFromRustToCpp(parameterName, inLanguage);
    } else {
      throw new Error(`Cannot parse from ${from} to ${to}!`);
    }
  }

  /**
   * Convert a value from C++ representation to Rust representation.
   */
  parseFromCppToRust(
    parameterName: string,
    inLanguage: "rust" | "c++",
  ): string {
    switch (this.type.kind) {
      case "string":
        switch (inLanguage) {
          case "rust":
            return `std::ffi::CStr::from_ptr(${parameterName}).to_string_lossy().into_owned()`;
          case "c++":
            return `${parameterName}.c_str()`;
          default:
            return parameterName;
        }
      case "enum": {
        const enumType = getTypeAs(this.type, EnumType);
        const qualifiedEnumName = this.getQualifiedRustName();
        switch (inLanguage) {
          case "rust":
            // Panic on invalid discriminant — catch_unwind in the FFI shim will
            // catch this and propagate the error to C++ as a result struct.
            return `${qualifiedEnumName}::from_i32(${parameterName}).unwrap_or_else(|| { panic!("[Nitro] Invalid ${enumType.enumName} discriminant: {}", ${parameterName}) })`;
          case "c++":
            return `static_cast<int32_t>(${parameterName})`;
          default:
            return parameterName;
        }
      }
      case "date":
        switch (inLanguage) {
          case "c++":
            return `std::chrono::duration<double, std::milli>(${parameterName}.time_since_epoch()).count()`;
          case "rust":
            return parameterName;
          default:
            return parameterName;
        }
      case "error":
        switch (inLanguage) {
          case "rust":
            return `std::ffi::CStr::from_ptr(${parameterName}).to_string_lossy().into_owned()`;
          case "c++":
            return `[&]() -> const char* { try { std::rethrow_exception(${parameterName}); } catch (const std::exception& e) { return e.what(); } catch (...) { return "unknown error"; } }()`;
          default:
            return parameterName;
        }
      case "array": {
        const arrType = getTypeAs(this.type, ArrayType);
        const elemBridged = new RustCxxBridgedType(arrType.itemType);
        const elemFfiRust = elemBridged.getTypeCode("rust");
        const elemFfiCpp = elemBridged.getTypeCode("c++");
        switch (inLanguage) {
          case "rust": {
            // Deserialize C array struct into Vec<T>
            const elemConvert = elemBridged.needsSpecialHandling
              ? elemBridged.parseFromCppToRust("__elem", "rust")
              : "__elem";
            return (
              `{ #[repr(C)] struct __Array { data: *mut ${elemFfiRust}, len: usize } ` +
              `let __arr = Box::from_raw(${parameterName} as *mut __Array); ` +
              `let __v = Vec::from_raw_parts(__arr.data, __arr.len, __arr.len); ` +
              `__v.into_iter().map(|__elem| ${elemConvert}).collect::<Vec<_>>() }`
            );
          }
          case "c++": {
            // Serialize std::vector into C array struct.
            const aId = nextCppId();
            const elemConvert = elemBridged.needsSpecialHandling
              ? elemBridged.parseFromCppToRust(`${parameterName}[__i_${aId}]`, "c++")
              : `static_cast<${elemFfiCpp}>(${parameterName}[__i_${aId}])`;
            return (
              `[&]() -> void* { ` +
              `struct __Array_${aId} { ${elemFfiCpp}* data; size_t len; }; ` +
              `auto __len_${aId} = ${parameterName}.size(); ` +
              `auto __data_${aId} = static_cast<${elemFfiCpp}*>(malloc(__len_${aId} * sizeof(${elemFfiCpp}))); ` +
              `for (size_t __i_${aId} = 0; __i_${aId} < __len_${aId}; __i_${aId}++) { __data_${aId}[__i_${aId}] = ${elemConvert}; } ` +
              `return static_cast<void*>(new __Array_${aId} { __data_${aId}, __len_${aId} }); }()`
            );
          }
          default:
            return parameterName;
        }
      }
      case "optional": {
        const optType = getTypeAs(this.type, OptionalType);
        const innerBridged = new RustCxxBridgedType(optType.wrappingType);
        const innerFfiRust = innerBridged.getTypeCode("rust");
        const innerFfiCpp = innerBridged.getTypeCode("c++");
        switch (inLanguage) {
          case "rust": {
            // Unbox the C struct and reconstruct Option<T>.
            // The struct layout: { has_value: u8, value: <ffi_type> }
            if (innerBridged.needsSpecialHandling) {
              const innerConvert = innerBridged.parseFromCppToRust("__s.value", "rust");
              return (
                `{ #[repr(C)] struct __Opt { has_value: u8, value: ${innerFfiRust} } ` +
                `let __s = *Box::from_raw(${parameterName} as *mut __Opt); ` +
                `if __s.has_value != 0 { Some(${innerConvert}) } else { None } }`
              );
            } else {
              return (
                `{ #[repr(C)] struct __Opt { has_value: u8, value: ${innerFfiRust} } ` +
                `let __s = *Box::from_raw(${parameterName} as *mut __Opt); ` +
                `if __s.has_value != 0 { Some(__s.value) } else { None } }`
              );
            }
          }
          case "c++": {
            // Convert std::optional<CppT> to C struct and box as void*.
            // Use unique variable names to avoid collisions with nested conversions.
            const optId = nextCppId();
            if (innerBridged.needsSpecialHandling) {
              const innerConvert = innerBridged.parseFromCppToRust(`__inner_${optId}`, "c++");
              return (
                `[&]() -> void* { ` +
                `struct __Opt_${optId} { uint8_t has_value; ${innerFfiCpp} value; }; ` +
                `auto __opt_${optId} = new __Opt_${optId}(); ` +
                `if (${parameterName}.has_value()) { const auto& __inner_${optId} = ${parameterName}.value(); __opt_${optId}->has_value = 1; __opt_${optId}->value = ${innerConvert}; } ` +
                `else { __opt_${optId}->has_value = 0; __opt_${optId}->value = {}; } ` +
                `return static_cast<void*>(__opt_${optId}); }()`
              );
            } else {
              return (
                `[&]() -> void* { ` +
                `struct __Opt_${optId} { uint8_t has_value; ${innerFfiCpp} value; }; ` +
                `auto __opt_${optId} = new __Opt_${optId}(); ` +
                `if (${parameterName}.has_value()) { __opt_${optId}->has_value = 1; __opt_${optId}->value = static_cast<${innerFfiCpp}>(${parameterName}.value()); } ` +
                `else { __opt_${optId}->has_value = 0; __opt_${optId}->value = {}; } ` +
                `return static_cast<void*>(__opt_${optId}); }()`
              );
            }
          }
          default:
            return parameterName;
        }
      }
      case "struct": {
        const structType = getTypeAs(this.type, StructType);
        switch (inLanguage) {
          case "rust": {
            // Deserialize C struct with FFI-compatible fields into Rust struct.
            // FFI struct uses escapedName (camelCase); Rust struct uses snake_case.
            // Use qualified path since nested struct types may not be imported.
            const fields = structType.properties.map((p) => {
              const b = new RustCxxBridgedType(p);
              return `${p.escapedName}: ${b.getTypeCode("rust")}`;
            });
            const reconstruct = structType.properties.map((p) => {
              const b = new RustCxxBridgedType(p);
              const rustFieldName = toSnakeCase(p.name);
              return b.needsSpecialHandling
                ? `${rustFieldName}: ${b.parseFromCppToRust(`__s.${p.escapedName}`, "rust")}`
                : `${rustFieldName}: __s.${p.escapedName}`;
            });
            return (
              `{ #[repr(C)] struct __Struct { ${fields.join(", ")} } ` +
              `let __s = *Box::from_raw(${parameterName} as *mut __Struct); ` +
              `${this.getQualifiedRustName()} { ${reconstruct.join(", ")} } }`
            );
          }
          case "c++": {
            // Serialize C++ struct into C struct with FFI-compatible fields.
            // Use unique IDs to avoid name collisions with nested conversions.
            const sId = nextCppId();
            const fields = structType.properties.map((p) => {
              const b = new RustCxxBridgedType(p);
              return `${b.getTypeCode("c++")} ${p.escapedName};`;
            });
            const extracts = structType.properties.map((p, i) => {
              return `const auto& __f${sId}_${i} = ${parameterName}.${p.escapedName};`;
            });
            const assigns = structType.properties.map((p, i) => {
              const b = new RustCxxBridgedType(p);
              const val = b.needsSpecialHandling
                ? b.parseFromCppToRust(`__f${sId}_${i}`, "c++")
                : `__f${sId}_${i}`;
              return `__s_${sId}->${p.escapedName} = ${val};`;
            });
            return (
              `[&]() -> void* { ` +
              `struct __Struct_${sId} { ${fields.join(" ")} }; ` +
              `${extracts.join(" ")} ` +
              `auto __s_${sId} = new __Struct_${sId}(); ` +
              `${assigns.join(" ")} ` +
              `return static_cast<void*>(__s_${sId}); }()`
            );
          }
          default:
            return parameterName;
        }
      }
      case "variant": {
        const variantType = getTypeAs(this.type, VariantType);
        switch (inLanguage) {
          case "rust": {
            // Unbox the C tagged-union struct and reconstruct the Rust enum.
            // The struct layout: { index: i32, value: *mut c_void }
            // Inner values are always boxed through a pointer regardless of type.
            const rustEnumName = this.getQualifiedRustName();
            const matchArms = variantType.cases
              .map(([label, innerType], i) => {
                const caseName =
                  label.charAt(0).toUpperCase() + label.slice(1);
                const innerBridged = new RustCxxBridgedType(innerType);
                if (
                  innerType.kind === "void" ||
                  innerType.kind === "null"
                ) {
                  return `${i} => ${rustEnumName}::${caseName}(()),`;
                } else {
                  // Unbox the inner FFI value from the heap pointer
                  const innerFfiRust = innerBridged.getTypeCode("rust");
                  const unboxed = `*Box::from_raw(__var.value as *mut ${innerFfiRust})`;
                  if (innerBridged.needsSpecialHandling) {
                    const innerConvert = innerBridged.parseFromCppToRust(
                      unboxed,
                      "rust",
                    );
                    return `${i} => ${rustEnumName}::${caseName}(${innerConvert}),`;
                  } else {
                    return `${i} => ${rustEnumName}::${caseName}(${unboxed}),`;
                  }
                }
              })
              .join(" ");
            return (
              `{ #[repr(C)] struct __Var { index: i32, value: *mut std::ffi::c_void } ` +
              `let __var = *Box::from_raw(${parameterName} as *mut __Var); ` +
              `match __var.index { ${matchArms} _ => panic!("[Nitro] Invalid variant index: {}", __var.index) } }`
            );
          }
          case "c++": {
            // Convert std::variant to a C tagged-union struct: { int32_t index; void* value; }
            // Inner values are always heap-allocated regardless of type.
            const vId = nextCppId();
            const visitBranches = variantType.cases
              .map(([_label, innerType], i) => {
                const innerBridged = new RustCxxBridgedType(innerType);
                const innerFfiCpp = innerBridged.getTypeCode("c++");
                if (
                  innerType.kind === "void" ||
                  innerType.kind === "null"
                ) {
                  return `if (${parameterName}.index() == ${i}) { __var_${vId}->index = ${i}; __var_${vId}->value = nullptr; }`;
                } else if (innerBridged.needsSpecialHandling) {
                  const innerConvert = innerBridged.parseFromCppToRust(
                    `std::get<${i}>(${parameterName})`,
                    "c++",
                  );
                  return `if (${parameterName}.index() == ${i}) { __var_${vId}->index = ${i}; __var_${vId}->value = static_cast<void*>(new ${innerFfiCpp}(${innerConvert})); }`;
                } else {
                  return `if (${parameterName}.index() == ${i}) { __var_${vId}->index = ${i}; __var_${vId}->value = static_cast<void*>(new ${innerFfiCpp}(std::get<${i}>(${parameterName}))); }`;
                }
              })
              .join(" else ");
            return (
              `[&]() -> void* { ` +
              `struct __Var_${vId} { int32_t index; void* value; }; ` +
              `auto __var_${vId} = new __Var_${vId}(); ` +
              `${visitBranches} ` +
              `return static_cast<void*>(__var_${vId}); }()`
            );
          }
          default:
            return parameterName;
        }
      }
      case "tuple": {
        const tupType = getTypeAs(this.type, TupleType);
        switch (inLanguage) {
          case "rust": {
            // Deserialize C struct with one field per tuple element
            const fields = tupType.itemTypes.map((t, i) => {
              const b = new RustCxxBridgedType(t);
              return `f${i}: ${b.getTypeCode("rust")}`;
            });
            const reconstruct = tupType.itemTypes.map((t, i) => {
              const b = new RustCxxBridgedType(t);
              return b.needsSpecialHandling
                ? b.parseFromCppToRust(`__tup.f${i}`, "rust")
                : `__tup.f${i}`;
            });
            return (
              `{ #[repr(C)] struct __Tuple { ${fields.join(", ")} } ` +
              `let __tup = *Box::from_raw(${parameterName} as *mut __Tuple); ` +
              `(${reconstruct.join(", ")}) }`
            );
          }
          case "c++": {
            // Serialize std::tuple into C struct
            const tId = nextCppId();
            const fields = tupType.itemTypes.map((t, i) => {
              const b = new RustCxxBridgedType(t);
              return `${b.getTypeCode("c++")} f${i};`;
            });
            const assigns = tupType.itemTypes.map((t, i) => {
              const b = new RustCxxBridgedType(t);
              const getter = `std::get<${i}>(${parameterName})`;
              const val = b.needsSpecialHandling
                ? b.parseFromCppToRust(getter, "c++")
                : getter;
              return `__tup_${tId}->f${i} = ${val};`;
            });
            return (
              `[&]() -> void* { ` +
              `struct __Tuple_${tId} { ${fields.join(" ")} }; ` +
              `auto __tup_${tId} = new __Tuple_${tId}(); ` +
              `${assigns.join(" ")} ` +
              `return static_cast<void*>(__tup_${tId}); }()`
            );
          }
          default:
            return parameterName;
        }
      }
      case "record": {
        const recType = getTypeAs(this.type, RecordType);
        const keyBridged = new RustCxxBridgedType(recType.keyType);
        const valBridged = new RustCxxBridgedType(recType.valueType);
        const keyFfiRust = keyBridged.getTypeCode("rust");
        const valFfiRust = valBridged.getTypeCode("rust");
        const keyFfiCpp = keyBridged.getTypeCode("c++");
        const valFfiCpp = valBridged.getTypeCode("c++");
        switch (inLanguage) {
          case "rust": {
            // Deserialize C array-of-pairs struct into HashMap
            const keyConvert = keyBridged.needsSpecialHandling
              ? keyBridged.parseFromCppToRust("__e.key", "rust")
              : "__e.key";
            const valConvert = valBridged.needsSpecialHandling
              ? valBridged.parseFromCppToRust("__e.val", "rust")
              : "__e.val";
            return (
              `{ #[repr(C)] struct __Entry { key: ${keyFfiRust}, val: ${valFfiRust} } ` +
              `#[repr(C)] struct __Record { data: *mut __Entry, len: usize } ` +
              `let __rec = Box::from_raw(${parameterName} as *mut __Record); ` +
              `let __v = Vec::from_raw_parts(__rec.data, __rec.len, __rec.len); ` +
              `let mut __map = std::collections::HashMap::with_capacity(__v.len()); ` +
              `for __e in __v { __map.insert(${keyConvert}, ${valConvert}); } ` +
              `__map }`
            );
          }
          case "c++": {
            // Serialize unordered_map into C array-of-pairs struct
            const rId = nextCppId();
            const keyConvert = keyBridged.needsSpecialHandling
              ? keyBridged.parseFromCppToRust(`__kv_${rId}.first`, "c++")
              : `static_cast<${keyFfiCpp}>(__kv_${rId}.first)`;
            const valConvert = valBridged.needsSpecialHandling
              ? valBridged.parseFromCppToRust(`__kv_${rId}.second`, "c++")
              : `static_cast<${valFfiCpp}>(__kv_${rId}.second)`;
            return (
              `[&]() -> void* { ` +
              `struct __Entry_${rId} { ${keyFfiCpp} key; ${valFfiCpp} val; }; ` +
              `struct __Record_${rId} { __Entry_${rId}* data; size_t len; }; ` +
              `auto __len_${rId} = ${parameterName}.size(); ` +
              `auto __data_${rId} = static_cast<__Entry_${rId}*>(malloc(__len_${rId} * sizeof(__Entry_${rId}))); ` +
              `size_t __i_${rId} = 0; ` +
              `for (const auto& __kv_${rId} : ${parameterName}) { __data_${rId}[__i_${rId}] = { ${keyConvert}, ${valConvert} }; __i_${rId}++; } ` +
              `return static_cast<void*>(new __Record_${rId} { __data_${rId}, __len_${rId} }); }()`
            );
          }
          default:
            return parameterName;
        }
      }
      case "function": {
        const funcType = getTypeAs(this.type, FunctionType);
        switch (inLanguage) {
          case "rust": {
            // Reconstruct Func_* wrapper from void pointer, then wrap in a closure
            // so the trait receives Box<dyn Fn(...)> as expected.
            const funcStructName = funcType.specializationName;
            const funcModuleName = toSnakeCase(funcStructName);
            const funcStructPath = `super::${funcModuleName}::${funcStructName}`;
            const rustParams = funcType.parameters.map(
              (p, i) => `__p${i}: ${p.getCode("rust")}`,
            );
            const callArgs = funcType.parameters.map((_p, i) => `__p${i}`);
            // For Promise-returning callbacks, call() returns Result<T, String>,
            // so the closure return type must match the trait's callback type.
            let returnSuffix: string;
            if (funcType.returnType.kind === "promise") {
              let innerType: Type = funcType.returnType;
              while (innerType.kind === "promise") {
                innerType = getTypeAs(innerType, PromiseType).resultingType;
              }
              const innerRustType = innerType.getCode("rust");
              returnSuffix =
                innerRustType === "()"
                  ? ` -> Result<(), String>`
                  : ` -> Result<${innerRustType}, String>`;
            } else {
              const rustReturnType = funcType.returnType.getCode("rust");
              returnSuffix =
                rustReturnType === "()" ? "" : ` -> ${rustReturnType}`;
            }
            return (
              `{ let __wrapper = Box::from_raw(${parameterName} as *mut ${funcStructPath}); ` +
              `let __cb: ${this.type.getCode("rust")} = Box::new(move |${rustParams.join(", ")}|${returnSuffix} { __wrapper.call(${callArgs.join(", ")}) }); ` +
              `__cb }`
            );
          }
          case "c++": {
            // Create a Func_* C struct on the heap: { fn_ptr, userdata, destroy_fn }
            // This matches the Rust #[repr(C)] Func_* layout exactly.
            // fn_ptr is a trampoline that casts userdata back to std::function and calls it.
            // destroy_fn frees the boxed std::function when Rust drops the Func_*.
            const cppFnType = this.type.getCode("c++");
            const returnBridged = new RustCxxBridgedType(funcType.returnType);
            const isPromiseReturn = funcType.returnType.kind === "promise";
            // For Promise returns, use the innermost type's FFI representation
            // (the C++ trampoline awaits all Promise layers).
            let effectiveReturnType: Type = funcType.returnType;
            if (isPromiseReturn) {
              while (effectiveReturnType.kind === "promise") {
                effectiveReturnType = getTypeAs(
                  effectiveReturnType,
                  PromiseType,
                ).resultingType;
              }
            }
            const effectiveReturnBridged = new RustCxxBridgedType(
              effectiveReturnType,
            );

            // For Promise-returning callbacks, use a result struct as the FFI
            // return type so errors can be propagated instead of aborting.
            const ffiReturnType = isPromiseReturn
              ? effectiveReturnBridged.getCppFfiResultType()
              : effectiveReturnBridged.getCppFfiType();

            // Trampoline parameters (FFI-compatible types)
            const trampolineParams = funcType.parameters.map((p, i) => {
              const bridged = new RustCxxBridgedType(p);
              return `${bridged.getCppFfiType()} __a${i}`;
            });
            const fnPtrParamTypes = [
              "void*",
              ...funcType.parameters.map((p) => {
                const bridged = new RustCxxBridgedType(p);
                return bridged.getCppFfiType();
              }),
            ].join(", ");
            const trampolineSig = ["void* __ud", ...trampolineParams].join(
              ", ",
            );

            // Convert FFI args back to C++ types for calling the std::function
            const callArgs = funcType.parameters.map((p, i) => {
              const bridged = new RustCxxBridgedType(p);
              if (bridged.needsSpecialHandling) {
                return bridged.parseFromRustToCpp(`__a${i}`, "c++");
              }
              return `__a${i}`;
            });

            let trampolineBody: string;
            if (isPromiseReturn) {
              // Promise return: await all layers, return result struct.
              // Errors are propagated via the result struct instead of aborting.
              const resultStructType =
                effectiveReturnBridged.getCppFfiResultType();
              let innerType: Type = funcType.returnType;
              const awaitStmts: string[] = [];
              let prevVar = `__pr`;
              awaitStmts.push(
                `auto ${prevVar} = (*static_cast<${cppFnType}*>(__ud))(${callArgs.join(", ")});`,
              );
              let idx = 0;
              while (innerType.kind === "promise") {
                const pt = getTypeAs(innerType, PromiseType);
                innerType = pt.resultingType;
                if (innerType.kind === "void") {
                  awaitStmts.push(`${prevVar}->await().get();`);
                } else {
                  const nextVar = `__aw${idx++}`;
                  awaitStmts.push(
                    `auto ${nextVar} = ${prevVar}->await().get();`,
                  );
                  prevVar = nextVar;
                }
              }

              let successReturn: string;
              if (innerType.kind === "void") {
                successReturn = `${awaitStmts.join(" ")} return ${resultStructType} { 1, nullptr };`;
              } else if (effectiveReturnBridged.needsSpecialHandling) {
                const converted = effectiveReturnBridged.parseFromCppToRust(
                  prevVar,
                  "c++",
                );
                successReturn = `${awaitStmts.join(" ")} return ${resultStructType} { 1, nullptr, ${converted} };`;
              } else {
                successReturn = `${awaitStmts.join(" ")} return ${resultStructType} { 1, nullptr, ${prevVar} };`;
              }

              const zeroInit =
                innerType.kind === "void" ? "" : ", {}";
              trampolineBody =
                `try { ${successReturn} } ` +
                `catch (const std::exception& __e) { return ${resultStructType} { 0, __nitrogen_dup_cstring(__e.what())${zeroInit} }; } ` +
                `catch (...) { return ${resultStructType} { 0, __nitrogen_dup_cstring("unknown C++ exception in callback")${zeroInit} }; }`;
            } else {
              // Non-Promise return: wrap in try/catch to prevent C++ exceptions
              // from unwinding through Rust stack frames (which is UB).
              // Since non-Promise callbacks have no error channel, we must abort.
              let trampolineInner: string;
              if (funcType.returnType.kind === "void") {
                trampolineInner = `(*static_cast<${cppFnType}*>(__ud))(${callArgs.join(", ")});`;
              } else if (returnBridged.needsSpecialHandling) {
                const converted = returnBridged.parseFromCppToRust(
                  "__r",
                  "c++",
                );
                trampolineInner = `auto __r = (*static_cast<${cppFnType}*>(__ud))(${callArgs.join(", ")}); return ${converted};`;
              } else {
                trampolineInner = `return (*static_cast<${cppFnType}*>(__ud))(${callArgs.join(", ")});`;
              }
              trampolineBody =
                `try { ${trampolineInner} } ` +
                `catch (const std::exception& __e) { fprintf(stderr, "Unhandled C++ exception in callback: %s\\n", __e.what()); std::abort(); } ` +
                `catch (...) { fprintf(stderr, "Unhandled C++ exception in callback\\n"); std::abort(); }`;
            }

            const returnArrow =
              ffiReturnType === "void" ? "" : `-> ${ffiReturnType} `;
            return (
              `[&]() -> void* { ` +
              `struct __W { ${ffiReturnType}(*fn_ptr)(${fnPtrParamTypes}); void* userdata; void(*destroy_fn)(void*); }; ` +
              `return static_cast<void*>(new __W { ` +
              `[](${trampolineSig}) ${returnArrow}{ ${trampolineBody} }, ` +
              `static_cast<void*>(new ${cppFnType}(std::move(${parameterName}))), ` +
              `[](void* __ud) { delete static_cast<${cppFnType}*>(__ud); } ` +
              `}); }()`
            );
          }
          default:
            return parameterName;
        }
      }
      case "hybrid-object": {
        const hybridType = getTypeAs(this.type, HybridObjectType);
        const hybridName = getHybridObjectName(hybridType.hybridObjectName);
        const isRust = this.isRustImplementedHybridObject(hybridType);
        switch (inLanguage) {
          case "rust":
            if (isRust) {
              // Rust-implemented: the void* is _rustPtr pointing to a heap-allocated
              // Arc<dyn Trait>. Clone the Arc (non-owning read + refcount increment).
              return `std::sync::Arc::clone(&*(${parameterName} as *const ${this.type.getCode("rust")}))`;
            } else {
              // Non-Rust HybridObject: the void* points to a heap-allocated shared_ptr.
              // TODO: This needs a proper Rust wrapper around the C++ shared_ptr.
              return `*Box::from_raw(${parameterName} as *mut ${this.type.getCode("rust")})`;
            }
          case "c++":
            if (isRust) {
              // Rust-implemented: extract the _rustPtr from the C++ bridge wrapper
              // and pass it directly. Rust will Arc::clone it (non-owning).
              return `dynamic_cast<${hybridName.HybridTSpecRust}*>(${parameterName}.get())->rustPtr()`;
            } else {
              // Non-Rust HybridObject: clone the shared_ptr onto the heap.
              // TODO: Rust side needs a proper wrapper to use this.
              return `static_cast<void*>(new ${this.type.getCode("c++")}(${parameterName}))`;
            }
          default:
            return parameterName;
        }
      }
      case "promise":
        // Promise values are boxed as void* through FFI (same as other complex types).
        // Method-level Promise *parameters* are handled specially in RustHybridObject.ts
        // (awaited on C++ side before crossing FFI), but this generic conversion handles
        // Promises in all other contexts (callback returns, variant cases, etc.).
        switch (inLanguage) {
          case "rust":
            return `*Box::from_raw(${parameterName} as *mut ${this.type.getCode("rust")})`;
          case "c++":
            return `static_cast<void*>(new ${this.type.getCode("c++")}(std::move(${parameterName})))`;
          default:
            return parameterName;
        }
      case "array-buffer":
        switch (inLanguage) {
          case "rust":
            // Reconstruct NitroBuffer from void pointer
            return `*Box::from_raw(${parameterName} as *mut super::nitro_buffer::NitroBuffer)`;
          case "c++":
            // Create a NitroBuffer C struct on the heap with zero-copy access to the ArrayBuffer's data.
            // The handle holds a boxed shared_ptr<ArrayBuffer> to prevent deallocation.
            // The release_fn frees the boxed shared_ptr when Rust drops the NitroBuffer.
            return (
              `[&]() -> void* { ` +
              `struct __NB { uint8_t* data; size_t len; void* handle; void(*release_fn)(void*); }; ` +
              `auto __sp = new std::shared_ptr<ArrayBuffer>(std::move(${parameterName})); ` +
              `return static_cast<void*>(new __NB { ` +
              `(*__sp)->data(), (*__sp)->size(), ` +
              `static_cast<void*>(__sp), ` +
              `[](void* __h) { delete static_cast<std::shared_ptr<ArrayBuffer>*>(__h); } ` +
              `}); }()`
            );
          default:
            return parameterName;
        }
      case "map":
        switch (inLanguage) {
          case "rust":
            // Wrap the opaque void* in our AnyMap newtype
            return `AnyMap::from_raw(${parameterName})`;
          case "c++":
            return `static_cast<void*>(new ${this.type.getCode("c++")}(std::move(${parameterName})))`;
          default:
            return parameterName;
        }
      case "void":
      case "null":
        return "";
      default:
        return parameterName;
    }
  }

  /**
   * Convert a value from Rust representation to C++ representation.
   */
  parseFromRustToCpp(
    parameterName: string,
    inLanguage: "rust" | "c++",
  ): string {
    switch (this.type.kind) {
      case "string":
        switch (inLanguage) {
          case "rust":
            // Strip interior null bytes instead of panicking (which is UB across FFI).
            // CString::new fails on interior nulls, so we replace them first.
            return `{ let __s = ${parameterName}.replace('\\0', ""); std::ffi::CString::new(__s).unwrap_or_default().into_raw() }`;
          case "c++":
            // Copy the Rust-allocated CString into std::string, then free the original.
            return `([](const char* __p) -> std::string { std::string __s(__p); __nitrogen_free_cstring(const_cast<char*>(__p)); return __s; })(${parameterName})`;
          default:
            return parameterName;
        }
      case "enum":
        switch (inLanguage) {
          case "rust":
            return `${parameterName} as i32`;
          case "c++":
            return `static_cast<${this.type.getCode("c++")}>(${parameterName})`;
          default:
            return parameterName;
        }
      case "date":
        switch (inLanguage) {
          case "rust":
            return parameterName;
          case "c++":
            return `std::chrono::system_clock::time_point(std::chrono::duration_cast<std::chrono::system_clock::duration>(std::chrono::duration<double, std::milli>(${parameterName})))`;
          default:
            return parameterName;
        }
      case "error":
        switch (inLanguage) {
          case "rust":
            return `{ let __s = ${parameterName}.replace('\\0', ""); std::ffi::CString::new(__s).unwrap_or_default().into_raw() }`;
          case "c++":
            // Copy the Rust-allocated CString into exception, then free the original.
            return `([](const char* __p) -> std::exception_ptr { auto __e = std::make_exception_ptr(std::runtime_error(__p)); __nitrogen_free_cstring(const_cast<char*>(__p)); return __e; })(${parameterName})`;
          default:
            return parameterName;
        }
      case "optional": {
        const optType = getTypeAs(this.type, OptionalType);
        const innerBridged = new RustCxxBridgedType(optType.wrappingType);
        const innerFfiRust = innerBridged.getTypeCode("rust");
        const innerFfiCpp = innerBridged.getTypeCode("c++");
        switch (inLanguage) {
          case "rust": {
            // Convert Option<T> into a C-compatible tagged struct and box it.
            // The struct layout: { has_value: u8, value: <ffi_type> }
            // For types that need special handling (e.g. String → *const c_char),
            // we convert the inner value before writing it into the struct.
            if (innerBridged.needsSpecialHandling) {
              const innerConvert = innerBridged.parseFromRustToCpp("__v", "rust");
              return (
                `{ #[repr(C)] struct __Opt { has_value: u8, value: ${innerFfiRust} } ` +
                `let __opt: __Opt = match ${parameterName} { ` +
                `Some(__v) => __Opt { has_value: 1, value: ${innerConvert} }, ` +
                `None => __Opt { has_value: 0, value: std::mem::zeroed() /* SAFETY: value is never read when has_value=0; all FFI types are zero-safe */ } }; ` +
                `Box::into_raw(Box::new(__opt)) as *mut std::ffi::c_void }`
              );
            } else {
              return (
                `{ #[repr(C)] struct __Opt { has_value: u8, value: ${innerFfiRust} } ` +
                `let __opt: __Opt = match ${parameterName} { ` +
                `Some(__v) => __Opt { has_value: 1, value: __v }, ` +
                `None => __Opt { has_value: 0, value: std::mem::zeroed() /* SAFETY: value is never read when has_value=0; all FFI types are zero-safe */ } }; ` +
                `Box::into_raw(Box::new(__opt)) as *mut std::ffi::c_void }`
              );
            }
          }
          case "c++": {
            // Unbox the C struct and reconstruct std::optional<CppType>.
            const optId2 = nextCppId();
            const cppInnerType = optType.wrappingType.getCode("c++");
            if (innerBridged.needsSpecialHandling) {
              const innerConvert = innerBridged.parseFromRustToCpp(`__o_${optId2}->value`, "c++");
              return (
                `[&]() -> ${this.type.getCode("c++")} { ` +
                `struct __Opt_${optId2} { uint8_t has_value; ${innerFfiCpp} value; }; ` +
                `auto __o_${optId2} = static_cast<__Opt_${optId2}*>(${parameterName}); ` +
                `${this.type.getCode("c++")} __r_${optId2}; ` +
                `if (__o_${optId2}->has_value) { __r_${optId2} = ${innerConvert}; } ` +
                `delete __o_${optId2}; return __r_${optId2}; }()`
              );
            } else {
              return (
                `[&]() -> ${this.type.getCode("c++")} { ` +
                `struct __Opt_${optId2} { uint8_t has_value; ${innerFfiCpp} value; }; ` +
                `auto __o_${optId2} = static_cast<__Opt_${optId2}*>(${parameterName}); ` +
                `${this.type.getCode("c++")} __r_${optId2}; ` +
                `if (__o_${optId2}->has_value) { __r_${optId2} = static_cast<${cppInnerType}>(__o_${optId2}->value); } ` +
                `delete __o_${optId2}; return __r_${optId2}; }()`
              );
            }
          }
          default:
            return parameterName;
        }
      }
      case "array": {
        const arrType = getTypeAs(this.type, ArrayType);
        const elemBridged = new RustCxxBridgedType(arrType.itemType);
        const elemFfiRust = elemBridged.getTypeCode("rust");
        const elemFfiCpp = elemBridged.getTypeCode("c++");
        switch (inLanguage) {
          case "rust": {
            // Serialize Vec<T> into C array struct
            const elemConvert = elemBridged.needsSpecialHandling
              ? elemBridged.parseFromRustToCpp("__e", "rust")
              : "__e";
            return (
              `{ #[repr(C)] struct __Array { data: *mut ${elemFfiRust}, len: usize } ` +
              `let mut __items: Vec<_> = ${parameterName}.into_iter().map(|__e| ${elemConvert}).collect(); ` +
              `let __len = __items.len(); ` +
              `let __data = if __items.is_empty() { std::ptr::null_mut() } else { __items.as_mut_ptr() as *mut ${elemFfiRust} }; ` +
              `std::mem::forget(__items); ` +
              `Box::into_raw(Box::new(__Array { data: __data, len: __len })) as *mut std::ffi::c_void }`
            );
          }
          case "c++": {
            // Deserialize C array struct into std::vector
            const aId2 = nextCppId();
            const cppElemType = arrType.itemType.getCode("c++");
            const elemConvert = elemBridged.needsSpecialHandling
              ? elemBridged.parseFromRustToCpp(`__arr_${aId2}->data[__i_${aId2}]`, "c++")
              : `static_cast<${cppElemType}>(__arr_${aId2}->data[__i_${aId2}])`;
            return (
              `[&]() -> ${this.type.getCode("c++")} { ` +
              `struct __Array_${aId2} { ${elemFfiCpp}* data; size_t len; }; ` +
              `auto __arr_${aId2} = static_cast<__Array_${aId2}*>(${parameterName}); ` +
              `${this.type.getCode("c++")} __result_${aId2}; ` +
              `__result_${aId2}.reserve(__arr_${aId2}->len); ` +
              `for (size_t __i_${aId2} = 0; __i_${aId2} < __arr_${aId2}->len; __i_${aId2}++) { __result_${aId2}.push_back(${elemConvert}); } ` +
              `free(__arr_${aId2}->data); ` +
              `delete __arr_${aId2}; return __result_${aId2}; }()`
            );
          }
          default:
            return parameterName;
        }
      }
      case "record": {
        const recType = getTypeAs(this.type, RecordType);
        const keyBridged = new RustCxxBridgedType(recType.keyType);
        const valBridged = new RustCxxBridgedType(recType.valueType);
        const keyFfiRust = keyBridged.getTypeCode("rust");
        const valFfiRust = valBridged.getTypeCode("rust");
        const keyFfiCpp = keyBridged.getTypeCode("c++");
        const valFfiCpp = valBridged.getTypeCode("c++");
        switch (inLanguage) {
          case "rust": {
            // Serialize HashMap into C array-of-pairs struct
            const keyConvert = keyBridged.needsSpecialHandling
              ? keyBridged.parseFromRustToCpp("__k", "rust")
              : "__k";
            const valConvert = valBridged.needsSpecialHandling
              ? valBridged.parseFromRustToCpp("__v", "rust")
              : "__v";
            return (
              `{ #[repr(C)] struct __Entry { key: ${keyFfiRust}, val: ${valFfiRust} } ` +
              `#[repr(C)] struct __Record { data: *mut __Entry, len: usize } ` +
              `let mut __items: Vec<__Entry> = ${parameterName}.into_iter().map(|(__k, __v)| __Entry { key: ${keyConvert}, val: ${valConvert} }).collect(); ` +
              `let __len = __items.len(); ` +
              `let __data = if __items.is_empty() { std::ptr::null_mut() } else { __items.as_mut_ptr() }; ` +
              `std::mem::forget(__items); ` +
              `Box::into_raw(Box::new(__Record { data: __data, len: __len })) as *mut std::ffi::c_void }`
            );
          }
          case "c++": {
            // Deserialize C array-of-pairs struct into unordered_map
            const rId2 = nextCppId();
            const cppKeyType = recType.keyType.getCode("c++");
            const cppValType = recType.valueType.getCode("c++");
            const keyConvert = keyBridged.needsSpecialHandling
              ? keyBridged.parseFromRustToCpp(`__rec_${rId2}->data[__i_${rId2}].key`, "c++")
              : `static_cast<${cppKeyType}>(__rec_${rId2}->data[__i_${rId2}].key)`;
            const valConvert = valBridged.needsSpecialHandling
              ? valBridged.parseFromRustToCpp(`__rec_${rId2}->data[__i_${rId2}].val`, "c++")
              : `static_cast<${cppValType}>(__rec_${rId2}->data[__i_${rId2}].val)`;
            return (
              `[&]() -> ${this.type.getCode("c++")} { ` +
              `struct __Entry_${rId2} { ${keyFfiCpp} key; ${valFfiCpp} val; }; ` +
              `struct __Record_${rId2} { __Entry_${rId2}* data; size_t len; }; ` +
              `auto __rec_${rId2} = static_cast<__Record_${rId2}*>(${parameterName}); ` +
              `${this.type.getCode("c++")} __result_${rId2}; ` +
              `__result_${rId2}.reserve(__rec_${rId2}->len); ` +
              `for (size_t __i_${rId2} = 0; __i_${rId2} < __rec_${rId2}->len; __i_${rId2}++) { __result_${rId2}.emplace(${keyConvert}, ${valConvert}); } ` +
              `free(__rec_${rId2}->data); ` +
              `delete __rec_${rId2}; return __result_${rId2}; }()`
            );
          }
          default:
            return parameterName;
        }
      }
      case "tuple": {
        const tupType = getTypeAs(this.type, TupleType);
        switch (inLanguage) {
          case "rust": {
            // Serialize Rust tuple into C struct
            const fields = tupType.itemTypes.map((t, i) => {
              const b = new RustCxxBridgedType(t);
              return `f${i}: ${b.getTypeCode("rust")}`;
            });
            const assigns = tupType.itemTypes.map((t, i) => {
              const b = new RustCxxBridgedType(t);
              const val = b.needsSpecialHandling
                ? b.parseFromRustToCpp(`${parameterName}.${i}`, "rust")
                : `${parameterName}.${i}`;
              return `f${i}: ${val}`;
            });
            return (
              `{ #[repr(C)] struct __Tuple { ${fields.join(", ")} } ` +
              `Box::into_raw(Box::new(__Tuple { ${assigns.join(", ")} })) as *mut std::ffi::c_void }`
            );
          }
          case "c++": {
            // Deserialize C struct into std::tuple
            const tId2 = nextCppId();
            const cppFields = tupType.itemTypes.map((t, i) => {
              const b = new RustCxxBridgedType(t);
              return `${b.getTypeCode("c++")} f${i};`;
            });
            const elems = tupType.itemTypes.map((t, i) => {
              const b = new RustCxxBridgedType(t);
              const cppElemType = t.getCode("c++");
              return b.needsSpecialHandling
                ? b.parseFromRustToCpp(`__tup_${tId2}->f${i}`, "c++")
                : `static_cast<${cppElemType}>(__tup_${tId2}->f${i})`;
            });
            return (
              `[&]() -> ${this.type.getCode("c++")} { ` +
              `struct __Tuple_${tId2} { ${cppFields.join(" ")} }; ` +
              `auto __tup_${tId2} = static_cast<__Tuple_${tId2}*>(${parameterName}); ` +
              `auto __result_${tId2} = ${this.type.getCode("c++")}(${elems.join(", ")}); ` +
              `delete __tup_${tId2}; return __result_${tId2}; }()`
            );
          }
          default:
            return parameterName;
        }
      }
      case "promise":
        switch (inLanguage) {
          case "rust":
            // Box the value and leak it as a void pointer
            return `Box::into_raw(Box::new(${parameterName})) as *mut std::ffi::c_void`;
          case "c++":
            // Unbox: cast void* back to the C++ type and move out
            return `std::move(*static_cast<${this.type.getCode("c++")}*>(${parameterName}))`;
          default:
            return parameterName;
        }
      case "map":
        switch (inLanguage) {
          case "rust":
            // Extract the raw pointer from the AnyMap wrapper
            return `${parameterName}.as_raw()`;
          case "c++":
            // Unbox: cast void* back to the C++ type and move out
            return `std::move(*static_cast<${this.type.getCode("c++")}*>(${parameterName}))`;
          default:
            return parameterName;
        }
      case "struct": {
        const structType = getTypeAs(this.type, StructType);
        switch (inLanguage) {
          case "rust": {
            // Serialize Rust struct into C struct with FFI-compatible fields.
            // FFI struct uses escapedName (camelCase); Rust struct uses snake_case.
            const fields = structType.properties.map((p) => {
              const b = new RustCxxBridgedType(p);
              return `${p.escapedName}: ${b.getTypeCode("rust")}`;
            });
            const assigns = structType.properties.map((p) => {
              const b = new RustCxxBridgedType(p);
              const rustFieldName = toSnakeCase(p.name);
              const val = b.needsSpecialHandling
                ? b.parseFromRustToCpp(`${parameterName}.${rustFieldName}`, "rust")
                : `${parameterName}.${rustFieldName}`;
              return `${p.escapedName}: ${val}`;
            });
            return (
              `{ #[repr(C)] struct __Struct { ${fields.join(", ")} } ` +
              `Box::into_raw(Box::new(__Struct { ${assigns.join(", ")} })) as *mut std::ffi::c_void }`
            );
          }
          case "c++": {
            // Deserialize C struct with FFI-compatible fields into C++ struct.
            const sId2 = nextCppId();
            const cppFields = structType.properties.map((p) => {
              const b = new RustCxxBridgedType(p);
              return `${b.getTypeCode("c++")} ${p.escapedName};`;
            });
            const extracts = structType.properties.map((p, i) => {
              return `auto __f${sId2}_${i} = __s_${sId2}->${p.escapedName};`;
            });
            const elems = structType.properties.map((p, i) => {
              const b = new RustCxxBridgedType(p);
              const cppFieldType = p.getCode("c++");
              return b.needsSpecialHandling
                ? b.parseFromRustToCpp(`__f${sId2}_${i}`, "c++")
                : `static_cast<${cppFieldType}>(__f${sId2}_${i})`;
            });
            return (
              `[&]() -> ${this.type.getCode("c++")} { ` +
              `struct __Struct_${sId2} { ${cppFields.join(" ")} }; ` +
              `auto __s_${sId2} = static_cast<__Struct_${sId2}*>(${parameterName}); ` +
              `${extracts.join(" ")} ` +
              `delete __s_${sId2}; ` +
              `return ${this.type.getCode("c++")}(${elems.join(", ")}); }()`
            );
          }
          default:
            return parameterName;
        }
      }
      case "variant": {
        const variantType = getTypeAs(this.type, VariantType);
        switch (inLanguage) {
          case "rust": {
            // Convert Rust enum to C tagged-union struct: { index: i32, value: *mut c_void }
            // Inner values are always boxed through a pointer regardless of type.
            const rustEnumName = this.getQualifiedRustName();
            const matchArms = variantType.cases
              .map(([label, innerType], i) => {
                const caseName =
                  label.charAt(0).toUpperCase() + label.slice(1);
                const innerBridged = new RustCxxBridgedType(innerType);
                if (
                  innerType.kind === "void" ||
                  innerType.kind === "null"
                ) {
                  return `${rustEnumName}::${caseName}(_) => __Var { index: ${i}, value: std::ptr::null_mut() },`;
                } else {
                  // Convert the Rust value to FFI type, then box it
                  const innerFfiRust = innerBridged.getTypeCode("rust");
                  if (innerBridged.needsSpecialHandling) {
                    const innerConvert = innerBridged.parseFromRustToCpp(
                      "__v",
                      "rust",
                    );
                    return `${rustEnumName}::${caseName}(__v) => { let __ffi: ${innerFfiRust} = ${innerConvert}; __Var { index: ${i}, value: Box::into_raw(Box::new(__ffi)) as *mut std::ffi::c_void } },`;
                  } else {
                    return `${rustEnumName}::${caseName}(__v) => __Var { index: ${i}, value: Box::into_raw(Box::new(__v)) as *mut std::ffi::c_void },`;
                  }
                }
              })
              .join(" ");
            return (
              `{ #[repr(C)] struct __Var { index: i32, value: *mut std::ffi::c_void } ` +
              `let __var: __Var = match ${parameterName} { ${matchArms} }; ` +
              `Box::into_raw(Box::new(__var)) as *mut std::ffi::c_void }`
            );
          }
          case "c++": {
            // Unbox the C tagged-union struct and reconstruct std::variant.
            const vId2 = nextCppId();
            const cppType = this.type.getCode("c++");
            const branches = variantType.cases
              .map(([_label, innerType], i) => {
                const innerBridged = new RustCxxBridgedType(innerType);
                const innerFfiCpp = innerBridged.getTypeCode("c++");
                const cppInnerType = innerType.getCode("c++");
                if (
                  innerType.kind === "void" ||
                  innerType.kind === "null"
                ) {
                  return `if (__var_${vId2}->index == ${i}) { __r_${vId2} = ${cppInnerType}(); }`;
                } else if (innerBridged.needsSpecialHandling) {
                  const unboxed = `*static_cast<${innerFfiCpp}*>(__var_${vId2}->value)`;
                  const innerConvert = innerBridged.parseFromRustToCpp(
                    unboxed,
                    "c++",
                  );
                  return `if (__var_${vId2}->index == ${i}) { __r_${vId2} = ${cppType}(std::in_place_index<${i}>, ${innerConvert}); delete static_cast<${innerFfiCpp}*>(__var_${vId2}->value); }`;
                } else {
                  return `if (__var_${vId2}->index == ${i}) { __r_${vId2} = ${cppType}(std::in_place_index<${i}>, *static_cast<${innerFfiCpp}*>(__var_${vId2}->value)); delete static_cast<${innerFfiCpp}*>(__var_${vId2}->value); }`;
                }
              })
              .join(" else ");
            return (
              `[&]() -> ${cppType} { ` +
              `struct __Var_${vId2} { int32_t index; void* value; }; ` +
              `auto __var_${vId2} = static_cast<__Var_${vId2}*>(${parameterName}); ` +
              `${cppType} __r_${vId2}; ` +
              `${branches} ` +
              `delete __var_${vId2}; return __r_${vId2}; }()`
            );
          }
          default:
            return parameterName;
        }
      }
      case "function": {
        const funcType2 = getTypeAs(this.type, FunctionType);
        switch (inLanguage) {
          case "rust": {
            // Wrap Box<dyn Fn(...)> in a Func_* C struct so C++ can call it
            // through a fn_ptr/userdata/destroy_fn triple — the same layout that
            // parseFromCppToRust uses when passing callbacks in the other direction.
            const funcStructName2 = funcType2.specializationName;
            const funcModuleName2 = toSnakeCase(funcStructName2);
            const funcStructPath2 = `super::${funcModuleName2}::${funcStructName2}`;
            const rustFnType2 = this.type.getCode("rust");
            const returnBridged2 = new RustCxxBridgedType(funcType2.returnType);
            const ffiReturnTypeRust2 = returnBridged2.getTypeCode("rust");
            const hasReturn2 = ffiReturnTypeRust2 !== "()";

            // Trampoline signature uses FFI types (matching the Func_* fn_ptr type)
            const trampolineParams2 = funcType2.parameters.map((p, i) => {
              const b = new RustCxxBridgedType(p);
              return `__a${i}: ${b.getTypeCode("rust")}`;
            });
            const trampolineSig2 = [
              "__ud: *mut std::ffi::c_void",
              ...trampolineParams2,
            ].join(", ");

            // Convert FFI args to Rust args inside the trampoline
            const argConversions2 = funcType2.parameters.map((p, i) => {
              const b = new RustCxxBridgedType(p);
              if (b.needsSpecialHandling) {
                return b.parseFromCppToRust(`__a${i}`, "rust");
              }
              return `__a${i}`;
            });

            const returnArrowRust2 = hasReturn2
              ? ` -> ${ffiReturnTypeRust2}`
              : "";
            let callExpr2: string;
            if (hasReturn2) {
              const resultConvert2 = returnBridged2.needsSpecialHandling
                ? returnBridged2.parseFromRustToCpp("__result", "rust")
                : "__result";
              callExpr2 =
                `let __result = unsafe { __f(${argConversions2.join(", ")}) }; ` +
                `${resultConvert2}`;
            } else {
              callExpr2 = `unsafe { __f(${argConversions2.join(", ")}) };`;
            }

            // Use a unique numeric suffix to avoid name collisions when multiple
            // callbacks are converted in the same Rust function scope.
            const uid2 = nextCppId();
            return (
              `{ ` +
              `unsafe extern "C" fn __trampoline_${uid2}(${trampolineSig2})${returnArrowRust2} { ` +
              `let __f = unsafe { &*(__ud as *mut ${rustFnType2}) }; ` +
              `${callExpr2} ` +
              `} ` +
              `unsafe extern "C" fn __destroy_${uid2}(__ud: *mut std::ffi::c_void) { ` +
              `unsafe { let _ = Box::from_raw(__ud as *mut ${rustFnType2}); } ` +
              `} ` +
              `let __wrapper = ${funcStructPath2}::new(__trampoline_${uid2}, Box::into_raw(Box::new(${parameterName})) as *mut std::ffi::c_void, __destroy_${uid2}); ` +
              `Box::into_raw(Box::new(__wrapper)) as *mut std::ffi::c_void }`
            );
          }
          case "c++": {
            // Reconstruct std::function from the Func_* struct received from Rust.
            // The Func_* has layout: { fn_ptr, userdata, destroy_fn }.
            // We capture it in a shared_ptr so destroy_fn is called exactly once
            // when the last copy of the std::function is destroyed.
            const cppFnType2 = this.type.getCode("c++");
            const returnBridged2cpp = new RustCxxBridgedType(funcType2.returnType);
            const ffiReturnTypeCpp2 = returnBridged2cpp.getCppFfiType();
            const hasReturn2cpp = ffiReturnTypeCpp2 !== "void";

            const ffiParamTypes2 = funcType2.parameters.map((p) => {
              const b = new RustCxxBridgedType(p);
              return b.getCppFfiType();
            });
            const fnPtrSig2 = ["void*", ...ffiParamTypes2].join(", ");

            // C++ lambda parameters (native C++ types)
            const cppParams2 = funcType2.parameters.map((p, i) => {
              if (p.canBePassedByReference) {
                return `const ${p.getCode("c++")}& __a${i}`;
              }
              return `${p.getCode("c++")} __a${i}`;
            });

            // Convert C++ args to FFI args when calling fn_ptr
            const ffiCallArgs2 = funcType2.parameters.map((p, i) => {
              const b = new RustCxxBridgedType(p);
              if (b.needsSpecialHandling) {
                return b.parseFromCppToRust(`__a${i}`, "c++");
              }
              return `__a${i}`;
            });

            const ffiCallArgStr2 =
              ffiCallArgs2.length > 0
                ? `, ${ffiCallArgs2.join(", ")}`
                : "";
            let lambdaBody2: string;
            if (hasReturn2cpp) {
              const ffiResultConvert2 = returnBridged2cpp.needsSpecialHandling
                ? returnBridged2cpp.parseFromRustToCpp("__ffi_result", "c++")
                : "__ffi_result";
              lambdaBody2 =
                `auto __ffi_result = __shared_w->fn_ptr(__shared_w->userdata${ffiCallArgStr2}); ` +
                `return ${ffiResultConvert2};`;
            } else {
              lambdaBody2 = `__shared_w->fn_ptr(__shared_w->userdata${ffiCallArgStr2});`;
            }

            return (
              `[&]() -> ${cppFnType2} { ` +
              `struct __W { ${ffiReturnTypeCpp2}(*fn_ptr)(${fnPtrSig2}); void* userdata; void(*destroy_fn)(void*); }; ` +
              `auto __shared_w = std::shared_ptr<__W>(static_cast<__W*>(${parameterName}), [](__W* __pw) { __pw->destroy_fn(__pw->userdata); delete __pw; }); ` +
              `return ${cppFnType2}([__shared_w](${cppParams2.join(", ")}) { ${lambdaBody2} }); ` +
              `}()`
            );
          }
          default:
            return parameterName;
        }
      }
      case "hybrid-object": {
        const hybridType = getTypeAs(this.type, HybridObjectType);
        const hybridName = getHybridObjectName(hybridType.hybridObjectName);
        const isRust = this.isRustImplementedHybridObject(hybridType);
        switch (inLanguage) {
          case "rust":
            // Heap-allocate the Arc<dyn Trait> and leak it as a void pointer.
            return `Box::into_raw(Box::new(${parameterName})) as *mut std::ffi::c_void`;
          case "c++":
            if (isRust) {
              // Rust-implemented: wrap the void* (pointing to a heap-allocated
              // Arc<dyn Trait>) in the C++ Rust bridge class.
              return `std::make_shared<${hybridName.HybridTSpecRust}>(${parameterName})`;
            } else {
              // Non-Rust HybridObject: the void* points to a heap-allocated shared_ptr
              // that was boxed when passing C++ → Rust. Unwrap it back.
              const cppType = this.type.getCode("c++");
              return `([](void* __p) -> ${cppType} { auto __sp = static_cast<${cppType}*>(__p); auto __r = std::move(*__sp); delete __sp; return __r; })(${parameterName})`;
            }
          default:
            return parameterName;
        }
      }
      case "array-buffer":
        switch (inLanguage) {
          case "rust":
            // Box the NitroBuffer and leak as void pointer for C++ to unbox
            return `Box::into_raw(Box::new(${parameterName})) as *mut std::ffi::c_void`;
          case "c++":
            // Unbox NitroBuffer from void*, read data/len, and create an ArrayBuffer wrapping that memory.
            // Ownership of the NitroBuffer is transferred to the ArrayBuffer's destructor.
            return (
              `[&]() -> std::shared_ptr<ArrayBuffer> { ` +
              `struct __NB { uint8_t* data; size_t len; void* handle; void(*release_fn)(void*); }; ` +
              `auto __nb = static_cast<__NB*>(${parameterName}); ` +
              `auto __data = __nb->data; auto __len = __nb->len; ` +
              `auto __handle = __nb->handle; auto __release = __nb->release_fn; ` +
              `delete __nb; ` +
              `return ArrayBuffer::wrap(__data, __len, [=]() { __release(__handle); }); ` +
              `}()`
            );
          default:
            return parameterName;
        }
      case "void":
      case "null":
        return "";
      default:
        return parameterName;
    }
  }

  /**
   * Returns the Rust FFI type that crosses the extern "C" boundary.
   */
  getRustFfiType(): string {
    return this.getTypeCode("rust");
  }

  /**
   * Returns the C++ FFI type that crosses the extern "C" boundary.
   */
  getCppFfiType(): string {
    return this.getTypeCode("c++");
  }

  /**
   * Returns the Rust `__FfiResult_*` type name for this type's FFI representation.
   */
  getRustFfiResultType(): string {
    const ffiType = this.getRustFfiType();
    switch (ffiType) {
      case "()":
        return "__FfiResult_void";
      case "f64":
        return "__FfiResult_f64";
      case "bool":
        return "__FfiResult_bool";
      case "i32":
        return "__FfiResult_i32";
      case "i64":
        return "__FfiResult_i64";
      case "u64":
        return "__FfiResult_u64";
      case "usize":
        return "__FfiResult_usize";
      case "*const std::ffi::c_char":
        return "__FfiResult_cstr";
      case "*mut std::ffi::c_void":
        return "__FfiResult_ptr";
      default:
        return "__FfiResult_ptr";
    }
  }

  /**
   * Returns the C++ FFI result struct name for this type's FFI representation.
   */
  getCppFfiResultType(): string {
    const ffiType = this.getRustFfiType();
    switch (ffiType) {
      case "()":
        return "__FfiResult_void";
      case "f64":
        return "__FfiResult_f64";
      case "bool":
        return "__FfiResult_bool";
      case "i32":
        return "__FfiResult_i32";
      case "i64":
        return "__FfiResult_i64";
      case "u64":
        return "__FfiResult_u64";
      case "usize":
        return "__FfiResult_usize";
      case "*const std::ffi::c_char":
        return "__FfiResult_cstr";
      case "*mut std::ffi::c_void":
        return "__FfiResult_ptr";
      default:
        return "__FfiResult_ptr";
    }
  }

  /**
   * Check if a HybridObject type has a Rust implementation in the autolinking config.
   */
  private isRustImplementedHybridObject(hybridType: HybridObjectType): boolean {
    const autolinked = NitroConfig.current.getAutolinkedHybridObjects();
    return autolinked[hybridType.hybridObjectName]?.rust != null;
  }

  /**
   * Returns the fully qualified Rust path for types that define their own modules.
   * This is needed because nested types (e.g. struct fields' types) may not be
   * individually imported in the file where the bridge code is generated.
   */
  getQualifiedRustName(): string {
    const name = this.type.getCode("rust");
    switch (this.type.kind) {
      case "struct":
      case "variant":
      case "enum":
        return `super::${toSnakeCase(name)}::${name}`;
      default:
        return name;
    }
  }
}
