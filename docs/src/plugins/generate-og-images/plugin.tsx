import React from "react";
import satori, { Font } from "satori";
import { NitroOgCard } from "./NitroOgCard";
import fs from 'fs/promises'
import path from 'path'

interface Options {
}

async function loadFont(filename: string): Promise<Font> {
  console.log(`Loading font '${filename}'...`)
  const fontPath = path.join(__dirname, filename);
  const fontData = await fs.readFile(fontPath);
  console.log(`Font '${filename}' loaded!`)
  return { name: filename, data: fontData }
}

export async function runPlugin(): Promise<void> {
  const [clasDisplay, satoshi] = await Promise.all([loadFont('ClashDisplay-Bold.otf'), loadFont('Satoshi-Bold.otf')])

  console.log('Rendering SVG...')
  const svg = await satori(
    <NitroOgCard title="Hello world!" />,
    { fonts: [clasDisplay, satoshi], width: 640, height: 480 }
  )
  console.log(svg)
  console.log('Writing file...')
  await fs.writeFile('/tmp/image.svg', svg)
  console.log('Done!')
}
