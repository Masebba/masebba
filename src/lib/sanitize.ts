/**
 * Basic HTML sanitizer — strips dangerous tags/attributes while keeping safe formatting.
 * For production, consider using DOMPurify package instead.
 */
const ALLOWED_TAGS = new Set([
'p',
'br',
'b',
'i',
'em',
'strong',
'u',
's',
'a',
'h1',
'h2',
'h3',
'h4',
'h5',
'h6',
'ul',
'ol',
'li',
'blockquote',
'pre',
'code',
'img',
'figure',
'figcaption',
'hr',
'span',
'div',
'table',
'thead',
'tbody',
'tr',
'th',
'td']
);

const ALLOWED_ATTRS = new Set([
'href',
'src',
'alt',
'title',
'class',
'target',
'rel',
'width',
'height']
);

export function sanitizeHtml(html: string): string {
  if (!html) return '';

  // Create a temporary DOM element to parse the HTML
  const doc = new DOMParser().parseFromString(html, 'text/html');

  function cleanNode(node: Node): void {
    const children = Array.from(node.childNodes);
    for (const child of children) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const el = child as Element;
        const tagName = el.tagName.toLowerCase();

        // Remove script, style, iframe, object, embed tags entirely
        if (!ALLOWED_TAGS.has(tagName)) {
          // Keep text content, remove the tag
          const text = document.createTextNode(el.textContent || '');
          node.replaceChild(text, child);
          continue;
        }

        // Remove disallowed attributes
        const attrs = Array.from(el.attributes);
        for (const attr of attrs) {
          if (!ALLOWED_ATTRS.has(attr.name.toLowerCase())) {
            el.removeAttribute(attr.name);
          }
          // Prevent javascript: URLs
          if (
          (attr.name === 'href' || attr.name === 'src') &&
          attr.value.trim().toLowerCase().startsWith('javascript:'))
          {
            el.removeAttribute(attr.name);
          }
        }

        // Force external links to have safe attributes
        if (tagName === 'a') {
          el.setAttribute('rel', 'noopener noreferrer');
        }

        cleanNode(child);
      }
    }
  }

  cleanNode(doc.body);
  return doc.body.innerHTML;
}