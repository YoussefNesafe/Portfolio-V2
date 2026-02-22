// src/app/lib/og/template.tsx

const COLORS = {
  bg: '#0A0A0F',
  cyan: '#06B6D4',
  purple: '#A855F7',
  muted: '#6B7280',
  white: '#F9FAFB',
  cyanDim: '#06B6D415',
  purpleDim: '#A855F710',
  subtleLine: '#6B728030',
}

type OGVariant = 'home' | 'blog' | 'post'

interface OGTemplateProps {
  variant: OGVariant
  title?: string
  description?: string
  categories?: string[]
  author?: string
}

export function OGTemplate({
  variant,
  title,
  description,
  categories = [],
  author = 'Youssef Nesafe',
}: OGTemplateProps) {
  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        backgroundColor: COLORS.bg,
        fontFamily: 'Geist',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Left accent bar: cyan → purple */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 6,
          height: '100%',
          background: `linear-gradient(180deg, ${COLORS.cyan}, ${COLORS.purple})`,
        }}
      />

      {/* Background glow: cyan top-right */}
      <div
        style={{
          position: 'absolute',
          top: -180,
          right: -180,
          width: 480,
          height: 480,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${COLORS.cyanDim} 0%, transparent 70%)`,
        }}
      />

      {/* Background glow: purple bottom-left */}
      <div
        style={{
          position: 'absolute',
          bottom: -160,
          left: 160,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${COLORS.purpleDim} 0%, transparent 70%)`,
        }}
      />

      {/* Main content area */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '56px 80px 56px 86px',
          width: '100%',
          position: 'relative',
        }}
      >
        {variant === 'home' && <HomeVariant />}
        {variant === 'blog' && <BlogVariant />}
        {variant === 'post' && (
          <PostVariant
            title={title ?? 'Blog Post'}
            description={description}
            categories={categories}
            author={author}
          />
        )}
      </div>
    </div>
  )
}

function HomeVariant() {
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {/* YN monogram badge */}
        <div
          style={{
            display: 'flex',
            width: 52,
            height: 52,
            borderRadius: 10,
            background: `linear-gradient(135deg, ${COLORS.cyan}, ${COLORS.purple})`,
            alignItems: 'center',
            justifyContent: 'center',
            color: COLORS.white,
            fontSize: 20,
            fontWeight: 700,
            marginBottom: 28,
          }}
        >
          YN
        </div>

        {/* Name */}
        <div
          style={{
            color: COLORS.white,
            fontSize: 68,
            fontWeight: 700,
            lineHeight: 1.05,
            marginBottom: 16,
          }}
        >
          Youssef Nesafe
        </div>

        {/* Title — gradient text */}
        <div
          style={{
            fontSize: 32,
            fontWeight: 700,
            background: `linear-gradient(90deg, ${COLORS.cyan}, ${COLORS.purple})`,
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            marginBottom: 20,
          }}
        >
          Senior Frontend Engineer
        </div>

        {/* Tagline */}
        <div style={{ color: COLORS.muted, fontSize: 22, lineHeight: 1.4 }}>
          6+ years building scalable, high-performance web applications
        </div>
      </div>

      {/* Domain footer */}
      <div style={{ color: COLORS.muted, fontSize: 18 }}>youssefnesafe.com</div>
    </>
  )
}

function BlogVariant() {
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {/* Label */}
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: COLORS.cyan,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            marginBottom: 20,
          }}
        >
          Blog
        </div>

        {/* Title */}
        <div
          style={{
            color: COLORS.white,
            fontSize: 62,
            fontWeight: 700,
            lineHeight: 1.05,
            marginBottom: 20,
          }}
        >
          Articles & Insights
        </div>

        {/* Subtitle */}
        <div style={{ color: COLORS.muted, fontSize: 24, lineHeight: 1.4 }}>
          Thoughts on frontend engineering, React, and modern web
        </div>
      </div>

      <div style={{ color: COLORS.muted, fontSize: 18 }}>youssefnesafe.com</div>
    </>
  )
}

interface PostVariantProps {
  title: string
  description?: string
  categories: string[]
  author: string
}

function PostVariant({ title, description, categories, author }: PostVariantProps) {
  return (
    <>
      {/* Category badges */}
      <div style={{ display: 'flex', gap: 10 }}>
        {categories.slice(0, 3).map((cat) => (
          <div
            key={cat}
            style={{
              display: 'flex',
              backgroundColor: `${COLORS.cyan}20`,
              color: COLORS.cyan,
              borderRadius: 6,
              padding: '6px 18px',
              fontSize: 16,
              fontWeight: 700,
            }}
          >
            {cat}
          </div>
        ))}
      </div>

      {/* Title + description */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div
          style={{
            color: COLORS.white,
            fontSize: 52,
            fontWeight: 700,
            lineHeight: 1.15,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {title}
        </div>

        {description && (
          <div
            style={{
              color: COLORS.muted,
              fontSize: 22,
              lineHeight: 1.5,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {description}
          </div>
        )}
      </div>

      {/* Footer: author + domain */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: `1px solid ${COLORS.subtleLine}`,
          paddingTop: 24,
        }}
      >
        <div style={{ color: COLORS.muted, fontSize: 20 }}>{author}</div>
        <div
          style={{
            fontSize: 20,
            fontWeight: 700,
            background: `linear-gradient(90deg, ${COLORS.cyan}, ${COLORS.purple})`,
            WebkitBackgroundClip: 'text',
            color: 'transparent',
          }}
        >
          youssefnesafe.com
        </div>
      </div>
    </>
  )
}
