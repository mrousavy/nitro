
@frozen
public enum Variant2<First, Second> {
  case first(First)
  case second(Second)
}

@frozen
public enum Variant3<First, Second, Third> {
  case first(First)
  case second(Second)
  case third(Third)
}

@frozen
public enum Variant4<First, Second, Third, Fourth> {
  case first(First)
  case second(Second)
  case third(Third)
  case fourth(Fourth)
}

@frozen
public enum Variant5<First, Second, Third, Fourth, Fifth> {
  case first(First)
  case second(Second)
  case third(Third)
  case fourth(Fourth)
  case fifth(Fifth)
}
