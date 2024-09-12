import { indent } from '../../utils.js'
import type { BridgedType } from '../BridgedType.js'
import { getHybridObjectName } from '../getHybridObjectName.js'
import { getReferencedTypes } from '../getReferencedTypes.js'
import type { SourceFile, SourceImport } from '../SourceFile.js'
import { ArrayType } from '../types/ArrayType.js'
import { EnumType } from '../types/EnumType.js'
import { FunctionType } from '../types/FunctionType.js'
import { getTypeAs } from '../types/getTypeAs.js'
import { HybridObjectType } from '../types/HybridObjectType.js'
import { OptionalType } from '../types/OptionalType.js'
import { PromiseType } from '../types/PromiseType.js'
import { RecordType } from '../types/RecordType.js'
import { StructType } from '../types/StructType.js'
import type { Type } from '../types/Type.js'
import { getKotlinBoxedPrimitiveType } from './KotlinBoxedPrimitive.js'
import { createKotlinEnum } from './KotlinEnum.js'
import { createKotlinFunction } from './KotlinFunction.js'
import { createKotlinStruct } from './KotlinStruct.js'

export class KotlinCxxBridgedType implements BridgedType<'kotlin', 'c++'> {
  readonly type: Type

  constructor(type: Type) {
    this.type = type
  }

  get hasType(): boolean {
    return this.type.kind !== 'void' && this.type.kind !== 'null'
  }

  get canBePassedByReference(): boolean {
    return this.type.canBePassedByReference
  }

  get needsSpecialHandling(): boolean {
    switch (this.type.kind) {
      default:
        return false
    }
  }

  getRequiredImports(): SourceImport[] {
    const imports = this.type.getRequiredImports()

    switch (this.type.kind) {
      case 'enum':
        const enumType = getTypeAs(this.type, EnumType)
        imports.push({
          language: 'c++',
          name: `J${enumType.enumName}.hpp`,
          space: 'user',
        })
        break
      case 'struct':
        const structType = getTypeAs(this.type, StructType)
        imports.push({
          language: 'c++',
          name: `J${structType.structName}.hpp`,
          space: 'user',
        })
        break
      case 'function':
        const functionType = getTypeAs(this.type, FunctionType)
        imports.push({
          language: 'c++',
          name: `J${functionType.specializationName}.hpp`,
          space: 'user',
        })
        break
      case 'array-buffer':
        imports.push({
          language: 'c++',
          name: 'NitroModules/JArrayBuffer.hpp',
          space: 'system',
        })
        break
      case 'promise':
        imports.push({
          language: 'c++',
          name: 'NitroModules/JPromise.hpp',
          space: 'system',
        })
        break
      case 'map':
        imports.push({
          language: 'c++',
          name: 'NitroModules/JAnyMap.hpp',
          space: 'system',
        })
        break
      case 'hybrid-object': {
        const hybridObjectType = getTypeAs(this.type, HybridObjectType)
        const name = getHybridObjectName(hybridObjectType.hybridObjectName)
        imports.push({
          language: 'c++',
          name: `${name.JHybridTSpec}.hpp`,
          space: 'user',
        })
        imports.push({
          language: 'c++',
          name: 'NitroModules/JNISharedPtr.hpp',
          space: 'system',
        })
        break
      }
    }

    // Recursively look into referenced types (e.g. the `T` of a `optional<T>`, or `T` of a `T[]`)
    const referencedTypes = getReferencedTypes(this.type)
    referencedTypes.forEach((t) => {
      if (t === this.type) {
        // break a recursion - we already know this type
        return
      }
      const bridged = new KotlinCxxBridgedType(t)
      imports.push(...bridged.getRequiredImports())
    })

    return imports
  }

  getExtraFiles(): SourceFile[] {
    const files: SourceFile[] = []

    switch (this.type.kind) {
      case 'enum':
        const enumType = getTypeAs(this.type, EnumType)
        const enumFiles = createKotlinEnum(enumType)
        files.push(...enumFiles)
        break
      case 'struct':
        const structType = getTypeAs(this.type, StructType)
        const structFiles = createKotlinStruct(structType)
        files.push(...structFiles)
        break
      case 'function':
        const functionType = getTypeAs(this.type, FunctionType)
        const funcFiles = createKotlinFunction(functionType)
        files.push(...funcFiles)
        break
    }

    // Recursively look into referenced types (e.g. the `T` of a `optional<T>`, or `T` of a `T[]`)
    const referencedTypes = getReferencedTypes(this.type)
    referencedTypes.forEach((t) => {
      if (t === this.type) {
        // break a recursion - we already know this type
        return
      }
      const bridged = new KotlinCxxBridgedType(t)
      files.push(...bridged.getExtraFiles())
    })

    return files
  }

