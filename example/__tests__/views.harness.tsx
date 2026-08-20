import { Activity } from 'react'
import { Platform } from 'react-native'
import { describe, expect, it, render, waitUntil } from 'react-native-harness'
import { callback } from 'react-native-nitro-modules'
import { TestView, type TestViewRef } from 'react-native-nitro-test'

const refs: TestViewRef[] = []
const hybridRef = callback((ref: TestViewRef) => {
  refs.push(ref)
})

// Keep the element stable so React can reuse its unchanged ShadowNode when the Activity is shown again.
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

function renderTestView(visible: boolean) {
  const mode = visible ? 'visible' : 'hidden'
  return <Activity mode={mode}>{testView}</Activity>
}

// On iOS, hiding an Activity drops its native Views. Showing it again creates new native Views
// for unchanged ShadowNodes. Android currently keeps the native View alive while it is hidden.
const itOnIos = Platform.OS === 'ios' ? it : it.skip

describe('HybridView', () => {
  itOnIos('applies props when Fabric re-creates its native View', async () => {
    refs.length = 0

    const rendered = await render(renderTestView(true))
    await waitUntil(() => refs.length === 1)
    expect(refs[0]!.isBlue).toBe(true)

    await rendered.rerender(renderTestView(false))
    await rendered.rerender(renderTestView(true))

    await waitUntil(() => refs.length === 2)
    expect(refs[1]!.isBlue).toBe(true)

    rendered.unmount()
  })
})
