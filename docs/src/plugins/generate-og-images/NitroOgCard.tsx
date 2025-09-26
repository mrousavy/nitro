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
        backgroundColor: '#0A84FF', // blue background
        color: 'white',
      }}
    >
      <div style={{ fontSize: 64, fontWeight: 600, lineHeight: 1.1, maxWidth: '100%' }}>
        {title}
      </div>
    </div>
  )
}
