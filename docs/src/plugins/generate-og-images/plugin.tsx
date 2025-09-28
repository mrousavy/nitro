import React from "react";
import satori, { Font } from "satori";
import { NitroOgCard, NitroOgCardProps } from "./NitroOgCard";
import fs from 'fs/promises'
import path from 'path'
import { DocsPage } from ".";
import sharp from "sharp";
import * as cheerio from 'cheerio';

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
  const png = await svgToPng(svg)
  console.log(`Creating folder for "${directory}"...`)
  await fs.mkdir(directory, { recursive: true })
  console.log(`Writing file "${outputPath}"...`)
  await fs.writeFile(outputPath, png)
  console.log('Done!')
}

async function svgToPng(svg: string): Promise<Buffer<ArrayBufferLike>> {
  const buffer = Buffer.from(svg)
  const png = await sharp(buffer).png().toBuffer()
  return png
}

async function replaceMetaTags(fileName: string, tagNames: string[], tagValue: string): Promise<void> {
  const html = await fs.readFile(fileName, "utf8");
  const $ = cheerio.load(html);
  const queries = tagNames.map((tagName) => `meta[${tagName}]`)
  const $meta = $(queries.join(', '));
  $meta.attr('content', tagValue)
  const updatedHtml = $.html()
  await fs.writeFile(fileName, updatedHtml)
}

export async function runPlugin({ width, height, outDirectory, docsPages }: Options): Promise<void> {
  const fonts = await Promise.all([
    loadFont('ClashDisplay', 'fonts/ClashDisplay-Bold.otf'),
    loadFont('Inter', 'fonts/Inter-Medium.ttf')
  ])
  const rootImgDirectory = path.join('/img', 'social-cards')
  const imgOutDirectory = path.join(outDirectory, rootImgDirectory)
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

  console.log(`Generated ${promises.length + 1} cards!`)

  const docsDirectory = path.join(outDirectory, 'docs')
  const docsFiles = await fs.readdir(docsDirectory, { recursive: true, withFileTypes: true })
  for (const filename of docsFiles) {
    if (!filename.isFile()) {
      // skip non-files
      continue
    }
    const filePath = path.join(filename.parentPath, filename.name)
    // /Users/mrousavy/Projects/nitro/docs/build/docs/example.html -> example.html
    const relativeDocsPath = path.relative(docsDirectory, filePath)
    // example.html -> example
    const routeId = relativeDocsPath.split('.')[0]
    // example -> /img/example.png
    const cardPath = path.join(rootImgDirectory, `${routeId}.png`)
    await replaceMetaTags(filePath, ['property="og:image"', 'name="twitter:image"'], cardPath)
  }
}
