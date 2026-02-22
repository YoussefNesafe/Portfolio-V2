// src/app/(public)/blog/opengraph-image.tsx
import { ImageResponse } from 'next/og'
import { OGTemplate } from '@/app/lib/og/template'
import { loadFonts } from '@/app/lib/og/fonts'

export const alt = 'Blog | Articles & Insights — Youssef Nesafe'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OGImage() {
  const fonts = await loadFonts()

  return new ImageResponse(<OGTemplate variant="blog" />, {
    ...size,
    fonts,
  })
}
