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
              WebkitTextStrokeWidth: 50
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
