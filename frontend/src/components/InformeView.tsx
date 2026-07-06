import { Card, Divider, Space, Tag, Typography } from 'antd';
import type { SnapshotInforme } from '../api/informes';
import DimensionScoreBar from './DimensionScoreBar';
import MetricasDestacadasBox from './MetricasDestacadasBox';
import FortalezasTable from './FortalezasTable';
import { COLORS } from '../theme';

const { Title, Text, Paragraph } = Typography;

// Render del informe a partir del snapshot. Fiel al modelo de referencia (score bars,
// métricas destacadas, fortalezas/puntos a explorar). Usado en la vista privada y pública.
export default function InformeView({ snapshot }: { snapshot: SnapshotInforme }) {
  const { proceso, candidatos } = snapshot;

  return (
    <div>
      <div
        style={{
          background: COLORS.navy,
          color: '#fff',
          padding: 24,
          borderRadius: 8,
          marginBottom: 16,
        }}
      >
        <Title level={3} style={{ color: '#fff', margin: 0 }}>
          {proceso.titulo}
        </Title>
        <Text style={{ color: '#cbd5e1' }}>
          {proceso.cliente} · {proceso.vertical}
        </Text>
        <Paragraph style={{ color: '#94a3b8', margin: '8px 0 0', fontSize: 12 }}>
          {proceso.confidencialidad}
        </Paragraph>
      </div>

      {candidatos.length === 0 && (
        <Card>
          <Text type="secondary">Este informe no incluye candidatos.</Text>
        </Card>
      )}

      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        {candidatos.map((c, i) => {
          const observaciones = [
            ...c.observaciones.fortalezas.map((texto) => ({ tipo: 'fortaleza' as const, texto })),
            ...c.observaciones.puntosExplorar.map((texto) => ({
              tipo: 'punto_explorar' as const,
              texto,
            })),
          ];
          return (
            <Card key={i}>
              <Space style={{ justifyContent: 'space-between', width: '100%' }} align="center">
                <Title level={4} style={{ margin: 0 }}>
                  {c.nombre}
                </Title>
                <Tag>{c.etapa}</Tag>
              </Space>

              {c.metricas.length > 0 && (
                <div style={{ margin: '16px 0' }}>
                  <MetricasDestacadasBox metricas={c.metricas} />
                </div>
              )}

              {c.scores.length > 0 && (
                <>
                  <Divider orientation="left" plain>
                    Evaluación por dimensión
                  </Divider>
                  {c.scores.map((s, j) => (
                    <DimensionScoreBar
                      key={j}
                      nombre={s.dimension}
                      score={s.score}
                      comentario={s.comentario}
                    />
                  ))}
                </>
              )}

              {observaciones.length > 0 && (
                <>
                  <Divider orientation="left" plain>
                    Valoración cualitativa
                  </Divider>
                  <FortalezasTable observaciones={observaciones} />
                </>
              )}
            </Card>
          );
        })}
      </Space>
    </div>
  );
}
