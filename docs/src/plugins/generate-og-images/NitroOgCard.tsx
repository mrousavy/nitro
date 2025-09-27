import React from "react";

export interface Props {
  title: string
}

const BORDER_WIDTH = 5
const BORDER_RADIUS = 15
const LAYERS_SPACING = 29

const BLACK = 'rgb(34, 42, 65)'
const GRAY = 'rgb(93, 136, 167)'
const BLUE_1 = 'rgb(131, 199, 235)'
const BLUE_2 = 'rgb(81, 159, 199)'
const BLUE_3 = 'rgb(30, 106, 140)'

function generateTextShadow(distanceH: number, distanceV: number): string {
  const STEP = 0.5
  let counterH = 0
  let counterV = 0

  const shadows: string[] = []
  const stepCount = Math.max(Math.abs(distanceH), Math.abs(distanceV)) / STEP
  for (let i = 0; i < stepCount; i++) {
    shadows.push(`${counterH}px ${counterV}px 0px ${BLACK}`)
    counterH += distanceH / stepCount
    counterV += distanceV / stepCount
  }
  return shadows.join(', ')
}

const textShadow = generateTextShadow(-20, 15)

const steps = 28;                 // extrusion length
const color = '#223048';          // shadow color
const dx = -1, dy = 1;            // direction: bottom-left
const extrude = Array.from({length: steps},
  (_, i) => `drop-shadow(${dx*(i+1)}px ${dy*(i+1)}px 0 ${color})`
).join(' ');
console.log(extrude)

export function NitroOgCard({ title }: Props): React.ReactElement {
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
          <div
            style={{
              fontFamily: 'ClashDisplay',
              fontSize: 120,
              color: "white",
              maxWidth: '100%',
              WebkitTextStrokeColor: BLACK,
              WebkitTextStrokeWidth: 14,
              paintOrder: 'stroke fill',
              filter: `${extrude} drop-shadow(0 6px 8px rgba(0,0,0,.25))`, // soft ambient
            }}
          >
            NitroModules
          </div>

          <div
            style={{
              paddingTop: '5%',
              maxWidth: '70%',
              fontFamily: 'Inter',
              color: BLACK,
              fontSize: 39
            }}
          >
            A framework to build mindblowingly fast native modules with type-safe statically compiled JS bindings.
          </div>

          <div
            style={{
              paddingTop: '6%',
              fontFamily: 'Inter',
              color: GRAY,
              fontSize: 38
            }}
          >
            margelo.com
          </div>
        </div>
      </div>
    </div>
  )
}
