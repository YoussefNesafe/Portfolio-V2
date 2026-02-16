import type sanitizeHtml from "sanitize-html";

export const sanitizeOptions: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "br", "strong", "em", "u", "s", "b", "i",
    "h1", "h2", "h3", "h4", "h5", "h6",
    "a", "img",
    "ul", "ol", "li",
    "blockquote", "code", "pre",
    "table", "thead", "tbody", "tr", "th", "td",
    "hr", "div", "span", "figure", "figcaption",
    "sub", "sup", "mark",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "alt", "width", "height"],
    code: ["class"],
    pre: ["class"],
    span: ["class"],
    div: ["class"],
    td: ["colspan", "rowspan"],
    th: ["colspan", "rowspan"],
  },
  allowedSchemes: ["http", "https", "mailto"],
};
