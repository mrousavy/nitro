import type { Language } from "../../getPlatformSpecs.js";
import type { BridgedType } from "../BridgedType.js";
import { getReferencedTypes } from "../getReferencedTypes.js";
import type { SourceFile, SourceImport } from "../SourceFile.js";
import { EnumType } from "../types/EnumType.js";
import { FunctionType } from "../types/FunctionType.js";
import { getTypeAs } from "../types/getTypeAs.js";
import { OptionalType } from "../types/OptionalType.js";
import { StructType } from "../types/StructType.js";
import type { Type } from "../types/Type.js";
import { VariantType } from "../types/VariantType.js";
import { createRustEnum } from "./RustEnum.js";
import { createRustFunction } from "./RustFunction.js";
import { createRustStruct } from "./RustStruct.js";
import { createRustVariant } from "./RustVariant.js";

/**
 * Bridges types between Rust and C++ across the `extern "C"` FFI boundary.
 *
 * At the FFI boundary, only C-compatible types can cross:
 * - Primitives (f64, bool, i64, u64, i32) pass directly
 * - Strings become *const c_char
 * - Enums pass as i32 discriminants
 * - Complex types (arrays, optionals, structs, etc.) pass as opaque void* pointers
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
        switch (inLanguage) {
          case "rust":
            // Panic on invalid discriminant — catch_unwind in the FFI shim will
            // catch this and propagate the error to C++ as a result struct.
            return `${enumType.enumName}::from_i32(${parameterName}).unwrap_or_else(|| { panic!("[Nitro] Invalid ${enumType.enumName} discriminant: {}", ${parameterName}) })`;
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
      case "array":
        switch (inLanguage) {
          case "rust":
            // Reconstruct Vec from boxed raw pointer
            return `*Box::from_raw(${parameterName} as *mut ${this.type.getCode("rust")})`;
          case "c++":
            // Box the vector and pass as void*
            return `static_cast<void*>(new ${this.type.getCode("c++")}(std::move(${parameterName})))`;
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
            // Extract the inner value into a local so inner bridging sees a plain value.
            if (innerBridged.needsSpecialHandling) {
              const innerConvert = innerBridged.parseFromCppToRust("__inner", "c++");
              return (
                `[&]() -> void* { ` +
                `struct __Opt { uint8_t has_value; ${innerFfiCpp} value; }; ` +
                `auto __opt = new __Opt(); ` +
                `if (${parameterName}.has_value()) { const auto& __inner = ${parameterName}.value(); __opt->has_value = 1; __opt->value = ${innerConvert}; } ` +
                `else { __opt->has_value = 0; __opt->value = {}; } ` +
                `return static_cast<void*>(__opt); }()`
              );
            } else {
              return (
                `[&]() -> void* { ` +
                `struct __Opt { uint8_t has_value; ${innerFfiCpp} value; }; ` +
                `auto __opt = new __Opt(); ` +
                `if (${parameterName}.has_value()) { __opt->has_value = 1; __opt->value = static_cast<${innerFfiCpp}>(${parameterName}.value()); } ` +
                `else { __opt->has_value = 0; __opt->value = {}; } ` +
                `return static_cast<void*>(__opt); }()`
              );
            }
          }
          default:
            return parameterName;
        }
      }
      case "struct":
        switch (inLanguage) {
          case "rust":
            return `*Box::from_raw(${parameterName} as *mut ${this.type.getCode("rust")})`;
          case "c++":
            return `static_cast<void*>(new ${this.type.getCode("c++")}(${parameterName}))`;
          default:
            return parameterName;
        }
      case "variant":
        switch (inLanguage) {
          case "rust":
            return `*Box::from_raw(${parameterName} as *mut ${this.type.getCode("rust")})`;
          case "c++":
            return `static_cast<void*>(new ${this.type.getCode("c++")}(std::move(${parameterName})))`;
          default:
            return parameterName;
        }
      case "tuple":
        switch (inLanguage) {
          case "rust":
            return `*Box::from_raw(${parameterName} as *mut ${this.type.getCode("rust")})`;
          case "c++":
            return `static_cast<void*>(new ${this.type.getCode("c++")}(std::move(${parameterName})))`;
          default:
            return parameterName;
        }
      case "record":
        switch (inLanguage) {
          case "rust":
            return `*Box::from_raw(${parameterName} as *mut ${this.type.getCode("rust")})`;
          case "c++":
            return `static_cast<void*>(new ${this.type.getCode("c++")}(std::move(${parameterName})))`;
          default:
            return parameterName;
        }
      case "function": {
        const funcType = getTypeAs(this.type, FunctionType);
        switch (inLanguage) {
          case "rust": {
            // Reconstruct Func_* wrapper from void pointer, then wrap in a closure
            // so the trait receives Box<dyn Fn(...)> as expected.
            const funcStructName = funcType.specializationName;
            const funcStructPath = `super::${funcStructName}::${funcStructName}`;
            const rustParams = funcType.parameters.map(
              (p, i) => `__p${i}: ${p.getCode("rust")}`,
            );
            const callArgs = funcType.parameters.map((_p, i) => `__p${i}`);
            const rustReturnType = funcType.returnType.getCode("rust");
            const returnSuffix =
              rustReturnType === "()" ? "" : ` -> ${rustReturnType}`;
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
            const ffiReturnType = returnBridged.getCppFfiType();

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

            // Wrap the trampoline body in try/catch to prevent C++ exceptions from
            // unwinding through Rust stack frames (which is UB). Since the callback
            // returns via a bare function pointer with no error channel, we must abort.
            let trampolineInner: string;
            if (funcType.returnType.kind === "void") {
              trampolineInner = `(*static_cast<${cppFnType}*>(__ud))(${callArgs.join(", ")});`;
            } else if (returnBridged.needsSpecialHandling) {
              const converted = returnBridged.parseFromCppToRust("__r", "c++");
              trampolineInner = `auto __r = (*static_cast<${cppFnType}*>(__ud))(${callArgs.join(", ")}); return ${converted};`;
            } else {
              trampolineInner = `return (*static_cast<${cppFnType}*>(__ud))(${callArgs.join(", ")});`;
            }
            const trampolineBody =
              `try { ${trampolineInner} } ` +
              `catch (const std::exception& __e) { fprintf(stderr, "Unhandled C++ exception in callback: %s\\n", __e.what()); std::abort(); } ` +
              `catch (...) { fprintf(stderr, "Unhandled C++ exception in callback\\n"); std::abort(); }`;

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
      case "hybrid-object":
        switch (inLanguage) {
          case "rust":
            // Reconstruct Box<dyn Trait> from opaque void pointer.
            // The C++ side passes a new'd clone, so Rust takes ownership.
            return `*Box::from_raw(${parameterName} as *mut ${this.type.getCode("rust")})`;
          case "c++":
            // Clone the shared_ptr onto the heap so Rust can take ownership via Box::from_raw.
            // Using .get() would be a non-owning pointer that Rust would double-free.
            return `static_cast<void*>(new ${this.type.getCode("c++")}(${parameterName}))`;
          default:
            return parameterName;
        }
      case "promise":
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
            return `*Box::from_raw(${parameterName} as *mut super::NitroBuffer::NitroBuffer)`;
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
            return `*Box::from_raw(${parameterName} as *mut ${this.type.getCode("rust")})`;
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
                `None => __Opt { has_value: 0, value: unsafe { std::mem::zeroed() } /* SAFETY: value is never read when has_value=0; all FFI types are zero-safe */ } }; ` +
                `Box::into_raw(Box::new(__opt)) as *mut std::ffi::c_void }`
              );
            } else {
              return (
                `{ #[repr(C)] struct __Opt { has_value: u8, value: ${innerFfiRust} } ` +
                `let __opt: __Opt = match ${parameterName} { ` +
                `Some(__v) => __Opt { has_value: 1, value: __v }, ` +
                `None => __Opt { has_value: 0, value: unsafe { std::mem::zeroed() } /* SAFETY: value is never read when has_value=0; all FFI types are zero-safe */ } }; ` +
                `Box::into_raw(Box::new(__opt)) as *mut std::ffi::c_void }`
              );
            }
          }
          case "c++": {
            // Unbox the C struct and reconstruct std::optional<CppType>.
            // The struct has { uint8_t has_value; <ffi_type> value; }.
            const cppInnerType = optType.wrappingType.getCode("c++");
            if (innerBridged.needsSpecialHandling) {
              const innerConvert = innerBridged.parseFromRustToCpp("__s->value", "c++");
              return (
                `[&]() -> ${this.type.getCode("c++")} { ` +
                `struct __Opt { uint8_t has_value; ${innerFfiCpp} value; }; ` +
                `auto __s = static_cast<__Opt*>(${parameterName}); ` +
                `${this.type.getCode("c++")} __r; ` +
                `if (__s->has_value) { __r = ${innerConvert}; } ` +
                `delete __s; return __r; }()`
              );
            } else {
              return (
                `[&]() -> ${this.type.getCode("c++")} { ` +
                `struct __Opt { uint8_t has_value; ${innerFfiCpp} value; }; ` +
                `auto __s = static_cast<__Opt*>(${parameterName}); ` +
                `${this.type.getCode("c++")} __r; ` +
                `if (__s->has_value) { __r = static_cast<${cppInnerType}>(__s->value); } ` +
                `delete __s; return __r; }()`
              );
            }
          }
          default:
            return parameterName;
        }
      }
      case "array":
      case "record":
      case "tuple":
      case "map":
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
      case "struct":
        switch (inLanguage) {
          case "rust":
            return `Box::into_raw(Box::new(${parameterName})) as *mut std::ffi::c_void`;
          case "c++":
            return `*static_cast<${this.type.getCode("c++")}*>(${parameterName})`;
          default:
            return parameterName;
        }
      case "variant":
        switch (inLanguage) {
          case "rust":
            return `Box::into_raw(Box::new(${parameterName})) as *mut std::ffi::c_void`;
          case "c++":
            return `std::move(*static_cast<${this.type.getCode("c++")}*>(${parameterName}))`;
          default:
            return parameterName;
        }
      case "function":
        switch (inLanguage) {
          case "rust":
            // Box the Func_* wrapper and leak as void pointer
            return `Box::into_raw(Box::new(${parameterName})) as *mut std::ffi::c_void`;
          case "c++":
            // Reconstruct std::function from Func_* struct
            return `std::move(*static_cast<${this.type.getCode("c++")}*>(${parameterName}))`;
          default:
            return parameterName;
        }
      case "hybrid-object":
        switch (inLanguage) {
          case "rust":
            // Box the trait object and leak it as a void pointer
            return `Box::into_raw(Box::new(${parameterName})) as *mut std::ffi::c_void`;
          case "c++":
            // This would require reconstructing a shared_ptr — complex
            return parameterName;
          default:
            return parameterName;
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
}
