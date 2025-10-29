//
//  HybridSomeExternalObject
//  NitroTestExternal
//
//  Created by Marc Rousavy on 14.08.25.
//

import Foundation
import NitroModules

class HybridSomeExternalObject: HybridSomeExternalObjectSpec {
  func getValue() throws -> String {
    return "Hello world!"
  }

  func bounceEnum(value: SomeExternalEnum) -> SomeExternalEnum {
    return value
  }

  func bounceStruct(value: SomeExternalStruct) -> SomeExternalStruct {
    return value
  }
}
