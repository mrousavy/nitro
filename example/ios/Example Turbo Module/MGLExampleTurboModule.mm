//
//  MGLExampleTurboModule.mm
//  NitroExample
//
//  Created by Marc Rousavy on 13.11.24.
//

#import "MGLExampleTurboModule.h"

@implementation ExampleTurboModule

RCT_EXPORT_MODULE()

- (NSNumber*)addNumbers:(double)a b:(double)b {
  NSNumber* result = [[NSNumber alloc] initWithDouble:a + b];
  return result;
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeExampleTurboModuleSpecJSI>(params);
}

@end
