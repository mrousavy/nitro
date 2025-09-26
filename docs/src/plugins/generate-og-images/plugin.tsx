import React from "react";
import satori, { Font } from "satori";
import { NitroOgCard } from "./NitroOgCard";
import fs from 'fs/promises'
import path from 'path'

interface Options {
  width: number
  height: number
}

async function loadFont(fontName: string, filename: string): Promise<Font> {
  console.log(`Loading font '${fontName}' from ${filename}...`)
  const fontPath = path.join(__dirname, filename);
  const fontData = await fs.readFile(fontPath);
  console.log(`Font '${fontName}' loaded!`)
  return { name: fontName, data: fontData }
}

export async function runPlugin({ width, height }: Options): Promise<void> {
  const fonts = await Promise.all([
    loadFont('ClashDisplay', 'fonts/ClashDisplay-Bold.otf'),
    loadFont('Inter', 'fonts/Inter-Medium.ttf')
  ])

  console.log('Rendering SVG...')
  const svg = await satori(
    <NitroOgCard title="Hello world!" />,
    { fonts: fonts, width: width, height: height }
  )
  console.log(svg)
  console.log('Writing file...')
  await fs.writeFile('/tmp/image.svg', svg)
  console.log('Done!')
}
