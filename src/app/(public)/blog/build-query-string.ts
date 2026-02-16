interface QueryParams {
  search?: string;
  category?: string;
  tag?: string;
}

export function buildQueryString(
  currentParams: QueryParams,
  overrides: Record<string, string>,
): string {
  const p = new URLSearchParams();
  if (currentParams.search) p.set("search", currentParams.search);
  if (currentParams.category) p.set("category", currentParams.category);
  if (currentParams.tag) p.set("tag", currentParams.tag);
  for (const [key, value] of Object.entries(overrides)) {
    p.set(key, value);
  }
  if (!overrides.page) p.set("page", "1");
  return `?${p.toString()}`;
}
