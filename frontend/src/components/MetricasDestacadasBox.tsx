import { COLORS } from '../theme';

interface Metrica {
  valor: string;
  descripcion: string;
}

// Caja de métricas destacadas (KPI): regla superior en oro, valor grande en navy y
// descripción. Estilo "enterprise" coherente con el PDF ejecutivo.
export default function MetricasDestacadasBox({ metricas }: { metricas: Metrica[] }) {
  if (!metricas.length) return null;
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 12,
      }}
    >
      {metricas.map((m, i) => (
        <div
          key={i}
          style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: 12,
            padding: '18px 14px 16px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 24,
              height: 3,
              borderRadius: 2,
              background: COLORS.gold,
              margin: '0 auto 12px',
            }}
          />
          <div style={{ fontSize: 24, fontWeight: 800, color: COLORS.navy, lineHeight: 1.15 }}>
            {m.valor}
          </div>
          <div style={{ fontSize: 12, color: '#64748B', marginTop: 6, lineHeight: 1.4 }}>
            {m.descripcion}
          </div>
        </div>
      ))}
    </div>
  );
}
