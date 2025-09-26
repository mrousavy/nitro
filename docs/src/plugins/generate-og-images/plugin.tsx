import React from "react";
import satori from "satori";
import { NitroOgCard } from "./NitroOgCard";
import fs from 'fs/promises'

interface Options {
}

export async function runPlugin(): Promise<void> {
  console.log('Rendering SVG...')
  const svg = await satori(
    <NitroOgCard title="Hello world" />,
    { fonts: [], width: 640, height: 480 }
  )
  console.log('Writing file...')
  await fs.writeFile('/tmp/image.svg', svg)
  console.log('Done!')
}