  asJniReferenceType(referenceType: 'alias' | 'local' | 'global' = 'alias') {
    switch (this.type.kind) {
      case 'void':
      case 'number':
      case 'boolean':
      case 'bigint':
        // primitives are not references
        return this.getTypeCode('c++')
      default:
        return `jni::${referenceType}_ref<${this.getTypeCode('c++')}>`
    }
  }

  getTypeCode(language: 'kotlin' | 'c++'): string {
    switch (this.type.kind) {
      case 'array':
        switch (language) {
          case 'c++':
            const array = getTypeAs(this.type, ArrayType)
            switch (array.itemType.kind) {
              case 'number':
                return 'jni::JArrayDouble'
              case 'boolean':
                return 'jni::JArrayBoolean'
              case 'bigint':
                return 'jni::JArrayLong'
              default:
                const bridged = new KotlinCxxBridgedType(array.itemType)
                return `jni::JArrayClass<${bridged.getTypeCode(language)}>`
            }
          default:
            return this.type.getCode(language)
        }
      case 'string':
        switch (language) {
          case 'c++':
            return 'jni::JString'
          default:
            return this.type.getCode(language)
        }
      case 'record': {
        switch (language) {
          case 'c++':
            const recordType = getTypeAs(this.type, RecordType)
            const keyType = new KotlinCxxBridgedType(
              recordType.keyType
            ).getTypeCode(language)
            const valueType = new KotlinCxxBridgedType(
              recordType.valueType
            ).getTypeCode(language)
            return `jni::JMap<${keyType}, ${valueType}>`
          default:
            return this.type.getCode(language)
        }
      }
      case 'enum':
        switch (language) {
          case 'c++':
            const enumType = getTypeAs(this.type, EnumType)
            return `J${enumType.enumName}`
          default:
            return this.type.getCode(language)
        }
      case 'struct':
        switch (language) {
          case 'c++':
            const structType = getTypeAs(this.type, StructType)
            return `J${structType.structName}`
          default:
            return this.type.getCode(language)
        }
      case 'function':
        const functionType = getTypeAs(this.type, FunctionType)
        switch (language) {
          case 'c++':
            return `J${functionType.specializationName}::javaobject`
          case 'kotlin':
            return functionType.specializationName
          default:
            return this.type.getCode(language)
        }
      case 'hybrid-object': {
        switch (language) {
          case 'c++':
            const hybridObjectType = getTypeAs(this.type, HybridObjectType)
            const name = getHybridObjectName(hybridObjectType.hybridObjectName)
            return `${name.JHybridTSpec}::javaobject`
          default:
            return this.type.getCode(language)
        }
      }
      case 'array-buffer':
        switch (language) {
          case 'c++':
            return `JArrayBuffer::javaobject`
          default:
            return this.type.getCode(language)
        }
      case 'promise':
        switch (language) {
          case 'c++':
            return `JPromise::javaobject`
          default:
            return this.type.getCode(language)
        }
      case 'map':
        switch (language) {
          case 'c++':
            return `JAnyMap::javaobject`
          default:
            return this.type.getCode(language)
        }
      case 'optional': {
        switch (language) {
          case 'c++':
            const optional = getTypeAs(this.type, OptionalType)
            switch (optional.wrappingType.kind) {
              // primitives need to be boxed to make them nullable
              case 'number':
              case 'boolean':
              case 'bigint':
                const boxed = getKotlinBoxedPrimitiveType(optional.wrappingType)
                return boxed
              default:
                // all other types can be nullable as they are objects.
                const bridge = new KotlinCxxBridgedType(optional.wrappingType)
                return bridge.getTypeCode('c++')
            }
          default:
            return this.type.getCode(language)
        }
      }
      default:
        return this.type.getCode(language)
    }
  }

  parse(
    parameterName: string,
    from: 'c++' | 'kotlin',
    to: 'kotlin' | 'c++',
    inLanguage: 'kotlin' | 'c++'
  ): string {
    if (from === 'c++') {
      return this.parseFromCppToKotlin(parameterName, inLanguage)
    } else if (from === 'kotlin') {
      return this.parseFromKotlinToCpp(parameterName, inLanguage)
    } else {
      throw new Error(`Cannot parse "${parameterName}" from ${from} to ${to}!`)
    }
  }

