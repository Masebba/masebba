const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "b",
  "i",
  "em",
  "strong",
  "u",
  "s",
  "a",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "li",
  "blockquote",
  "pre",
  "code",
  "img",
  "figure",
  "figcaption",
  "hr",
  "span",
  "div",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
]);

const GLOBAL_ALLOWED_ATTRS = new Set([
  "class",
  "title",
  "aria-label",
  "aria-hidden",
  "role",
]);

const PER_TAG_ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(["href", "target", "rel", "title"]),
  img: new Set(["src", "alt", "width", "height", "title"]),
  table: new Set(["cellpadding", "cellspacing"]),
  th: new Set(["colspan", "rowspan", "scope"]),
  td: new Set(["colspan", "rowspan"]),
};

function isSafeUrl(raw: string): boolean {
  const value = raw.trim().toLowerCase();
  return (
    value.startsWith("http:") ||
    value.startsWith("https:") ||
    value.startsWith("mailto:") ||
    value.startsWith("tel:") ||
    value.startsWith("data:image/") ||
    value === "#"
  );
}

export function sanitizeHtml(html: string): string {
  if (!html) return "";

  const doc = new DOMParser().parseFromString(html, "text/html");

  doc
    .querySelectorAll("script, iframe, object, embed, link, meta, base, style")
    .forEach((node) => node.remove());

  const walk = (node: ParentNode) => {
    Array.from(node.childNodes).forEach((child) => {
      if (child.nodeType !== Node.ELEMENT_NODE) return;

      const el = child as Element;
      const tagName = el.tagName.toLowerCase();

      if (!ALLOWED_TAGS.has(tagName)) {
        const text = doc.createTextNode(el.textContent || "");
        el.replaceWith(text);
        return;
      }

      Array.from(el.attributes).forEach((attr) => {
        const attrName = attr.name.toLowerCase();
        const attrValue = attr.value.trim();

        const allowedForTag = PER_TAG_ALLOWED_ATTRS[tagName] ?? new Set<string>();
        const isAllowed =
          GLOBAL_ALLOWED_ATTRS.has(attrName) || allowedForTag.has(attrName);

        if (!isAllowed) {
          el.removeAttribute(attr.name);
          return;
        }

        if ((attrName === "href" || attrName === "src") && !isSafeUrl(attrValue)) {
          el.removeAttribute(attr.name);
          return;
        }

        if (attrName.startsWith("on")) {
          el.removeAttribute(attr.name);
        }
      });

      if (tagName === "a") {
        const target = el.getAttribute("target");
        if (target === "_blank") {
          el.setAttribute("rel", "noopener noreferrer");
        }
      }

      walk(el);
    });
  };

  walk(doc.body);
  return doc.body.innerHTML;
}
