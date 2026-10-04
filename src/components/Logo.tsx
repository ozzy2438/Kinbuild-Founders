/**
 * The StartBeside mark: two different halves — one squared, one soft — meet in
 * the middle to make a doorway. Neither half can stand alone. The terracotta dot
 * is you at the threshold, and the full stop of “Don’t build alone.”
 * Keep the paths in sync with public/favicon.svg.
 */
export const markPaths = {
  left: 'M7 9H31V23H21V56H7Z',
  right: 'M33 9H49A8 8 0 0 1 57 17V49A7 7 0 0 1 43 49V26A3 3 0 0 0 40 23H33Z',
  dot: { cx: 32, cy: 51.5, r: 4.5 },
}

export function LogoMark({ className = '' }: { className?: string }) {
  return <svg className={`logo-mark ${className}`} viewBox="5 6.5 54 54" aria-hidden="true" focusable="false">
    <path className="logo-mark__half logo-mark__half--left" d={markPaths.left} />
    <path className="logo-mark__half logo-mark__half--right" d={markPaths.right} />
    <g className="logo-mark__dot-wrap"><circle className="logo-mark__dot" {...markPaths.dot} /></g>
  </svg>
}

/** Mark and wordmark. `assemble` plays the one-time arrival: the halves meet, then the dot lands. */
export default function Logo({ assemble = false }: { assemble?: boolean }) {
  return <span className={`logo ${assemble ? 'logo--assemble' : ''}`}><LogoMark /><span className="logo__word">StartBeside</span></span>
}
