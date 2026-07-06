import { useEffect, useState } from 'react';
import {
  App as AntApp,
  Button,
  Divider,
  Drawer,
  Empty,
  Input,
  InputNumber,
  Select,
  Slider,
  Space,
  Spin,
  Typography,
} from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import {
  guardarMetricas,
  guardarObservaciones,
  guardarScores,
  obtenerEvaluacion,
  type EvaluacionDetalle,
  type Metrica,
  type Observacion,
  type TipoObservacion,
} from '../api/evaluacion';

const { Title, Text } = Typography;

interface Props {
  procesoCandidatoId: number | null;
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

interface ScoreLocal {
  score: number;
  comentario: string;
}

// Formulario de evaluación que ITERA dinámicamente las dimensiones asignadas al mandato
// (nunca hardcodea las dimensiones del modelo de ejemplo).
export default function ProcesoCandidatoDrawer({ procesoCandidatoId, open, onClose, onSaved }: Props) {
  const { message } = AntApp.useApp();
  const [evaluacion, setEvaluacion] = useState<EvaluacionDetalle | null>(null);
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [scores, setScores] = useState<Record<number, ScoreLocal>>({});
  const [metricas, setMetricas] = useState<Metrica[]>([]);
  const [observaciones, setObservaciones] = useState<Observacion[]>([]);

  useEffect(() => {
    if (!open || !procesoCandidatoId) return;
    setCargando(true);
    obtenerEvaluacion(procesoCandidatoId)
      .then((ev) => {
        setEvaluacion(ev);
        const s: Record<number, ScoreLocal> = {};
        ev.scores.forEach((sc) => {
          s[sc.dimensionId] = { score: sc.score, comentario: sc.comentario ?? '' };
        });
        setScores(s);
        setMetricas(ev.metricas.map((m) => ({ valor: m.valor, descripcion: m.descripcion })));
        setObservaciones(ev.observaciones.map((o) => ({ tipo: o.tipo, texto: o.texto })));
      })
      .catch(() => message.error('No se pudo cargar la evaluación'))
      .finally(() => setCargando(false));
  }, [open, procesoCandidatoId, message]);

  const setScore = (dimensionId: number, patch: Partial<ScoreLocal>) => {
    setScores((prev) => {
      const actual = prev[dimensionId] ?? { score: 0, comentario: '' };
      return { ...prev, [dimensionId]: { ...actual, ...patch } };
    });
  };

  const guardar = async () => {
    if (!procesoCandidatoId || !evaluacion) return;
    setGuardando(true);
    try {
      const dims = evaluacion.proceso?.dimensiones ?? [];
      await guardarScores(
        procesoCandidatoId,
        dims.map((d) => ({
          dimensionId: d.dimensionId,
          score: scores[d.dimensionId]?.score ?? 0,
          comentario: scores[d.dimensionId]?.comentario || null,
        })),
      );
      await guardarMetricas(
        procesoCandidatoId,
        metricas.filter((m) => m.valor && m.descripcion),
      );
      await guardarObservaciones(
        procesoCandidatoId,
        observaciones.filter((o) => o.texto),
      );
      message.success('Evaluación guardada');
      onSaved?.();
      onClose();
    } catch {
      message.error('No se pudo guardar la evaluación');
    } finally {
      setGuardando(false);
    }
  };

  const dims = evaluacion?.proceso?.dimensiones ?? [];

  return (
    <Drawer
      title={evaluacion ? `Evaluación · ${evaluacion.candidato?.nombre ?? ''}` : 'Evaluación'}
      width={560}
      open={open}
      onClose={onClose}
      extra={
        <Button type="primary" loading={guardando} onClick={guardar} disabled={cargando}>
          Guardar
        </Button>
      }
    >
      {cargando ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 48 }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          <Title level={5}>Puntuación por dimensión</Title>
          {dims.length === 0 ? (
            <Empty description="Este mandato no tiene dimensiones asignadas todavía" />
          ) : (
            dims.map((d) => {
              const val = scores[d.dimensionId] ?? { score: 0, comentario: '' };
              return (
                <div key={d.dimensionId} style={{ marginBottom: 16 }}>
                  <Text strong>{d.dimension?.nombre ?? `Dimensión ${d.dimensionId}`}</Text>
                  <Space style={{ width: '100%' }} align="center">
                    <Slider
                      style={{ flex: 1, width: 320 }}
                      min={0}
                      max={100}
                      value={val.score}
                      onChange={(v) => setScore(d.dimensionId, { score: v })}
                    />
                    <InputNumber
                      min={0}
                      max={100}
                      value={val.score}
                      onChange={(v) => setScore(d.dimensionId, { score: Number(v) || 0 })}
                    />
                  </Space>
                  <Input
                    placeholder="Comentario (opcional)"
                    value={val.comentario}
                    onChange={(e) => setScore(d.dimensionId, { comentario: e.target.value })}
                  />
                </div>
              );
            })
          )}

          <Divider />
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Title level={5} style={{ margin: 0 }}>
              Métricas destacadas
            </Title>
            <Button
              size="small"
              icon={<PlusOutlined />}
              onClick={() => setMetricas([...metricas, { valor: '', descripcion: '' }])}
            >
              Añadir
            </Button>
          </Space>
          {metricas.map((m, i) => (
            <Space key={i} style={{ display: 'flex', marginTop: 8 }} align="start">
              <Input
                placeholder="Valor (ej: +38%)"
                style={{ width: 120 }}
                value={m.valor}
                onChange={(e) =>
                  setMetricas(metricas.map((x, j) => (j === i ? { ...x, valor: e.target.value } : x)))
                }
              />
              <Input
                placeholder="Descripción"
                value={m.descripcion}
                onChange={(e) =>
                  setMetricas(
                    metricas.map((x, j) => (j === i ? { ...x, descripcion: e.target.value } : x)),
                  )
                }
              />
              <Button
                danger
                type="text"
                icon={<DeleteOutlined />}
                onClick={() => setMetricas(metricas.filter((_, j) => j !== i))}
              />
            </Space>
          ))}

          <Divider />
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Title level={5} style={{ margin: 0 }}>
              Observaciones
            </Title>
            <Button
              size="small"
              icon={<PlusOutlined />}
              onClick={() =>
                setObservaciones([...observaciones, { tipo: 'fortaleza', texto: '' }])
              }
            >
              Añadir
            </Button>
          </Space>
          {observaciones.map((o, i) => (
            <Space key={i} style={{ display: 'flex', marginTop: 8 }} align="start">
              <Select
                style={{ width: 150 }}
                value={o.tipo}
                onChange={(v: TipoObservacion) =>
                  setObservaciones(observaciones.map((x, j) => (j === i ? { ...x, tipo: v } : x)))
                }
                options={[
                  { value: 'fortaleza', label: 'Fortaleza' },
                  { value: 'punto_explorar', label: 'Punto a explorar' },
                ]}
              />
              <Input
                placeholder="Texto"
                value={o.texto}
                onChange={(e) =>
                  setObservaciones(
                    observaciones.map((x, j) => (j === i ? { ...x, texto: e.target.value } : x)),
                  )
                }
              />
              <Button
                danger
                type="text"
                icon={<DeleteOutlined />}
                onClick={() => setObservaciones(observaciones.filter((_, j) => j !== i))}
              />
            </Space>
          ))}
        </>
      )}
    </Drawer>
  );
}