  parseFromCppToKotlin(
    parameterName: string,
    language: 'kotlin' | 'c++',
    isBoxed = false
  ): string {
    switch (this.type.kind) {
      case 'number':
      case 'boolean':
      case 'bigint':
        switch (language) {
          case 'c++':
            if (isBoxed) {
              // box a primitive (double) to an object (JDouble)
              const boxed = getKotlinBoxedPrimitiveType(this.type)
              return `${boxed}::valueOf(${parameterName})`
            } else {
              return parameterName
            }
          default:
            return parameterName
        }
      case 'string':
        switch (language) {
          case 'c++':
            return `jni::make_jstring(${parameterName})`
          default:
            return parameterName
        }
      case 'struct': {
        switch (language) {
          case 'c++':
            const struct = getTypeAs(this.type, StructType)
            return `J${struct.structName}::fromCpp(${parameterName})`
          default:
            return parameterName
        }
      }
      case 'enum': {
        switch (language) {
          case 'c++':
            const enumType = getTypeAs(this.type, EnumType)
            return `J${enumType.enumName}::fromCpp(${parameterName})`
          default:
            return parameterName
        }
      }
      case 'function': {
        switch (language) {
          case 'c++':
            const func = getTypeAs(this.type, FunctionType)
            return `J${func.specializationName}::fromCpp(${parameterName})`
          case 'kotlin':
            return `${parameterName}.toLambda()`
          default:
            return parameterName
        }
      }
      case 'hybrid-object': {
        switch (language) {
          case 'c++':
            const hybrid = getTypeAs(this.type, HybridObjectType)
            const name = getHybridObjectName(hybrid.hybridObjectName)
            return `std::static_pointer_cast<${name.JHybridTSpec}>(${parameterName})->getJavaPart()`
          default:
            return parameterName
        }
      }
      case 'optional': {
        const optional = getTypeAs(this.type, OptionalType)
        const bridge = new KotlinCxxBridgedType(optional.wrappingType)
        switch (language) {
          case 'c++':
            return `${parameterName}.has_value() ? ${bridge.parseFromCppToKotlin(`${parameterName}.value()`, 'c++', true)} : nullptr`
          default:
            return parameterName
        }
      }
      case 'array-buffer': {
        switch (language) {
          case 'c++':
            return `JArrayBuffer::wrap(${parameterName})`
          default:
            return parameterName
        }
      }
      case 'map': {
        switch (language) {
          case 'c++':
            return `JAnyMap::create(${parameterName})`
          default:
            return parameterName
        }
      }
      case 'record': {
        switch (language) {
          case 'c++':
            const record = getTypeAs(this.type, RecordType)
            const key = new KotlinCxxBridgedType(record.keyType)
            const value = new KotlinCxxBridgedType(record.valueType)
            const parseKey = key.parseFromCppToKotlin('entry.first', 'c++')
            const parseValue = value.parseFromCppToKotlin('entry.second', 'c++')
            const javaMapType = `jni::JHashMap<${key.getTypeCode('c++')}, ${value.getTypeCode('c++')}>`
            return `
[&]() {
  auto map = ${javaMapType}::create(${parameterName}.size());
  for (const auto& entry : ${parameterName}) {
    map->put(${indent(parseKey, '    ')}, ${indent(parseValue, '    ')});
  }
  return map;
}()
            `.trim()
          default:
            return parameterName
        }
      }
      case 'array': {
        switch (language) {
          case 'c++': {
            const array = getTypeAs(this.type, ArrayType)
            const arrayType = this.getTypeCode('c++')
            const bridge = new KotlinCxxBridgedType(array.itemType)
            switch (array.itemType.kind) {
              case 'number':
              case 'boolean':
              case 'bigint': {
                // primitive arrays can be constructed more efficiently with region/batch access.
                // no need to iterate through the entire array.
                return `
[&]() {
  size_t size = ${parameterName}.size();
  jni::local_ref<${arrayType}> array = ${arrayType}::newArray(size);
  array->setRegion(0, size, ${parameterName}.data());
  return array;
}()
`.trim()
              }
              default: {
                // other arrays need to loop through
                return `
[&]() {
  size_t size = ${parameterName}.size();
  jni::local_ref<${arrayType}> array = ${arrayType}::newArray(size);
  for (size_t i = 0; i < size; i++) {
    const auto& element = ${parameterName}[i];
    array->setElement(i, *${bridge.parseFromCppToKotlin('element', 'c++')});
  }
  return array;
}()
            `.trim()
              }
            }
          }
          default:
            return parameterName
        }
      }
      default:
        // no need to parse anything, just return as is
        return parameterName
    }
  }

