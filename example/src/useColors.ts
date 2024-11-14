import { useColorScheme } from 'react-native'

type ColorScheme = {
  background: string
  oddBackground: string
  card: string
  foreground: string
  button: string
}
type ColorSchemeName = 'light' | 'dark'
type ColorSchemes = Record<ColorSchemeName, ColorScheme>

export const Colors: ColorSchemes = {
  light: {
    background: 'rgb(239, 249, 255)',
    oddBackground: 'rgb(224, 244, 255)',
    card: 'rgb(131, 199, 235)',
    foreground: 'rgb(36, 42, 63)',
    button: 'rgb(211, 46, 94)',
  },
  dark: {
    background: 'rgb(17, 22, 37)',
    oddBackground: 'rgb(32, 37, 52)',
    card: 'rgb(22, 30, 49)',
    foreground: 'rgb(189, 206, 219)',
    button: 'rgb(232, 72, 124)',
  },
}

export function useColors(): ColorScheme {
  const scheme = useColorScheme()
  if (scheme == null) {
    return Colors.light
  }
  return Colors[scheme]
}
