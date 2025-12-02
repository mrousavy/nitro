import { getReferencedTypes } from '../getReferencedTypes.js'
import { FunctionType } from '../types/FunctionType.js'
import { getTypeAs } from '../types/getTypeAs.js'
import { StructType } from '../types/StructType.js'
import type { Type } from '../types/Type.js'

export interface CyclicDependencyResult {
  /** Names of types that have cyclic dependencies with the source type */
  cyclicNames: Set<string>
  /** Whether there are any cyclic dependencies */
  hasCyclicDeps: boolean
}

/**
 * Detects cyclic dependencies between a struct and function types it references.
 *
 * When a struct contains a function type, and that function type references the struct
 * back (directly or indirectly), we have a cyclic dependency. This would cause circular
 * includes in the generated JNI headers.
 *
 * @param structType The struct to check for cyclic function dependencies
 * @returns Names of function types that have cyclic references back to this struct
 */
export function detectCyclicFunctionDependencies(
  structType: StructType
): CyclicDependencyResult {
  const cyclicNames = new Set<string>()

  const referencedFunctionTypes = getReferencedTypes(structType)
    .filter((t) => t.kind === 'function')
    .map((t) => getTypeAs(t, FunctionType))

  for (const funcType of referencedFunctionTypes) {
    if (doesTypeReferenceStruct(funcType, structType.structName)) {
      cyclicNames.add(funcType.specializationName)
    }
  }

  return {
    cyclicNames,
    hasCyclicDeps: cyclicNames.size > 0,
  }
}

/**
 * Detects cyclic dependencies between a function and struct types it references.
 *
 * When a function contains a struct type parameter/return, and that struct contains
 * this function type, we have a cyclic dependency. This would cause circular
 * includes in the generated JNI headers.
 *
 * @param functionType The function to check for cyclic struct dependencies
 * @returns Names of struct types that have cyclic references back to this function
 */
export function detectCyclicStructDependencies(
  functionType: FunctionType
): CyclicDependencyResult {
  const cyclicNames = new Set<string>()
  const functionName = functionType.specializationName

  const referencedStructTypes = getReferencedTypes(functionType)
    .filter((t) => t.kind === 'struct')
    .map((t) => getTypeAs(t, StructType))

  for (const structType of referencedStructTypes) {
    if (doesTypeReferenceFunction(structType, functionName)) {
      cyclicNames.add(structType.structName)
    }
  }

  return {
    cyclicNames,
    hasCyclicDeps: cyclicNames.size > 0,
  }
}

/**
 * Checks if a type references a struct with the given name
 */
function doesTypeReferenceStruct(type: Type, structName: string): boolean {
  const referencedTypes = getReferencedTypes(type)
  for (const refType of referencedTypes) {
    if (refType.kind === 'struct') {
      const refStruct = getTypeAs(refType, StructType)
      if (refStruct.structName === structName) {
        return true
      }
    }
  }
  return false
}

/**
 * Checks if a type references a function with the given specialization name
 */
function doesTypeReferenceFunction(
  type: Type,
  functionName: string
): boolean {
  const referencedTypes = getReferencedTypes(type)
  for (const refType of referencedTypes) {
    if (refType.kind === 'function') {
      const refFunc = getTypeAs(refType, FunctionType)
      if (refFunc.specializationName === functionName) {
        return true
      }
    }
  }
  return false
}

/**
 * Extracts the type name from a JNI header import name.
 * E.g., "JMyStruct.hpp" -> "MyStruct", "JFunc_void.hpp" -> "Func_void"
 *
 * Note: This relies on the consistent "J<TypeName>.hpp" naming convention.
 * A cleaner approach would be to store the original type name in the import
 * object itself, but that would require changes to the SourceImport interface
 * and all places that create imports.
 */
export function extractTypeNameFromImport(importName: string): string {
  return importName.replace(/^J/, '').replace(/\.hpp$/, '')
}

/**
 * Filters imports into regular and cyclic categories based on the cyclic names set.
 */
export function partitionImportsByCyclicDeps<T extends { name: string }>(
  imports: T[],
  cyclicNames: Set<string>
): { regularImports: T[]; cyclicImports: T[] } {
  const regularImports = imports.filter(
    (i) => !cyclicNames.has(extractTypeNameFromImport(i.name))
  )
  const cyclicImports = imports.filter((i) =>
    cyclicNames.has(extractTypeNameFromImport(i.name))
  )
  return { regularImports, cyclicImports }
}
