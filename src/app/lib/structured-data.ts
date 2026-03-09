const SITE_URL = "https://youssefnesafe.com";

export function getWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Youssef Nesafe",
    url: SITE_URL,
    description:
      "Full-stack Software Engineer with 6+ years of experience building scalable, high-performance applications.",
    author: getPersonSchema(),
  };
}

export function getPersonSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Youssef Nesafe",
    url: SITE_URL,
    jobTitle: "Senior Frontend Engineer",
    description:
      "Full-stack Software Engineer with 6+ years of experience building scalable, high-performance applications.",
    knowsAbout: [
      "React",
      "TypeScript",
      "Next.js",
      "Node.js",
      "Frontend Engineering",
      "Trading Platforms",
    ],
    sameAs: [
      "https://github.com/youssefnesafe",
      "https://linkedin.com/in/youssefnesafe",
    ],
  };
}

export function getBlogPostingSchema(post: {
  title: string;
  description: string | null;
  slug: string;
  content: string;
  publishedAt: Date | null;
  updatedAt: Date;
  coverImage: string | null;
  author: { name: string } | null;
  categories: { name: string }[];
  tags: { name: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    url: `${SITE_URL}/blog/${post.slug}`,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    ...(post.coverImage && { image: post.coverImage }),
    author: {
      "@type": "Person",
      name: post.author?.name ?? "Youssef Nesafe",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Person",
      name: "Youssef Nesafe",
      url: SITE_URL,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${post.slug}`,
    },
    keywords: post.tags.map((t) => t.name).join(", "),
    articleSection: post.categories.map((c) => c.name).join(", "),
  };
}

export function getBreadcrumbSchema(
  items: { name: string; url: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
