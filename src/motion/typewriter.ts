/**
 * Typewriter that never touches the text itself.
 *
 * The full sentence stays in the DOM from the first render, so screen readers,
 * search engines and copy/paste always get the whole text. Only its appearance
 * is revealed: the not-yet-typed part sits in a CSS Custom Highlight whose
 * colour is transparent, and a decorative cursor (an empty, aria-hidden
 * element) is moved with transforms. Browsers without the Highlight API simply
 * show the text.
 */

const HIGHLIGHT = 'typewriter-hidden'

type Hidden = { start: number; end: number }


export type TypeStep =
  | { type: 'type'; to: number; speed?: number }
  | { type: 'pause'; ms: number }

export const typewriterSupported = () =>
  typeof CSS !== 'undefined' && 'highlights' in CSS && typeof Highlight !== 'undefined'

export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Every character of an element, mapped to its text node and offset. */
class TextMap {
  nodes: { node: Text; start: number }[] = []
  length = 0
  full = ''

  constructor(root: Element) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const text = node as Text
      if (text.parentElement?.closest('[aria-hidden="true"]')) continue
      this.nodes.push({ node: text, start: this.length })
      this.length += text.data.length
    }
    this.full = this.nodes.map(entry => entry.node.data).join('')
  }

  text() { return this.full }

  point(index: number): [Text, number] {
    const clamped = Math.max(0, Math.min(index, this.length))
    for (let i = this.nodes.length - 1; i >= 0; i--) {
      const entry = this.nodes[i]
      if (clamped >= entry.start) return [entry.node, Math.min(clamped - entry.start, entry.node.data.length)]
    }
    return [this.nodes[0].node, 0]
  }

  range(from: number, to: number) {
    const range = document.createRange()
    range.setStart(...this.point(from))
    range.setEnd(...this.point(to))
    return range
  }

  /** The rectangle of one character, skipping invisible line-end spaces. */
  charRect(index: number): DOMRect | null {
    if (index < 0 || index >= this.length) return null
    const rects = this.range(index, index + 1).getClientRects()
    const rect = rects[rects.length - 1]
    return rect && rect.height > 0 ? rect : null
  }
}

const registry = () => {
  let highlight = CSS.highlights.get(HIGHLIGHT)
  if (!highlight) { highlight = new Highlight(); CSS.highlights.set(HIGHLIGHT, highlight) }
  return highlight
}

const wait = (ms: number, signal: AbortSignal) => new Promise<void>((resolve, reject) => {
  if (signal.aborted) return reject(signal.reason)
  const id = window.setTimeout(resolve, ms)
  signal.addEventListener('abort', () => { window.clearTimeout(id); reject(signal.reason) }, { once: true })
})

export class Typewriter {
  readonly map: TextMap
  readonly hidden: Hidden
  private range: Range | null = null
  private cursor: HTMLElement | null
  private root: HTMLElement
  private revealed: number

  /**
   * @param root   element whose text is typed
   * @param cursor decorative, empty element positioned inside `root`
   * @param from   text (or index) where typing starts; earlier text stays visible
   * @param to     text (or index) after which nothing is hidden
   */
  constructor(root: HTMLElement, cursor: HTMLElement | null, from: number | string = 0, to?: number | string) {
    this.root = root
    this.cursor = cursor
    this.map = new TextMap(root)
    const start = typeof from === 'string' ? Math.max(0, this.indexOf(from)) : from
    const end = to === undefined ? this.map.length : typeof to === 'string' ? this.indexAfter(to) : to
    this.hidden = { start, end }
    this.revealed = start
    if (!typewriterSupported()) return
    this.range = this.map.range(start, this.hidden.end)
    registry().add(this.range)
    root.dataset.typing = 'true'
    this.place()
  }

  /** Index of a substring in the element's text, for readable step lists. */
  indexAfter(text: string) {
    const at = this.map.text().indexOf(text)
    return at < 0 ? this.map.length : at + text.length
  }

  indexOf(text: string) { return this.map.text().indexOf(text) }

  reveal(index: number) {
    this.revealed = Math.min(index, this.hidden.end)
    if (this.range) this.range.setStart(...this.map.point(this.revealed))
    this.place()
  }

  /** Moves the cursor to the end of the last typed character. */
  place() {
    if (!this.cursor) return
    const box = this.root.getBoundingClientRect()
    const before = this.map.charRect(this.revealed - 1)
    const after = this.map.charRect(this.revealed)
    // At the start of a new line the cursor waits there, like an editor's caret.
    const nextLine = before && after && after.top >= before.bottom - 2
    const rect = nextLine ? after : before ?? after
    if (!rect) return
    const x = (before && !nextLine ? before.right : rect.left) - box.left
    this.cursor.style.setProperty('--tw-x', `${x}px`)
    this.cursor.style.setProperty('--tw-y', `${rect.top - box.top + rect.height * .14}px`)
    this.cursor.style.setProperty('--tw-h', `${rect.height * .74}px`)
  }

  async run(steps: TypeStep[], signal: AbortSignal) {
    if (!this.range) return
    for (const step of steps) {
      if (step.type === 'pause') {
        this.cursor?.classList.add('is-waiting')
        await wait(step.ms, signal)
        continue
      }
      this.cursor?.classList.remove('is-waiting')
      const speed = step.speed ?? 34
      while (this.revealed < step.to) {
        const char = this.map.text()[this.revealed]
        this.reveal(this.revealed + 1)
        // A little irregularity reads as typing rather than a progress bar.
        const jitter = .65 + Math.random() * .7
        await wait(char === ' ' ? speed * .6 : speed * jitter, signal)
      }
    }
  }

  /** Shows everything immediately and removes the highlight. */
  finish() {
    if (this.range) registry().delete(this.range)
    this.range = null
    delete this.root.dataset.typing
  }
}
