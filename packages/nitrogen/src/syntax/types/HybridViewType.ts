import { HybridObjectType } from './HybridObjectType.js'

export class HybridViewType extends HybridObjectType {
  get isHybridView(): boolean {
    return true
  }
}
