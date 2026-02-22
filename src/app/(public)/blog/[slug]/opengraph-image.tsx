// src/app/(public)/blog/[slug]/opengraph-image.tsx
import { ImageResponse } from 'next/og'
import { cache } from 'react'
import { db } from '@/app/lib/db'
import { POST_INCLUDE_FULL } from '@/app/api/blog/helpers/prisma-includes'
import { OGTemplate } from '@/app/lib/og/template'
import { loadFonts } from '@/app/lib/og/fonts'

const getPost = cache(async (slug: string) => {
  return db.post.findUnique({
    where: { slug },
    include: POST_INCLUDE_FULL,
  })
})

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OGImage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPost(slug)
  const fonts = await loadFonts()

  return new ImageResponse(
    <OGTemplate
      variant="post"
      title={post?.title ?? 'Blog Post'}
      description={post?.description ?? undefined}
      categories={post?.categories?.map((c) => c.name) ?? []}
      author={post?.author?.name ?? 'Youssef Nesafe'}
    />,
    { ...size, fonts }
  )
}
