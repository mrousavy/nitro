import React from "react";
import satori, { Font } from "satori";
import { NitroOgCard, NitroOgCardProps } from "./NitroOgCard";
import fs from 'fs/promises'
import path from 'path'

interface Options {
  width: number
  height: number
  docsDirectory: string
  routes: string[]
}

async function loadFont(fontName: string, filename: string): Promise<Font> {
  console.log(`Loading font '${fontName}' from ${filename}...`)
  const fontPath = path.join(__dirname, filename);
  const fontData = await fs.readFile(fontPath);
  console.log(`Font '${fontName}' loaded!`)
  return { name: fontName, data: fontData }
}

const defaultCard: NitroOgCardProps = {
  title: 'NitroModules',
  subtitle: 'A framework to build mindblowingly fast native modules with type-safe statically compiled JS bindings.',
  url: 'margelo.com'
}

async function getCardConfig(docsPage: string): Promise<NitroOgCardProps> {
  const buffer = await fs.readFile(docsPage)
  const content = buffer.toString()
  return defaultCard
}

interface RenderProps {
  fonts: Font[]
  width: number
  height: number
  cardConfig: NitroOgCardProps
  outputPath: string
}

async function renderSVG({ fonts, width, height, cardConfig, outputPath }: RenderProps): Promise<void> {
  console.log(`Rendering card with text "${cardConfig.title}"...`)
  const svg = await satori(
    <NitroOgCard {...cardConfig} />,
    { fonts: fonts, width: width, height: height }
  )
  console.log('Writing file...')
  await fs.writeFile(outputPath, svg)
  console.log('Done!')
}

export async function runPlugin({ width, height, docsDirectory, routes }: Options): Promise<void> {
  const fonts = await Promise.all([
    loadFont('ClashDisplay', 'fonts/ClashDisplay-Bold.otf'),
    loadFont('Inter', 'fonts/Inter-Medium.ttf')
  ])

  console.log(`Generating SVGs in ${docsDirectory}`)
  const defaultCardPath = path.join(docsDirectory, 'img', 'og-card.svg')
  await renderSVG({
    fonts: fonts,
    width: width,
    height: height,
    cardConfig: defaultCard,
    outputPath: defaultCardPath
  })
}
