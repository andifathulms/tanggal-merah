/**
 * The Tanggal Merah mark, inline.
 *
 * Four cells and a bracket: libur nasional in red, cuti bersama in amber, the
 * weekend they bridge into in tint, and the bracket underneath counting the
 * rentetan. It is the app's own arithmetic drawn small, which is why it sits
 * in the masthead rather than a generic logo would.
 *
 * Inline rather than an <img>: it is under half a kilobyte, stays crisp at any
 * size, needs no request, and cannot flash in late over the newsprint.
 *
 * Brand rule from the asset kit, and invariant 4 restated: red is always libur
 * nasional and amber always cuti bersama. Never swapped, never decorative.
 */
export function Mark({ className = 'h-9 w-9' }: { readonly className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden focusable="false">
      <rect x="0" y="0" width="100" height="100" rx="22.2" fill="#1C1810" />
      <rect x="12" y="38" width="16" height="16" rx="3" fill="#C8352E" />
      <rect x="32" y="38" width="16" height="16" rx="3" fill="#C97A2E" />
      <rect x="52" y="38" width="16" height="16" rx="3" fill="#F2D6D2" />
      <rect x="72" y="38" width="16" height="16" rx="3" fill="#F2D6D2" />
      <path
        d="M12 62 L12 68 L88 68 L88 62"
        fill="none"
        stroke="#F0EAD9"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
