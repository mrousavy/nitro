import * as React from 'react'
import { describe, expect, it, render, waitFor } from 'react-native-harness'
import { callback } from 'react-native-nitro-modules'
import { TestView, type TestViewRef } from 'react-native-nitro-test'

describe('Nitro Views', () => {
  it('only bridges changed props and supports optional prop removal', async () => {
    let viewRef: TestViewRef | undefined
    const hybridRef = callback((view: TestViewRef) => {
      viewRef = view
    })
    const someCallback = callback(() => {})
    const optionalCallback = callback(() => {})

    const rendered = await render(
      <TestView
        hybridRef={hybridRef}
        isBlue={true}
        hasBeenCalled={false}
        colorScheme="dark"
        someCallback={someCallback}
        optionalLabel="initial"
        optionalCallback={optionalCallback}
      />
    )

    await waitFor(() => {
      expect(viewRef).toBeDefined()
      expect(viewRef?.getIsBlueUpdateCount()).toBe(1)
    })

    await rendered.rerender(
      <TestView
        hybridRef={hybridRef}
        style={{ opacity: 0.5 }}
        isBlue={true}
        hasBeenCalled={false}
        colorScheme="dark"
        someCallback={someCallback}
        optionalLabel="initial"
        optionalCallback={optionalCallback}
      />
    )
    expect(viewRef?.getIsBlueUpdateCount()).toBe(1)

    await rendered.rerender(
      <TestView
        hybridRef={hybridRef}
        style={{ opacity: 0.5 }}
        isBlue={false}
        hasBeenCalled={false}
        colorScheme="dark"
        someCallback={someCallback}
      />
    )
    expect(viewRef?.getIsBlueUpdateCount()).toBe(2)
    expect(viewRef?.optionalLabel).toBeUndefined()
    expect(viewRef?.optionalCallback).toBeUndefined()

    rendered.unmount()
  })
})
