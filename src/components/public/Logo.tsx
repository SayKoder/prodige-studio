import { SignatureTraces } from './Signature'

type LogoProps = {
  className?: string
}

/**
 * Logotype complet (lettrage + motif aperture) en `currentColor`.
 * Sur fill fixe en blanc, le logo disparaîtrait en thème clair : on hérite
 * donc de la couleur du texte (text-creme, réactive au thème) côté appelant.
 */
export default function Logo({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 1000 1000" fill="currentColor" className={className} role="img" aria-label="Prodige Studio">
      <text
        transform="translate(75.2 823.42)"
        style={{ fontFamily: 'var(--font-cinzel), Cinzel, serif', fontWeight: 600, fontSize: '194.77px' }}
      >
        <tspan x="0" y="0">P</tspan>
        <tspan x="121.54" y="0">r</tspan>
        <tspan x="243.27" y="0">od</tspan>
        <tspan x="535.82" y="0">i</tspan>
        <tspan x="601.27" y="0">g</tspan>
        <tspan x="740.92" y="0">e</tspan>
      </text>
      <text
        transform="translate(260.17 953.62)"
        style={{ fontFamily: 'var(--font-cinzel), Cinzel, serif', fontWeight: 600, fontSize: '129.85px' }}
      >
        <tspan x="0" y="0">S</tspan>
        <tspan x="70.64" y="0">t</tspan>
        <tspan x="148.03" y="0">u</tspan>
        <tspan x="239.31" y="0">d</tspan>
        <tspan x="335.27" y="0">i</tspan>
        <tspan x="378.9" y="0">o</tspan>
      </text>
      <SignatureTraces />
    </svg>
  )
}
