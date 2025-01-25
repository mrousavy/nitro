import type { HybridObject } from "react-native-nitro-modules";

// This is for testing purposes only.
export interface TestObjectTSX
    extends HybridObject<{ ios: "swift"; android: "kotlin" }> {
    readonly testValue: number;
}
