/**
 * Minimal, dependency-free Markdown → HTML renderer for blog content (Mission 3).
 * Content is authored by admins (trusted), so we render a practical subset: headings,
 * paragraphs, bold/italic, inline code, links, images, unordered/ordered lists,
 * blockquotes, fenced code blocks, horizontal rules, and YouTube embeds via `@[youtube](ID)`.
 * All raw text is HTML-escaped before inline formatting is applied.
 */
function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function inline(text: string): string {
  let t = esc(text)
  // images ![alt](src)
  t = t.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_m, alt, src) => `<img src="${src}" alt="${alt}" loading="lazy" />`)
  // links [text](url)
  t = t.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, label, url) => `<a href="${url}" rel="noopener">${label}</a>`)
  // bold **x**  then italic *x*  then inline code `x`
  t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  t = t.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>')
  t = t.replace(/`([^`]+)`/g, '<code>$1</code>')
  return t
}

export function renderMarkdown(md: string): string {
  const lines = md.replace(/\r\n/g, '\n').split('\n')
  const out: string[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // fenced code block
    if (/^```/.test(line)) {
      const code: string[] = []
      i++
      while (i < lines.length && !/^```/.test(lines[i])) code.push(lines[i++])
      i++ // closing fence
      out.push(`<pre><code>${esc(code.join('\n'))}</code></pre>`)
      continue
    }
    // blank line
    if (line.trim() === '') { i++; continue }
    // horizontal rule
    if (/^(---|\*\*\*|___)\s*$/.test(line)) { out.push('<hr />'); i++; continue }
    // youtube embed @[youtube](VIDEO_ID)
    const yt = line.match(/^@\[youtube\]\(([\w-]+)\)\s*$/)
    if (yt) {
      out.push(
        `<div class="blog-embed"><iframe src="https://www.youtube.com/embed/${yt[1]}" title="YouTube video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`,
      )
      i++
      continue
    }
    // heading
    const h = line.match(/^(#{1,4})\s+(.*)$/)
    if (h) { const lvl = h[1].length; out.push(`<h${lvl}>${inline(h[2])}</h${lvl}>`); i++; continue }
    // blockquote (consecutive >)
    if (/^>\s?/.test(line)) {
      const quote: string[] = []
      while (i < lines.length && /^>\s?/.test(lines[i])) quote.push(lines[i++].replace(/^>\s?/, ''))
      out.push(`<blockquote>${inline(quote.join(' '))}</blockquote>`)
      continue
    }
    // unordered list
    if (/^[-*+]\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^[-*+]\s+/.test(lines[i])) items.push(`<li>${inline(lines[i++].replace(/^[-*+]\s+/, ''))}</li>`)
      out.push(`<ul>${items.join('')}</ul>`)
      continue
    }
    // ordered list
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) items.push(`<li>${inline(lines[i++].replace(/^\d+\.\s+/, ''))}</li>`)
      out.push(`<ol>${items.join('')}</ol>`)
      continue
    }
    // paragraph (gather until blank)
    const para: string[] = []
    while (i < lines.length && lines[i].trim() !== '' && !/^(#{1,4}\s|>|[-*+]\s|\d+\.\s|```|---)/.test(lines[i])) para.push(lines[i++])
    out.push(`<p>${inline(para.join(' '))}</p>`)
  }

  return out.join('\n')
}
