#ifdef __cplusplus
#import "react-native-nitro.h"
#endif

#ifdef RCT_NEW_ARCH_ENABLED
#import "RNNitroSpec.h"

@interface Nitro : NSObject <NativeNitroSpec>
#else
#import <React/RCTBridgeModule.h>

@interface Nitro : NSObject <RCTBridgeModule>
#endif

@end
