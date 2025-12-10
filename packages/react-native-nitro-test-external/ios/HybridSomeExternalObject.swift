//
//  HybridSomeExternalObject
//  NitroTestExternal
//
//  Created by Marc Rousavy on 14.08.25.
//

import Foundation
import NitroModules

class HybridSomeExternalObject: HybridSomeExternalObjectSpec {
    func getNumber() throws -> SomeExternalObjectNumber {
        return SomeExternalObjectNumber(
            number: 10
        )
    }
    
  func getValue() throws -> String {
    return "Hello world!"
  }
}
