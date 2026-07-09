import { Card, Space, Tag, Timeline, Typography } from 'antd';
import type { SnapshotInforme, SnapshotCandidato } from '../api/informes';
import { Monograma } from './Brand';
import DimensionScoreBar from './DimensionScoreBar';
import MetricasDestacadasBox from './MetricasDestacadasBox';
import FortalezasTable from './FortalezasTable';
import { COLORS } from '../theme';

const { Title, Text } = Typography;

// Encabezado de sección: tick dorado + título navy + hairline. Réplica del PDF.
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ margin: '22px 0 12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 4, height: 15, borderRadius: 2, background: COLORS.gold }} />
        <span style={{ fontSize: 15, fontWeight: 700, color: COLORS.navy }}>{children}</span>
      </div>
      <div style={{ height: 1, background: '#E2E8F0', marginTop: 8 }} />
    </div>
  );
}

// Tabla de datos del candidato (clave/valor), filtrando campos vacíos.
function DatosCandidato({ c }: { c: SnapshotCandidato }) {
  const filas: [string, string | null | undefined][] = [
    ['Posición actual', c.posicionActualSnapshot],
    ['Ciudad', c.ciudad],
    ['Idiomas', c.idiomas],
    ['Formación', c.formacion],
    ['Expectativa salarial', c.expectativaSalarial],
  ];
  const visibles = filas.filter(([, v]) => v != null && String(v).trim() !== '');
  if (!visibles.length) return null;
  return (
    <div style={{ border: '1px solid #E2E8F0', borderRadius: 12, overflow: 'hidden' }}>
      {visibles.map(([k, v], i) => (
        <div
          key={k}
          style={{
            display: 'flex',
            borderTop: i === 0 ? 'none' : '1px solid #EEF2F7',
          }}
        >
          <div
            style={{
              width: 190,
              flexShrink: 0,
              background: '#F8FAFC',
              padding: '11px 14px',
              fontWeight: 600,
              color: '#475569',
              fontSize: 13,
            }}
          >
            {k}
          </div>
          <div style={{ padding: '11px 16px', color: '#0F172A', fontSize: 13.5 }}>{v}</div>
        </div>
      ))}
    </div>
  );
}

const ETAPA_LABEL: Record<string, string> = {
  sourcing: 'Sourcing',
  longlist: 'Longlist',
  shortlist: 'Shortlist',
  presentado: 'Presentado',
  entrevista_cliente: 'Entrevista cliente',
  oferta: 'Oferta',
  contratado: 'Contratado',
  descartado: 'Descartado',
};

function CandidatoCard({ c, idx }: { c: SnapshotCandidato; idx: number }) {
  const trayectoria = c.trayectoria ?? [];
  const observaciones = [
    ...c.observaciones.fortalezas.map((texto) => ({ tipo: 'fortaleza' as const, texto })),
    ...c.observaciones.puntosExplorar.map((texto) => ({ tipo: 'punto_explorar' as const, texto })),
  ];

  return (
    <Card styles={{ body: { padding: 0 } }} style={{ overflow: 'hidden' }}>
      {/* Ribbon navy */}
      <div
        style={{
          background: COLORS.navy,
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ color: COLORS.gold, fontWeight: 800, fontSize: 15 }}>#{idx + 1}</span>
          <span style={{ color: '#CBD5E1', fontSize: 13 }}>Candidato:</span>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>{c.nombre}</span>
        </div>
        {c.etapa && (
          <Tag
            style={{
              background: 'rgba(255,255,255,0.12)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.35)',
              borderRadius: 20,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              fontSize: 11,
              margin: 0,
            }}
          >
            {ETAPA_LABEL[c.etapa] ?? c.etapa}
          </Tag>
        )}
      </div>

      <div style={{ padding: 20 }}>
        <DatosCandidato c={c} />

        {c.metricas.length > 0 && (
          <>
            <SectionTitle>Métricas destacadas</SectionTitle>
            <MetricasDestacadasBox metricas={c.metricas} />
          </>
        )}

        {trayectoria.length > 0 && (
          <>
            <SectionTitle>Trayectoria profesional destacada</SectionTitle>
            <Timeline
              style={{ paddingTop: 4 }}
              items={trayectoria.map((x) => ({
                color: COLORS.accent,
                children: (
                  <div>
                    <div style={{ fontSize: 13.5 }}>
                      <span style={{ fontWeight: 700, color: COLORS.navy }}>{x.empresa}</span>
                      {(x.cargo || x.periodo) && (
                        <span style={{ color: '#64748B' }}>
                          {' — '}
                          {x.cargo}
                          {x.periodo ? ` (${x.periodo})` : ''}
                        </span>
                      )}
                    </div>
                    {x.descripcion && (
                      <div style={{ color: '#475569', fontSize: 13, marginTop: 2 }}>
                        {x.descripcion}
                      </div>
                    )}
                  </div>
                ),
              }))}
            />
          </>
        )}

        {c.scores.length > 0 && (
          <>
            <SectionTitle>Evaluación por dimensiones clave del rol</SectionTitle>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                columnGap: 28,
              }}
            >
              {c.scores.map((s, j) => (
                <DimensionScoreBar
                  key={j}
                  nombre={s.dimension}
                  score={s.score}
                  comentario={s.comentario}
                />
              ))}
            </div>
          </>
        )}

        {observaciones.length > 0 && (
          <>
            <SectionTitle>Fortalezas y puntos a explorar</SectionTitle>
            <FortalezasTable observaciones={observaciones} />
          </>
        )}
      </div>
    </Card>
  );
}

// Render del informe a partir del snapshot. Réplica enterprise del informe ejecutivo
// (datos, métricas, trayectoria, evaluación por dimensiones, fortalezas/puntos).
// Usado en la vista privada y en la pública.
export default function InformeView({ snapshot }: { snapshot: SnapshotInforme }) {
  if (!snapshot || !snapshot.proceso) {
    return (
      <Card>
        <Text type="secondary">No se pudo cargar el contenido del informe.</Text>
      </Card>
    );
  }
  const { proceso, candidatos } = snapshot;

  return (
    <div>
      {/* Cabecera hero */}
      <div
        style={{
          background: `linear-gradient(135deg, ${COLORS.navy} 0%, #1E293B 100%)`,
          color: '#fff',
          padding: '26px 28px',
          borderRadius: 16,
          marginBottom: 18,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <Monograma tone="light" size={34} />
          <span style={{ fontSize: 13, letterSpacing: 2, color: '#94A3B8' }}>
            EXECUTIVE SEARCH
          </span>
        </div>
        <div style={{ width: 34, height: 3, background: COLORS.gold, borderRadius: 2, marginBottom: 14 }} />
        <Title level={3} style={{ color: '#fff', margin: 0, letterSpacing: 0.3 }}>
          {proceso.titulo}
        </Title>
        <Text style={{ color: '#CBD5E1', fontSize: 14 }}>
          {proceso.cliente}
          {proceso.vertical ? ` · ${proceso.vertical}` : ''}
        </Text>
        {proceso.confidencialidad && (
          <div style={{ color: '#94A3B8', marginTop: 12, fontSize: 12 }}>
            {proceso.confidencialidad}
          </div>
        )}
      </div>

      {candidatos.length === 0 ? (
        <Card>
          <Text type="secondary">Este informe no incluye candidatos.</Text>
        </Card>
      ) : (
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          {candidatos.map((c, i) => (
            <CandidatoCard key={i} c={c} idx={i} />
          ))}
        </Space>
      )}
    </div>
  );
}
