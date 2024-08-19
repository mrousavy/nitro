import { NitroConfig } from '../../config/NitroConfig.js'
import { indent } from '../../utils.js'
import { getAllTypes } from '../getAllTypes.js'
import { getHybridObjectName } from '../getHybridObjectName.js'
import { createFileMetadataString } from '../helpers.js'
import type { HybridObjectSpec } from '../HybridObjectSpec.js'
import type { SourceFile } from '../SourceFile.js'
import { createFbjniHybridObject } from './FbjniHybridObject.js'
import { KotlinCxxBridgedType } from './KotlinCxxBridgedType.js'

export function createKotlinHybridObject(spec: HybridObjectSpec): SourceFile[] {
  const name = getHybridObjectName(spec.name)
  const properties = spec.properties
    .map((p) => p.getCode('kotlin', { doNotStrip: true, virtual: true }))
    .join('\n\n')
  const methods = spec.methods
    .map((p) => p.getCode('kotlin', { doNotStrip: true, virtual: true }))
    .join('\n\n')

  const javaPackage = NitroConfig.getAndroidPackage('java/kotlin')
  const cppLibName = NitroConfig.getAndroidCxxLibName()

  // 1. Create Kotlin abstract class definition
  const abstractClassCode = `
${createFileMetadataString(`${name.HybridTSpec}.kt`)}

package ${javaPackage}

import android.util.Log
import androidx.annotation.Keep
import com.facebook.jni.HybridData
import com.facebook.proguard.annotations.DoNotStrip
import com.margelo.nitro.HybridObject

/**
 * A Kotlin class representing the ${spec.name} HybridObject.
 * Implement this abstract class to create Kotlin-based instances of ${spec.name}.
 */
@DoNotStrip
@Keep
@Suppress("KotlinJniMissingFunction")
abstract class ${name.HybridTSpec}: HybridObject() {
  protected val TAG = "${name.HybridTSpec}"

  @DoNotStrip
  val mHybridData: HybridData = initHybrid()

  init {
    // Pass it through to it's base class to represent inheritance to JHybridObject on C++ side
    super.updateNative(mHybridData)
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
