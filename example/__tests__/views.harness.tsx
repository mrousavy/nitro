import { Activity } from 'react'
import { Platform } from 'react-native'
import { describe, expect, it, render, waitUntil } from 'react-native-harness'
import { callback } from 'react-native-nitro-modules'
import { TestView, type TestViewRef } from 'react-native-nitro-test'

const refs: TestViewRef[] = []
const hybridRef = callback((ref: TestViewRef) => {
  refs.push(ref)
})

// Stable element - React does not re-render it, so its ShadowNode never changes.
const testView = (
  <TestView
    isBlue={true}
    hasBeenCalled={false}
    colorScheme="light"
    someCallback={callback(() => {})}
    hybridRef={hybridRef}
    style={{ width: 20, height: 20 }}
  />
)
const renderTestView = (visible: boolean) => (
  <Activity mode={visible ? 'visible' : 'hidden'}>{testView}</Activity>
)

// On iOS, hiding a subtree drops its native Views and showing it again creates new ones - for
// ShadowNodes that did not change. This is what react-native-screens does when a screen is
// detached and re-attached. On Android the native View survives being hidden, so there is
// nothing to re-create there. See https://github.com/mrousavy/nitro/issues/1380
const itOnIos = Platform.OS === 'ios' ? it : it.skip

describe('HybridView', () => {
  itOnIos('applies all props to a native View that Fabric re-created', async () => {
    refs.length = 0

    const { rerender, unmount } = await render(renderTestView(true))
    await waitUntil(() => refs.length === 1)
    expect(refs[0]!.isBlue).toBe(true)

    await rerender(renderTestView(false))
    await rerender(renderTestView(true))

    // A new native View was created, so `hybridRef` fires again with the new HybridView...
    await waitUntil(() => refs.length === 2)
    // ...and that new HybridView received `isBlue` again, instead of keeping its native default.
    expect(refs[1]!.isBlue).toBe(true)

    unmount()
  })
})
