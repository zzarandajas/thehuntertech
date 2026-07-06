import { Card, Typography } from 'antd';
import { COLORS } from '../theme';

const { Text } = Typography;

interface Metrica {
  valor: string;
  descripcion: string;
}

// Caja de métricas destacadas (valor grande + descripción). Reutilizable.
export default function MetricasDestacadasBox({ metricas }: { metricas: Metrica[] }) {
  if (!metricas.length) return null;
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: 12,
      }}
    >
      {metricas.map((m, i) => (
        <Card key={i} size="small" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 26, fontWeight: 700, color: COLORS.accent }}>{m.valor}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {m.descripcion}
          </Text>
        </Card>
      ))}
    </div>
  );
}
