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
}
