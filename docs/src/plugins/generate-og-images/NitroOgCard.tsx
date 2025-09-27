import React from "react";

const BORDER_WIDTH = 5
const BORDER_RADIUS = 15
const LAYERS_SPACING = 29

const BLACK = 'rgb(34, 42, 65)'
const GRAY = 'rgb(93, 136, 167)'
const BLUE_1 = 'rgb(131, 199, 235)'
const BLUE_2 = 'rgb(81, 159, 199)'
const BLUE_3 = 'rgb(30, 106, 140)'

interface HeaderProps {
  text: string
}

function Header({ text }: HeaderProps): React.ReactElement {
  const SHADOW_STEPS = 15
  return (<>
    {Array(SHADOW_STEPS).fill(0).map((_, i) => {
      const isLast = i === (SHADOW_STEPS - 1)
      return (
        <div
          key={i}
          style={{
            position: isLast ? 'relative' : 'absolute',
            fontFamily: 'ClashDisplay',
            fontSize: 120,
            color: isLast ? "white" : BLACK,
            transform: `translate(${i}px, -${i}px)`,
            maxWidth: '100%',
            WebkitTextStrokeColor: BLACK,
            WebkitTextStrokeWidth: 15,
          }}
        >
          {text}
        </div>
      )
    })}
  </>)
}

export interface NitroOgCardProps {
  title: string
  subtitle?: string
  url?: string
}

export function NitroOgCard({ title, subtitle, url }: NitroOgCardProps): React.ReactElement {
  return (
    <div
      style={{
        display: 'flex',
        flex: 1,
        height: '100%',
        backgroundColor: BLUE_3,
        paddingRight: LAYERS_SPACING,
        paddingBottom: LAYERS_SPACING,
      }}
    >
      <div
        style={{
          display: 'flex',
          flex: 1,
          height: '100%',
          backgroundColor: BLUE_2,
          borderBottomWidth: BORDER_WIDTH,
          borderRightWidth: BORDER_WIDTH,
          borderColor: BLACK,
          borderBottomRightRadius: BORDER_RADIUS,
          paddingRight: LAYERS_SPACING,
          paddingBottom: LAYERS_SPACING,
        }}
      >
        <div
          style={{
            display: 'flex',
            flex: 1,
            height: '100%',
            backgroundColor: BLUE_1,
            borderBottomWidth: BORDER_WIDTH,
            borderRightWidth: BORDER_WIDTH,
            borderColor: BLACK,
            borderBottomRightRadius: BORDER_RADIUS,
            paddingLeft: '9%',
            paddingTop: '6%',
            flexDirection: 'column'
          }}
        >
          <Header text={title} />

          {subtitle != null && (
            <div
              style={{
                paddingTop: '5%',
                maxWidth: '70%',
                fontFamily: 'Inter',
                color: BLACK,
                fontSize: 39
              }}
            >
              {subtitle}
            </div>
          )}

          {url != null && (
            <div
              style={{
                paddingTop: '6%',
                fontFamily: 'Inter',
                color: GRAY,
                fontSize: 38
              }}
            >
              {url}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
