import * as React from 'react'
import {
  describe,
  it,
  expect,
  render,
  cleanup,
  waitFor,
  afterEach,
} from 'react-native-harness'
import { callback } from 'react-native-nitro-modules'
import { TestView, type TestViewRef } from 'react-native-nitro-test'

type TestViewElementProps = React.ComponentProps<typeof TestView>
type OptionalTestViewProps = Partial<
  Pick<
    TestViewElementProps,
    'optionalString' | 'nullableString' | 'optionalCallback'
  >
>

// Prop-parsing errors are thrown during React's commit and are only
// observable through an error boundary - the test-runner's own boundary
// would swallow them and remount, masking the failure.
class CatchRenderErrors extends React.Component<
  { children: React.ReactNode; onError: (error: unknown) => void },
  { hasError: boolean }
> {
  state = { hasError: false }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch(error: unknown) {
    this.props.onError(error)
  }
  render() {
    return this.state.hasError ? null : this.props.children
  }
}

// React encodes "prop was removed" as `null` (not `undefined`) in the Fabric
// update payload, which used to crash Nitro's prop parsing:
// https://github.com/mrousavy/nitro/issues/1184
describe('TestView optional props', () => {
  afterEach(() => {
    cleanup()
  })

  async function renderTestView(initialProps: OptionalTestViewProps): Promise<{
    view: TestViewRef
    errors: unknown[]
    update: (newProps: OptionalTestViewProps) => void
    mountCount: () => number
  }> {
    const refs: TestViewRef[] = []
    const errors: unknown[] = []
    const hybridRef = callback((ref: TestViewRef) => {
      refs.push(ref)
    })
    let setPropsFromTest: ((props: OptionalTestViewProps) => void) | undefined
    function Wrapper(): React.ReactElement {
      const [optionalProps, setOptionalProps] = React.useState(initialProps)
      setPropsFromTest = setOptionalProps
      return (
        <TestView
          hybridRef={hybridRef}
          isBlue={false}
          hasBeenCalled={false}
          colorScheme="light"
          someCallback={callback(() => {})}
          {...optionalProps}
        />
      )
    }

    await render(
      <CatchRenderErrors onError={(error) => errors.push(error)}>
        <Wrapper />
      </CatchRenderErrors>
    )
    await waitFor(() => expect(refs.length).toBeGreaterThan(0))
    return {
      view: refs[0]!,
      errors,
      update: (newProps) => setPropsFromTest!(newProps),
      mountCount: () => refs.length,
    }
  }

  function expectNoRenderErrors(errors: unknown[]): void {
    if (errors.length > 0) {
      throw new Error(
        `Caught render error(s): ${errors.map((e) => String(e)).join('\n')}`
      )
    }
  }

  it('renders with optional props omitted', async () => {
    const { view, errors } = await renderTestView({})
    expect(view.optionalString).toBeUndefined()
    expect(view.optionalCallback).toBeUndefined()
    expectNoRenderErrors(errors)
  })

  it('clears optionalString when the prop is removed', async () => {
    const { view, errors, update, mountCount } = await renderTestView({
      optionalString: 'hello',
    })
    await waitFor(() => expect(view.optionalString).toBe('hello'))

    update({})
    await waitFor(() =>
      expect(errors.length > 0 || view.optionalString === undefined).toBe(true)
    )
    expectNoRenderErrors(errors)
    expect(view.optionalString).toBeUndefined()
    expect(mountCount()).toBe(1)
  })

  it('clears optionalString when the prop is set to undefined', async () => {
    const { view, errors, update, mountCount } = await renderTestView({
      optionalString: 'hello',
    })
    await waitFor(() => expect(view.optionalString).toBe('hello'))

    update({ optionalString: undefined })
    await waitFor(() =>
      expect(errors.length > 0 || view.optionalString === undefined).toBe(true)
    )
    expectNoRenderErrors(errors)
    expect(view.optionalString).toBeUndefined()
    expect(mountCount()).toBe(1)
  })

  it('can re-set optionalString after it was cleared', async () => {
    const { view, errors, update } = await renderTestView({
      optionalString: 'first',
    })
    await waitFor(() => expect(view.optionalString).toBe('first'))

    update({})
    await waitFor(() =>
      expect(errors.length > 0 || view.optionalString === undefined).toBe(true)
    )
    update({ optionalString: 'second' })
    await waitFor(() =>
      expect(errors.length > 0 || view.optionalString === 'second').toBe(true)
    )
    expectNoRenderErrors(errors)
    expect(view.optionalString).toBe('second')
  })

  it('clears optionalCallback when the prop is removed', async () => {
    const { view, errors, update, mountCount } = await renderTestView({
      optionalCallback: callback(() => {}),
    })
    await waitFor(() => expect(view.optionalCallback).toBeDefined())

    update({})
    await waitFor(() =>
      expect(errors.length > 0 || view.optionalCallback === undefined).toBe(
        true
      )
    )
    expectNoRenderErrors(errors)
    expect(view.optionalCallback).toBeUndefined()
    expect(mountCount()).toBe(1)
  })

  it('keeps explicit null for props that model null (nullableString)', async () => {
    const { view, errors, update } = await renderTestView({
      nullableString: 'hello',
    })
    await waitFor(() => expect(view.nullableString).toBe('hello'))

    // `string | null` props explicitly model `null`, so an explicit `null`
    // value must still arrive as `null` - not be swallowed into `undefined`.
    update({ nullableString: null })
    await waitFor(() =>
      expect(errors.length > 0 || view.nullableString === null).toBe(true)
    )
    expectNoRenderErrors(errors)
    expect(view.nullableString).toBeNull()
  })
})
