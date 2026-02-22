// src/app/lib/og/fonts.ts
import fs from 'fs'
import path from 'path'

export async function loadFonts() {
  const fontBold = fs.readFileSync(
    path.join(process.cwd(), 'public/fonts/GeistSans-Bold.ttf')
  )

  return [
    {
      name: 'Geist',
      data: fontBold,
      weight: 700 as const,
      style: 'normal' as const,
    },
  ]
}
