import React from "react";

export interface Props {
  title: string
}

export function NitroOgCard({ title }: Props): React.ReactElement {
  return (
    <div
      style={{
        width: '1200px',
        height: '630px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '64px',
        color: 'black',
      }}
    >
      <div style={{ fontSize: 64, color: "black", maxWidth: '100%' }}>
        Hello world!
      </div>
    </div>
  )
}
