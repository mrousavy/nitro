import type { HybridObject } from 'react-native-nitro-modules'

// Direct self-reference
export interface Node {
  node?: Node
}

// Indirect cycle: Foo references Bar, Bar references Foo
export interface Foo {
  bar?: Bar
}

export interface Bar {
  foo?: Foo
}

export interface Cyclic
  extends HybridObject<{ ios: 'swift'; android: 'kotlin' }> {
  node?: Node
  foo?: Foo
}
