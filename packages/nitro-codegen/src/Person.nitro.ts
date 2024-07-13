import type { HybridObject } from 'react-native-nitro-modules'

interface Item {
  price: number
}

interface Battery {
  capacity: number
}

enum Powertrain {
  ELECTRIC,
  GAS,
}

interface Car extends Item {
  make: string
  model: string
  battery?: Battery
  powertrain: Powertrain
}

interface Meal {
  isVegan: boolean
  tastyness: number
}

type Gender = 'male' | 'female'

export interface Person extends HybridObject<{ ios: 'c++'; android: 'c++' }> {
  readonly name: string
  readonly age: number
  isHappy: boolean
  sayHi(name: string): void
  favouriteNumbers: number[]
  favouriteMeals: Meal[]

  readonly gender: Gender

  car?: Car

  goToWork(): Promise<number>
}
