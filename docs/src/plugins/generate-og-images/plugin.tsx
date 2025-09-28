import React from "react";
import satori, { Font } from "satori";
import { NitroOgCard, NitroOgCardProps } from "./NitroOgCard";
import fs from 'fs/promises'
import path from 'path'
import { DocsPage } from ".";
import { Resvg } from "@resvg/resvg-js";

interface Options {
  width: number
  height: number
  outDirectory: string
  docsPages: DocsPage[]
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
  url: 'nitro.margelo.com'
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

async function renderCard({ fonts, width, height, cardConfig, outputPath }: RenderProps): Promise<void> {
  console.log(`Rendering card with text "${cardConfig.title}"...`)
  const svg = await satori(
    <NitroOgCard {...cardConfig} />,
    { fonts: fonts, width: width, height: height }
  )
  const directory = path.dirname(outputPath)
  console.log('Converting SVG to PNG...')
  const png = svgToPng(svg)
  console.log(`Creating folder for "${directory}"...`)
  await fs.mkdir(directory, { recursive: true })
  console.log(`Writing file "${outputPath}"...`)
  await fs.writeFile(outputPath, png)
  console.log('Done!')
}

function svgToPng(svg: string): Buffer<ArrayBufferLike> {
  const resvg = new Resvg(svg, { fitTo: { mode: 'original' } })
  const image = resvg.render()
  return image.asPng()
}

export async function runPlugin({ width, height, outDirectory, docsPages }: Options): Promise<void> {
  const fonts = await Promise.all([
    loadFont('ClashDisplay', 'fonts/ClashDisplay-Bold.otf'),
    loadFont('Inter', 'fonts/Inter-Medium.ttf')
  ])
  const imgOutDirectory = path.join(outDirectory, 'img', 'social-cards')
  await fs.mkdir(imgOutDirectory, { recursive: true })

  console.log(`Generating SVGs in ${outDirectory}`)
  const defaultCardPath = path.join(imgOutDirectory, 'og-card.png')
  await renderCard({
    fonts: fonts,
    width: width,
    height: height,
    cardConfig: defaultCard,
    outputPath: defaultCardPath
  })

  const promises = docsPages.map(async (route) => {
    const outputPath = path.join(imgOutDirectory, `${route.id}.png`)
    await renderCard({
      fonts: fonts,
      width: width,
      height: height,
      cardConfig: {
        title: route.title,
        url: 'nitro.margelo.com'
      },
      outputPath: outputPath
    })
  })
  await Promise.all(promises)
}
