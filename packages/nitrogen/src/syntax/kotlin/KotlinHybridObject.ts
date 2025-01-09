import { NitroConfig } from '../../config/NitroConfig.js'
import { indent } from '../../utils.js'
import { getAllTypes } from '../getAllTypes.js'
import { getHybridObjectName } from '../getHybridObjectName.js'
import { createFileMetadataString } from '../helpers.js'
import type { HybridObjectSpec } from '../HybridObjectSpec.js'
import { Method } from '../Method.js'
import { Property } from '../Property.js'
import type { SourceFile } from '../SourceFile.js'
import { type Type } from '../types/Type.js'
import { createFbjniHybridObject } from './FbjniHybridObject.js'
import { KotlinCxxBridgedType } from './KotlinCxxBridgedType.js'

export function createKotlinHybridObject(spec: HybridObjectSpec): SourceFile[] {
  const name = getHybridObjectName(spec.name)
  const properties = spec.properties
    .map((p) => getPropertyForwardImplementation(p))
    .join('\n\n')
  const methods = spec.methods
    .map((m) => getMethodForwardImplementation(m))
    .join('\n\n')

  const javaPackage = NitroConfig.getAndroidPackage('java/kotlin')
  const cppLibName = NitroConfig.getAndroidCxxLibName()

  let kotlinBase = spec.isHybridView ? 'HybridView' : 'HybridObject'
  if (spec.baseTypes.length > 0) {
    if (spec.baseTypes.length > 1) {
      throw new Error(
        `${name.T}: Inheriting from multiple HybridObject bases is not yet supported in Kotlin!`
      )
    }
    const base = spec.baseTypes[0]!.name
    kotlinBase = getHybridObjectName(base).HybridTSpec
  }

  const imports: string[] = []
  imports.push('import com.margelo.nitro.core.*')
  if (spec.isHybridView) {
    imports.push('import com.margelo.nitro.views.*')
  }

  // 1. Create Kotlin abstract class definition
  const abstractClassCode = `
${createFileMetadataString(`${name.HybridTSpec}.kt`)}

package ${javaPackage}

import android.util.Log
import androidx.annotation.Keep
import com.facebook.jni.HybridData
import com.facebook.proguard.annotations.DoNotStrip
${imports.join('\n')}

/**
 * A Kotlin class representing the ${spec.name} HybridObject.
 * Implement this abstract class to create Kotlin-based instances of ${spec.name}.
 */
@DoNotStrip
@Keep
@Suppress("RedundantSuppression", "KotlinJniMissingFunction", "PropertyName", "RedundantUnitReturnType", "unused")
abstract class ${name.HybridTSpec}: ${kotlinBase}() {
  @DoNotStrip
  private var mHybridData: HybridData = initHybrid()

  init {
    // Pass this \`HybridData\` through to it's base class,
    // to represent inheritance to JHybridObject on C++ side
    super.updateNative(mHybridData)
  }

  /**
   * Call from a child class to initialize HybridData with a child.
   */
  override fun updateNative(hybridData: HybridData) {
    mHybridData = hybridData
  }

  // Properties
  ${indent(properties, '  ')}

  // Methods
  ${indent(methods, '  ')}

  private external fun initHybrid(): HybridData

  companion object {
    private const val TAG = "${name.HybridTSpec}"
    init {
      try {
        Log.i(TAG, "Loading ${cppLibName} C++ library...")
        System.loadLibrary("${cppLibName}")
        Log.i(TAG, "Successfully loaded ${cppLibName} C++ library!")
      } catch (e: Error) {
        Log.e(TAG, "Failed to load ${cppLibName} C++ library! Is it properly installed and linked? " +
                    "Is the name correct? (see \`CMakeLists.txt\`, at \`add_library(...)\`)", e)
        throw e
      }
    }
  }
}
  `.trim()

  // 2. Create C++ (fbjni) bindings
  const cppFiles = createFbjniHybridObject(spec)

  // 3. Create enums or structs in Kotlin
  const extraFiles = getAllTypes(spec)
    .map((t) => new KotlinCxxBridgedType(t))
    .flatMap((b) => b.getExtraFiles())

  const files: SourceFile[] = []
  files.push({
    content: abstractClassCode,
    language: 'kotlin',
    name: `${name.HybridTSpec}.kt`,
    subdirectory: NitroConfig.getAndroidPackageDirectory(),
    platform: 'android',
  })
  files.push(...cppFiles)
  files.push(...extraFiles)
  return files
}

function requiresSpecialBridging(type: Type): boolean {
  return (
    type.getCode('kotlin') !==
    new KotlinCxxBridgedType(type).getTypeCode('kotlin')
  )
}

function getMethodForwardImplementation(method: Method): string {
  const bridgedReturn = new KotlinCxxBridgedType(method.returnType)
  const requiresBridge =
    requiresSpecialBridging(method.returnType) ||
    method.parameters.some((p) => requiresSpecialBridging(p.type))

  const code = method.getCode('kotlin', { doNotStrip: true, virtual: true })
  if (requiresBridge) {
    const paramsSignature = method.parameters.map((p) => {
      const bridge = new KotlinCxxBridgedType(p.type)
      return `${p.name}: ${bridge.getTypeCode('kotlin')}`
    })
    const paramsForward = method.parameters.map((p) => {
      const bridge = new KotlinCxxBridgedType(p.type)
      return bridge.parseFromCppToKotlin(p.name, 'kotlin')
    })
    const returnForward = bridgedReturn.parseFromKotlinToCpp(
      '__result',
      'kotlin'
    )
    return `
${code}

@DoNotStrip
@Keep
private fun ${method.name}(${paramsSignature.join(', ')}): ${bridgedReturn.getTypeCode('kotlin')} {
  val __result = ${method.name}(${paramsForward.join(', ')})
  return ${returnForward}
}
    `.trim()
  } else {
    return code
  }
}

function getPropertyForwardImplementation(property: Property): string {
  const code = property.getCode('kotlin', { doNotStrip: true, virtual: true })
  if (requiresSpecialBridging(property.type)) {
    const bridged = new KotlinCxxBridgedType(property.type)

    let keyword = property.isReadonly ? 'val' : 'var'
    let modifiers: string[] = []
    modifiers.push('@get:DoNotStrip', '@get:Keep')
    if (!property.isReadonly) modifiers.push('@set:DoNotStrip', '@set:Keep')
    let lines: string[] = []
    lines.push(
      `
get() {
  return ${indent(bridged.parseFromKotlinToCpp(property.name, 'kotlin'), '  ')}
}
    `.trim()
    )
    if (!property.isReadonly) {
      lines.push(
        `
set(value) {
  ${property.name} = ${indent(bridged.parseFromCppToKotlin('value', 'kotlin'), '  ')}
}
      `.trim()
      )
    }
    return `
${code}

private ${keyword} ${property.name}: ${bridged.getTypeCode('kotlin')}
  ${indent(lines.join('\n'), '  ')}
    `.trim()
  } else {
    return code
  }
}
