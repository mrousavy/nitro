import { getHostComponent } from 'react-native-nitro-modules'
import TestViewConfig from '../../nitrogen/generated/shared/json/TestViewConfig.json'

/**
 * Represents the HybridView `TestView`, which can be rendered as a React Native view.
 */
export const TestView = getHostComponent('TestView', () => TestViewConfig)
