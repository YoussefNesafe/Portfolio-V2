/**
 * Convert a string to a URL-friendly slug
 * Example: "Hello World!" -> "hello-world"
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // remove special characters
    .replace(/[\s_-]+/g, "-") // replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ""); // remove hyphens from start and end
}

/**
 * Create a unique slug by checking for conflicts
 * If slug exists, append a number
 */
export async function generateUniqueSlug(
  baseSlug: string,
  existingSlug?: string,
  checkFn?: (slug: string) => Promise<boolean>,
): Promise<string> {
  // If it's the same as existing, return it
  if (existingSlug && baseSlug === existingSlug) {
    return baseSlug;
  }

  // If no check function provided, just return base slug
  if (!checkFn) {
    return baseSlug;
  }

  let slug = baseSlug;
  let counter = 1;

  while (await checkFn(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}
