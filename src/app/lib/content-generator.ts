import Anthropic from "@anthropic-ai/sdk";

interface GeneratedContent {
  description: string;
  content: string;
  excerpt: string;
  categoryNames: string[];
  tagNames: string[];
}

const client = new Anthropic();

const SYSTEM_PROMPT = `You are a professional tech blog writer. You write in a clear, approachable, and engaging style for a developer audience. Your posts are well-structured with proper HTML formatting.

When given a blog post title, generate the full post content. Return ONLY valid JSON with this exact structure:
{
  "description": "A concise 1-2 sentence description/subtitle for the post",
  "content": "The full blog post content as HTML (use <h2>, <h3>, <p>, <ul>, <ol>, <li>, <code>, <pre>, <blockquote>, <strong>, <em> tags)",
  "excerpt": "A compelling 2-3 sentence excerpt for the post listing page",
  "categoryNames": ["Category1"],
  "tagNames": ["tag1", "tag2", "tag3"]
}

Guidelines for content:
- Write 800-1500 words of substantive content
- Use proper HTML tags — h2 for sections, h3 for subsections, p for paragraphs
- Include code examples in <pre><code> blocks where relevant
- Make content actionable and practical
- Do NOT wrap the JSON in markdown code fences`;

export async function generatePostContent(
  title: string,
  existingCategories: string[],
  existingTags: string[],
): Promise<GeneratedContent> {
  const userPrompt = `Write a blog post with the title: "${title}"

Existing categories to prefer (use one of these if appropriate, or suggest a new one): ${existingCategories.join(", ") || "none yet"}
Existing tags to prefer (reuse where relevant): ${existingTags.join(", ") || "none yet"}

Return only the JSON object.`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text content in API response");
  }

  const raw = textBlock.text.trim();
  // Strip markdown code fences if present
  const jsonStr = raw.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");

  let parsed: GeneratedContent;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error(`Failed to parse AI response as JSON: ${raw.slice(0, 200)}`);
  }

  if (!parsed.description || !parsed.content || !parsed.excerpt) {
    throw new Error("AI response missing required fields (description, content, excerpt)");
  }

  if (!Array.isArray(parsed.categoryNames)) parsed.categoryNames = [];
  if (!Array.isArray(parsed.tagNames)) parsed.tagNames = [];

  return parsed;
}
