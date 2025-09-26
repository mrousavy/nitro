import React from "react";

export interface Props {
  title: string
}

export function NitroOgCard({ title }: Props): React.ReactElement {
  return (
    <div
      style={{
        display: 'flex',
        flex: 1,
        height: '100%',
        backgroundColor: 'rgb(46, 93, 127)',
            paddingRight: 25,
            paddingBottom: 25,
      }}
    >
      <div
        style={{
          display: 'flex',
          flex: 1,
          height: '100%',
          backgroundColor: 'rgb(89, 146, 189)',
          borderBottomWidth: 2,
          borderRightWidth: 2,
          borderColor: 'rgb(32, 37, 56)',
          paddingRight: 25,
          paddingBottom: 25,
          borderBottomRightRadius: 15,
        }}
      >
        <div
          style={{
            display: 'flex',
            flex: 1,
            height: '100%',
            backgroundColor: 'rgb(134, 189, 229)',
            borderBottomWidth: 2,
            borderRightWidth: 2,
            borderColor: 'rgb(32, 37, 56)',
            borderBottomRightRadius: 15,
          }}
        >
          <div style={{ fontSize: 64, color: "black", maxWidth: '100%' }}>
            Hello world!
          </div>
        </div>
      </div>
    </div>
  )
}
