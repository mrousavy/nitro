import type { HybridObjectSpec } from '../syntax/HybridObjectSpec.js'

interface IOSViewConfiguration {
  childComponentMethods: string
}

interface AndroidViewConfiguration {
  view: string
  viewManager: string
  viewImport: string
  viewManagerImport: string
  genericTypeParam: string
}

export function getIOSViewConfiguration(
  spec: HybridObjectSpec,
  component: string
): IOSViewConfiguration {
  const supportsChildren = spec.viewConfig?.allowChildren ?? false

  const childComponentMethods = supportsChildren
    ? `
// updates ${component}'s frame to match RCTViewComponentView's bounds
- (void)layoutSubviews {
    [super layoutSubviews];
    self.contentView.frame = self.bounds;
}

// Make sure ${component} is never overlaid by RCTViewComponentView
- (void)mountChildComponentView:(UIView<RCTComponentViewProtocol>*)childComponentView
                            index:(NSInteger)index {
    [self.contentView mountChildComponentView:childComponentView index:index];
}

- (void)unmountChildComponentView:(UIView<RCTComponentViewProtocol>*)childComponentView
                            index:(NSInteger)index {
    [self.contentView unmountChildComponentView:childComponentView index:index];
}
`
    : ''

  return {
    childComponentMethods,
  }
}

export function getAndroidViewConfiguration(
  spec: HybridObjectSpec
): AndroidViewConfiguration {
  const supportsChildren = spec.viewConfig?.allowChildren ?? false

  return {
    view: supportsChildren ? 'ReactViewGroup' : 'View',
    viewManager: supportsChildren ? 'ReactViewManager' : 'SimpleViewManager',
    viewImport: supportsChildren
      ? 'import com.facebook.react.views.view.ReactViewGroup'
      : 'import android.view.View',
    viewManagerImport: supportsChildren
      ? 'import com.facebook.react.views.view.ReactViewManager'
      : 'import com.facebook.react.uimanager.SimpleViewManager',
    genericTypeParam: supportsChildren ? '' : '<View>',
  }
}
