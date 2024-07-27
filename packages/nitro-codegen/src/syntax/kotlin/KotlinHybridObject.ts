import { indent } from '../../stringUtils.js'
import { getHybridObjectName } from '../getHybridObjectName.js'
import { createFileMetadataString } from '../helpers.js'
import type { HybridObjectSpec } from '../HybridObjectSpec.js'
import type { SourceFile } from '../SourceFile.js'
import { createFbjniHybridObject } from './FbjniHybridObject.js'

// TODO: Make this customizable
const PACKAGE = 'com.margelo.nitro.image'

export function createKotlinHybridObject(spec: HybridObjectSpec): SourceFile[] {
  const name = getHybridObjectName(spec.name)
  const properties = spec.properties
    .map((p) => p.getCode('kotlin', { doNotStrip: true, virtual: true }))
    .join('\n\n')
  const methods = spec.methods
    .map((p) => p.getCode('kotlin', { doNotStrip: true, virtual: true }))
    .join('\n\n')

  const abstractClassCode = `
${createFileMetadataString(`${name.HybridT}.kt`)}

package ${PACKAGE}

import androidx.annotation.Keep
import com.facebook.jni.HybridData
import com.facebook.proguard.annotations.DoNotStrip

/**
 * A Kotlin class representing the ${spec.name} HybridObject.
 * Implement this abstract class to create Kotlin-based instances of ${spec.name}.
 */
@DoNotStrip
@Keep
@Suppress("KotlinJniMissingFunction")
abstract class ${name.HybridT}: HybridObject {
  @DoNotStrip
  @Keep
  private val mHybridData: HybridData

  init {
    mHybridData = initHybrid()
  }

  private external fun initHybrid(): HybridData

  // Properties
  ${indent(properties, '  ')}

  // Methods
  ${indent(methods, '  ')}
}
  `.trim()

  const cppFiles = createFbjniHybridObject(spec)

  const files: SourceFile[] = []
  files.push({
    content: abstractClassCode,
    language: 'kotlin',
    name: `${name.HybridT}.kt`,
    platform: 'android',
  })
  files.push(...cppFiles)
  return files
}
