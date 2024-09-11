import type { Autolinking } from './Autolinking.js'
import { createPodspecRubyExtension } from './ios/createPodspecRubyExtension.js'
import { createSwiftCxxBridge } from './ios/createSwiftCxxBridge.js'
import { createSwiftUmbrellaHeader } from './ios/createSwiftUmbrellaHeader.js'

interface IOSAutolinking extends Autolinking {}

export function createIOSAutolinking(): IOSAutolinking {
  const podspecExtension = createPodspecRubyExtension()
  const swiftCxxBridge = createSwiftCxxBridge()
  const swiftUmbrellaHeader = createSwiftUmbrellaHeader()
  return {
    platform: 'ios',
    sourceFiles: [podspecExtension, ...swiftCxxBridge, swiftUmbrellaHeader],
  }
}
