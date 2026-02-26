import { describe, test, expect } from 'bun:test'
import { Method } from '../syntax/Method.js'
import { Property } from '../syntax/Property.js'
import { Parameter } from '../syntax/Parameter.js'
import { NumberType } from '../syntax/types/NumberType.js'
import { StringType } from '../syntax/types/StringType.js'
import { BooleanType } from '../syntax/types/BooleanType.js'
import { VoidType } from '../syntax/types/VoidType.js'
import { ArrayType } from '../syntax/types/ArrayType.js'
import { OptionalType } from '../syntax/types/OptionalType.js'
import { toSnakeCase } from '../syntax/helpers.js'

describe('toSnakeCase', () => {
  test('camelCase -> snake_case', () => {
    expect(toSnakeCase('myMethod')).toBe('my_method')
  })
  test('simple lowercase stays the same', () => {
    expect(toSnakeCase('name')).toBe('name')
  })
  test('PascalCase -> pascal_case', () => {
    expect(toSnakeCase('MyMethod')).toBe('my_method')
  })
  test('multiple capitals (acronyms)', () => {
    expect(toSnakeCase('getHTTPResponse')).toBe('get_http_response')
  })
  test('already snake_case stays the same', () => {
    expect(toSnakeCase('my_method')).toBe('my_method')
  })
  test('single word', () => {
    expect(toSnakeCase('resize')).toBe('resize')
  })
  test('isBoolean prefix', () => {
    expect(toSnakeCase('isFast')).toBe('is_fast')
  })
})

describe('Rust Method Code Generation', () => {
  test('void method with no params', () => {
    const method = new Method('doSomething', new VoidType(), [])
    const code = method.getCode('rust')
    expect(code).toBe('fn do_something(&mut self) -> Result<(), String>;')
  })

  test('method with return type', () => {
    const method = new Method('getValue', new NumberType(), [])
    const code = method.getCode('rust')
    expect(code).toBe('fn get_value(&mut self) -> Result<f64, String>;')
  })

  test('method with parameters', () => {
    const method = new Method('addNumbers', new NumberType(), [
      new Parameter('a', new NumberType()),
      new Parameter('b', new NumberType()),
    ])
    const code = method.getCode('rust')
    expect(code).toBe('fn add_numbers(&mut self, a: f64, b: f64) -> Result<f64, String>;')
  })

  test('method with string params and return', () => {
    const method = new Method('greet', new StringType(), [
      new Parameter('name', new StringType()),
    ])
    const code = method.getCode('rust')
    expect(code).toBe('fn greet(&mut self, name: String) -> Result<String, String>;')
  })

  test('method with complex types', () => {
    const method = new Method('processData', new VoidType(), [
      new Parameter('items', new ArrayType(new NumberType())),
      new Parameter('label', new OptionalType(new StringType())),
    ])
    const code = method.getCode('rust')
    expect(code).toBe(
      'fn process_data(&mut self, items: Vec<f64>, label: Option<String>) -> Result<(), String>;'
    )
  })

  test('method with body', () => {
    const method = new Method('getValue', new NumberType(), [])
    const code = method.getCode('rust', {}, 'return 42.0;')
    expect(code).toContain('fn get_value(&mut self) -> Result<f64, String> {')
    expect(code).toContain('return 42.0;')
    expect(code).toContain('}')
  })
})

describe('Rust Property Code Generation', () => {
  test('readonly property generates getter only', () => {
    const prop = new Property('width', new NumberType(), true)
    const code = prop.getCode('rust')
    expect(code).toBe('fn get_width(&self) -> f64;')
  })

  test('readwrite property generates getter and setter', () => {
    const prop = new Property('name', new StringType(), false)
    const code = prop.getCode('rust')
    expect(code).toContain('fn get_name(&self) -> String;')
    expect(code).toContain('fn set_name(&mut self, value: String);')
  })

  test('boolean property', () => {
    const prop = new Property('isFast', new BooleanType(), true)
    const code = prop.getCode('rust')
    expect(code).toBe('fn get_is_fast(&self) -> bool;')
  })

  test('optional property', () => {
    const prop = new Property('label', new OptionalType(new StringType()), false)
    const code = prop.getCode('rust')
    expect(code).toContain('fn get_label(&self) -> Option<String>;')
    expect(code).toContain('fn set_label(&mut self, value: Option<String>);')
  })
})

describe('Rust Parameter Code Generation', () => {
  test('simple parameter', () => {
    const param = new Parameter('value', new NumberType())
    expect(param.getCode('rust')).toBe('value: f64')
  })

  test('camelCase parameter name becomes snake_case', () => {
    const param = new Parameter('myValue', new NumberType())
    expect(param.getCode('rust')).toBe('my_value: f64')
  })

  test('string parameter', () => {
    const param = new Parameter('name', new StringType())
    expect(param.getCode('rust')).toBe('name: String')
  })

  test('array parameter', () => {
    const param = new Parameter('items', new ArrayType(new StringType()))
    expect(param.getCode('rust')).toBe('items: Vec<String>')
  })
})

describe('Existing Languages Still Work', () => {
  test('C++ method generation', () => {
    const method = new Method('getValue', new NumberType(), [])
    const code = method.getCode('c++', { virtual: true })
    expect(code).toBe('virtual double getValue() = 0;')
  })

  test('Swift method generation', () => {
    const method = new Method('getValue', new NumberType(), [])
    const code = method.getCode('swift')
    expect(code).toBe('func getValue() throws -> Double')
  })

  test('Kotlin method generation', () => {
    const method = new Method('getValue', new NumberType(), [])
    const code = method.getCode('kotlin', { virtual: true })
    expect(code).toBe('abstract fun getValue(): Double')
  })

  test('C++ property generation', () => {
    const prop = new Property('width', new NumberType(), true)
    const code = prop.getCode('c++', { virtual: true })
    expect(code).toBe('virtual double getWidth() = 0;')
  })
})
