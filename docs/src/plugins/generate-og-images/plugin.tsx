import React from "react";
import satori from "satori";
import { NitroOgCard } from "./NitroOgCard";
import fs from 'fs/promises'
import path from 'path'

interface Options {
}

export async function runPlugin(): Promise<void> {
  const fontPath = path.join(process.cwd(), './static/fonts/ClashDisplay-Bold.otf');
  console.log('Loading font...', fontPath)
  const fontData = await fs.readFile(fontPath);

  console.log('Rendering SVG...')
  const svg = await satori(
    <NitroOgCard title="Hello!" />,
    { fonts: [
      {name: 'ClashDisplay-Bold', data: fontData }
    ], width: 640, height: 480 }
  )
  console.log(svg)
  console.log('Writing file...')
  await fs.writeFile('/tmp/image.svg', svg)
  console.log('Done!')
}
