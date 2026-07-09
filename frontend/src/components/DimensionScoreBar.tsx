import { Typography } from 'antd';
import { COLORS } from '../theme';

const { Text } = Typography;

// Color por tramo (mismo criterio systematic que el PDF ejecutivo).
function tierColor(score: number): string {
  if (score >= 90) return COLORS.gold;
  if (score >= 75) return COLORS.accent;
  if (score >= 55) return '#0EA5E9';
  return '#64748B';
}

// Barra de puntuación (0-100) de una dimensión, con barra proporcional y score /100.
export default function DimensionScoreBar({
  nombre,
  score,
  comentario,
}: {
  nombre: string;
  score: number;
  comentario?: string | null;
}) {
  const pct = Math.max(0, Math.min(100, score));
  const color = tierColor(pct);
  return (
    <div style={{ marginBottom: 14 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 5,
        }}
      >
        <Text style={{ color: '#1E293B', fontSize: 13 }}>{nombre}</Text>
        <Text style={{ whiteSpace: 'nowrap' }}>
          <span style={{ fontWeight: 700, color: COLORS.navy }}>{pct}</span>
          <span style={{ fontSize: 11, color: '#94A3B8' }}>/100</span>
        </Text>
      </div>
      <div style={{ height: 6, background: '#F1F5F9', borderRadius: 4, overflow: 'hidden' }}>
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: color,
            borderRadius: 4,
            transition: 'width .4s ease',
          }}
        />
      </div>
      {comentario && (
        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
          {comentario}
        </Text>
      )}
    </div>
  );
}
