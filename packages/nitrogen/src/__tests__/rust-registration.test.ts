import { describe, test, expect } from "bun:test";
import { createRustHybridObjectRegistration } from "../syntax/rust/RustHybridObjectRegistration.js";

describe("RustHybridObjectRegistration", () => {
  test("generates correct factory function name", () => {
    const reg = createRustHybridObjectRegistration({
      hybridObjectName: "Image",
      rustClassName: "HybridImage",
    });

    expect(reg.cppExternDeclarations).toContain(
      "extern \"C\" void* create_HybridImageSpec();",
    );
  });

  test("generates C++ registration code with correct name", () => {
    const reg = createRustHybridObjectRegistration({
      hybridObjectName: "Image",
      rustClassName: "HybridImage",
    });

    expect(reg.cppCode).toContain(
      'HybridObjectRegistry::registerHybridObjectConstructor',
    );
    expect(reg.cppCode).toContain('"Image"');
  });

  test("registration code calls factory and wraps in shared_ptr", () => {
    const reg = createRustHybridObjectRegistration({
      hybridObjectName: "Image",
      rustClassName: "HybridImage",
    });

    expect(reg.cppCode).toContain("create_HybridImageSpec()");
    expect(reg.cppCode).toContain("std::make_shared<HybridImageSpecRust>(rustPtr)");
  });

  test("extern declarations include Rust factory comment", () => {
    const reg = createRustHybridObjectRegistration({
      hybridObjectName: "Image",
      rustClassName: "HybridImage",
    });

    expect(reg.cppExternDeclarations).toContain("Rust factory function");
    expect(reg.cppExternDeclarations).toContain("HybridImage");
  });

  test("required imports include the Rust bridge header", () => {
    const reg = createRustHybridObjectRegistration({
      hybridObjectName: "Image",
      rustClassName: "HybridImage",
    });

    expect(reg.requiredImports).toHaveLength(1);
    expect(reg.requiredImports[0]!.name).toBe("HybridImageSpecRust.hpp");
    expect(reg.requiredImports[0]!.language).toBe("c++");
    expect(reg.requiredImports[0]!.space).toBe("user");
  });

  test("works with different naming conventions", () => {
    const reg = createRustHybridObjectRegistration({
      hybridObjectName: "DatabaseManager",
      rustClassName: "MyDatabaseManager",
    });

    expect(reg.cppExternDeclarations).toContain(
      "create_HybridDatabaseManagerSpec",
    );
    expect(reg.cppCode).toContain('"DatabaseManager"');
    expect(reg.cppCode).toContain("HybridDatabaseManagerSpecRust");
    expect(reg.requiredImports[0]!.name).toBe(
      "HybridDatabaseManagerSpecRust.hpp",
    );
  });
});