  parseFromKotlinToCpp(
    parameterName: string,
    language: 'kotlin' | 'c++',
    isBoxed = false
  ): string {
    switch (this.type.kind) {
      case 'number':
      case 'boolean':
      case 'bigint':
        switch (language) {
          case 'c++':
            if (isBoxed) {
              // unbox an object (JDouble) to a primitive (double)
              return `${parameterName}->value()`
            } else {
              return parameterName
            }
          default:
            return parameterName
        }
      case 'string':
        switch (language) {
          case 'c++':
            return `${parameterName}->toStdString()`
          default:
            return parameterName
        }
      case 'struct':
      case 'enum':
      case 'function': {
        switch (language) {
          case 'c++':
            return `${parameterName}->toCpp()`
          default:
            return parameterName
        }
      }
      case 'hybrid-object': {
        switch (language) {
          case 'c++':
            const hybrid = getTypeAs(this.type, HybridObjectType)
            const name = getHybridObjectName(hybrid.hybridObjectName)
            return `JNISharedPtr::make_shared_from_jni<${name.JHybridTSpec}>(jni::make_global(${parameterName}))`
          default:
            return parameterName
        }
      }
      case 'optional': {
        const optional = getTypeAs(this.type, OptionalType)
        const bridge = new KotlinCxxBridgedType(optional.wrappingType)
        switch (language) {
          case 'c++':
            const parsed = bridge.parseFromKotlinToCpp(
              parameterName,
              'c++',
              true
            )
            return `${parameterName} != nullptr ? std::make_optional(${parsed}) : std::nullopt`
          default:
            return parameterName
        }
      }
      case 'array-buffer': {
        switch (language) {
          case 'c++':
            return `${parameterName}->cthis()->getArrayBuffer()`
          default:
            return parameterName
        }
      }
      case 'map': {
        switch (language) {
          case 'c++':
            return `${parameterName}->cthis()->getMap()`
          default:
            return parameterName
        }
      }
      case 'record': {
        switch (language) {
          case 'c++':
            const record = getTypeAs(this.type, RecordType)
            const key = new KotlinCxxBridgedType(record.keyType)
            const value = new KotlinCxxBridgedType(record.valueType)
            const parseKey = key.parseFromKotlinToCpp('entry.first', 'c++')
            const parseValue = value.parseFromKotlinToCpp('entry.second', 'c++')
            const cxxType = this.type.getCode('c++')
            return `
[&]() {
  ${cxxType} map;
  map.reserve(${parameterName}->size());
  for (const auto& entry : *${parameterName}) {
    map.emplace(${indent(parseKey, '    ')}, ${indent(parseValue, '    ')});
  }
  return map;
}()
            `.trim()
          default:
            return parameterName
        }
      }
      case 'array': {
        switch (language) {
          case 'c++':
            const array = getTypeAs(this.type, ArrayType)
            const bridge = new KotlinCxxBridgedType(array.itemType)
            const itemType = array.itemType.getCode('c++')
            switch (array.itemType.kind) {
              case 'number':
              case 'boolean':
              case 'bigint': {
                // primitive arrays can use region/batch access,
                // which we can use to construct the vector directly instead of looping through it.
                return `
[&]() {
  size_t size = ${parameterName}->size();
  std::vector<${itemType}> vector;
  vector.reserve(size);
  ${parameterName}->getRegion(0, size, vector.data());
  return vector;
}()
`.trim()
              }
              default: {
                // other arrays need to loop through
                return `
[&]() {
  size_t size = ${parameterName}->size();
  std::vector<${itemType}> vector;
  vector.reserve(size);
  for (size_t i = 0; i < size; i++) {
    auto element = ${parameterName}->getElement(i);
    vector.push_back(${bridge.parseFromKotlinToCpp('element', 'c++')});
  }
  return vector;
}()
            `.trim()
              }
            }
          default:
            return parameterName
        }
      }
      case 'promise': {
        switch (language) {
          case 'c++':
            const promise = getTypeAs(this.type, PromiseType)
            const actualCppType = promise.resultingType.getCode('c++')
            const resultingType = new KotlinCxxBridgedType(
              promise.resultingType
            )
            let resolveBody: string
            if (resultingType.hasType) {
              // it's a Promise<T>
              resolveBody = `
auto result = jni::static_ref_cast<${resultingType.getTypeCode('c++')}>(boxedResult);
promise->set_value(${resultingType.parseFromKotlinToCpp('result', 'c++', true)});
          `.trim()
            } else {
              // it's a Promise<void>
              resolveBody = `
promise->set_value();
          `.trim()
            }
            return `
[&]() {
  auto promise = std::make_shared<std::promise<${actualCppType}>>();
  ${parameterName}->cthis()->addOnResolvedListener([=](const jni::alias_ref<jni::JObject>& boxedResult) {
    ${indent(resolveBody, '    ')}
  });
  ${parameterName}->cthis()->addOnRejectedListener([=](const jni::alias_ref<jni::JString>& message) {
    std::runtime_error error(message->toStdString());
    promise->set_exception(std::make_exception_ptr(error));
  });
  return promise->get_future();
}()
        `.trim()
          default:
            return parameterName
        }
      }
      default:
        // no need to parse anything, just return as is
        return parameterName
    }
  }
}
