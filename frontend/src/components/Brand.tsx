import { COLORS } from '../theme';

type Tone = 'light' | 'dark';

/**
 * Monograma "mira de caza" — círculo + retícula + punto central dorado.
 * Símbolo de precisión en la búsqueda de talento (executive search).
 * Fuente única del logo, compartida por login y por la cabecera de la app.
 */
export function Monograma({ tone = 'light', size = 40 }: { tone?: Tone; size?: number }) {
  const ring = tone === 'light' ? 'rgba(248,250,252,0.9)' : COLORS.navy;
  const cross = tone === 'light' ? 'rgba(248,250,252,0.55)' : 'rgba(15,23,42,0.45)';
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <circle cx="20" cy="20" r="15" stroke={ring} strokeWidth="1.6" />
      <circle cx="20" cy="20" r="7.5" stroke={ring} strokeWidth="1.6" />
      <path d="M20 1v9M20 30v9M1 20h9M30 20h9" stroke={cross} strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="20" cy="20" r="3" fill={COLORS.gold} />
    </svg>
  );
}

const MARK_SIZES = {
  sm: { ring: 30, text: 16, gap: 10 },
  md: { ring: 40, text: 19, gap: 12 },
  lg: { ring: 48, text: 22, gap: 14 },
} as const;

/**
 * Marca completa: monograma + logotipo "TheHunter.tech" con el punto en oro.
 * `tone` controla el color del texto según el fondo (claro sobre oscuro / oscuro sobre claro).
 */
export function Marca({
  tone = 'dark',
  size = 'md',
}: {
  tone?: Tone;
  size?: keyof typeof MARK_SIZES;
}) {
  const s = MARK_SIZES[size];
  return (
    <span
      className="brand-mark"
      style={{ gap: s.gap, fontSize: s.text, color: tone === 'light' ? '#f8fafc' : COLORS.navy }}
    >
      <Monograma tone={tone} size={s.ring} />
      <span className="brand-mark__word">
        TheHunter<span className="brand-mark__dot">.tech</span>
      </span>
    </span>
  );
}
