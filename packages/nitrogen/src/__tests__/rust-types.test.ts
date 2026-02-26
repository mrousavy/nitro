import { describe, test, expect } from "bun:test";
import { NumberType } from "../syntax/types/NumberType.js";
import { BooleanType } from "../syntax/types/BooleanType.js";
import { StringType } from "../syntax/types/StringType.js";
import { VoidType } from "../syntax/types/VoidType.js";
import { Int64Type } from "../syntax/types/Int64Type.js";
import { UInt64Type } from "../syntax/types/UInt64Type.js";
import { NullType } from "../syntax/types/NullType.js";
import { DateType } from "../syntax/types/DateType.js";
import { ErrorType } from "../syntax/types/ErrorType.js";
import { ArrayBufferType } from "../syntax/types/ArrayBufferType.js";
import { ArrayType } from "../syntax/types/ArrayType.js";
import { OptionalType } from "../syntax/types/OptionalType.js";
import { RecordType } from "../syntax/types/RecordType.js";
import { TupleType } from "../syntax/types/TupleType.js";
import { MapType } from "../syntax/types/MapType.js";
import { ResultWrappingType } from "../syntax/types/ResultWrappingType.js";
import { PromiseType } from "../syntax/types/PromiseType.js";

describe("Rust Type Mappings", () => {
  describe("Primitives", () => {
    test("number -> f64", () => {
      expect(new NumberType().getCode("rust")).toBe("f64");
    });
    test("boolean -> bool", () => {
      expect(new BooleanType().getCode("rust")).toBe("bool");
    });
    test("string -> String", () => {
      expect(new StringType().getCode("rust")).toBe("String");
    });
    test("void -> ()", () => {
      expect(new VoidType().getCode("rust")).toBe("()");
    });
    test("int64 -> i64", () => {
      expect(new Int64Type().getCode("rust")).toBe("i64");
    });
    test("uint64 -> u64", () => {
      expect(new UInt64Type().getCode("rust")).toBe("u64");
    });
    test("null -> ()", () => {
      expect(new NullType().getCode("rust")).toBe("()");
    });
    test("date -> f64", () => {
      expect(new DateType().getCode("rust")).toBe("f64");
    });
    test("error -> String", () => {
      expect(new ErrorType().getCode("rust")).toBe("String");
    });
    test("ArrayBuffer -> NitroBuffer", () => {
      expect(new ArrayBufferType().getCode("rust")).toBe("NitroBuffer");
    });
    test("ArrayBuffer has NitroBuffer Rust import", () => {
      const imports = new ArrayBufferType().getRequiredImports("rust");
      expect(imports.some((i) => i.name.includes("NitroBuffer"))).toBe(true);
    });
  });

  describe("Generic Types", () => {
    test("Array<number> -> Vec<f64>", () => {
      const type = new ArrayType(new NumberType());
      expect(type.getCode("rust")).toBe("Vec<f64>");
    });
    test("Array<string> -> Vec<String>", () => {
      const type = new ArrayType(new StringType());
      expect(type.getCode("rust")).toBe("Vec<String>");
    });
    test("Array<boolean> -> Vec<bool>", () => {
      const type = new ArrayType(new BooleanType());
      expect(type.getCode("rust")).toBe("Vec<bool>");
    });
    test("Optional<number> -> Option<f64>", () => {
      const type = new OptionalType(new NumberType());
      expect(type.getCode("rust")).toBe("Option<f64>");
    });
    test("Optional<string> -> Option<String>", () => {
      const type = new OptionalType(new StringType());
      expect(type.getCode("rust")).toBe("Option<String>");
    });
    test("Optional<Array<number>> -> Option<Vec<f64>>", () => {
      const type = new OptionalType(new ArrayType(new NumberType()));
      expect(type.getCode("rust")).toBe("Option<Vec<f64>>");
    });
    test("Record<string, number> -> HashMap<String, f64>", () => {
      const type = new RecordType(new StringType(), new NumberType());
      expect(type.getCode("rust")).toBe("HashMap<String, f64>");
    });
    test("Record<string, boolean> -> HashMap<String, bool>", () => {
      const type = new RecordType(new StringType(), new BooleanType());
      expect(type.getCode("rust")).toBe("HashMap<String, bool>");
    });
    test("Tuple<number, string> -> (f64, String)", () => {
      const type = new TupleType([new NumberType(), new StringType()]);
      expect(type.getCode("rust")).toBe("(f64, String)");
    });
    test("Tuple<number, string, boolean> -> (f64, String, bool)", () => {
      const type = new TupleType([
        new NumberType(),
        new StringType(),
        new BooleanType(),
      ]);
      expect(type.getCode("rust")).toBe("(f64, String, bool)");
    });
    test("Map -> HashMap<String, Box<dyn std::any::Any>>", () => {
      expect(new MapType().getCode("rust")).toBe(
        "HashMap<String, Box<dyn std::any::Any>>",
      );
    });
  });

  describe("Result Wrapping", () => {
    test("Result<number> -> Result<f64, String>", () => {
      const type = new ResultWrappingType(new NumberType());
      expect(type.getCode("rust")).toBe("Result<f64, String>");
    });
    test("Result<void> -> Result<(), String>", () => {
      const type = new ResultWrappingType(new VoidType());
      expect(type.getCode("rust")).toBe("Result<(), String>");
    });
  });

  describe("Promise Types", () => {
    test("Promise<string> -> String (rust)", () => {
      expect(new PromiseType(new StringType()).getCode("rust")).toBe("String");
    });
    test("Promise<number> -> f64 (rust)", () => {
      expect(new PromiseType(new NumberType()).getCode("rust")).toBe("f64");
    });
    test("Promise<void> -> () (rust)", () => {
      expect(new PromiseType(new VoidType()).getCode("rust")).toBe("()");
    });
    test("Promise<Array<number>> -> Vec<f64> (rust)", () => {
      expect(
        new PromiseType(new ArrayType(new NumberType())).getCode("rust"),
      ).toBe("Vec<f64>");
    });
    test("Promise<string> -> std::shared_ptr<Promise<std::string>> (c++)", () => {
      expect(new PromiseType(new StringType()).getCode("c++")).toBe(
        "std::shared_ptr<Promise<std::string>>",
      );
    });
    test("Promise has no Rust imports", () => {
      const imports = new PromiseType(new StringType()).getRequiredImports(
        "rust",
      );
      expect(imports.some((i) => i.name.includes("Promise"))).toBe(false);
    });
  });

  describe("Nested Types", () => {
    test("Array<Optional<string>> -> Vec<Option<String>>", () => {
      const type = new ArrayType(new OptionalType(new StringType()));
      expect(type.getCode("rust")).toBe("Vec<Option<String>>");
    });
    test("Optional<Array<number>> -> Option<Vec<f64>>", () => {
      const type = new OptionalType(new ArrayType(new NumberType()));
      expect(type.getCode("rust")).toBe("Option<Vec<f64>>");
    });
    test("Record<string, Array<number>> -> HashMap<String, Vec<f64>>", () => {
      const type = new RecordType(
        new StringType(),
        new ArrayType(new NumberType()),
      );
      expect(type.getCode("rust")).toBe("HashMap<String, Vec<f64>>");
    });
  });

  describe("Existing Languages Still Work", () => {
    test("number -> double (c++)", () => {
      expect(new NumberType().getCode("c++")).toBe("double");
    });
    test("number -> Double (swift)", () => {
      expect(new NumberType().getCode("swift")).toBe("Double");
    });
    test("number -> Double (kotlin)", () => {
      expect(new NumberType().getCode("kotlin")).toBe("Double");
    });
    test("Array<number> -> std::vector<double> (c++)", () => {
      expect(new ArrayType(new NumberType()).getCode("c++")).toBe(
        "std::vector<double>",
      );
    });
    test("Optional<string> -> std::optional<std::string> (c++)", () => {
      expect(new OptionalType(new StringType()).getCode("c++")).toBe(
        "std::optional<std::string>",
      );
    });
  });
});
