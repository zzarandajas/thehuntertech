import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  App as AntApp,
  Button,
  Card,
  Select,
  Space,
  Spin,
  Tag,
  Typography,
} from 'antd';
import { ArrowLeftOutlined, DeleteOutlined, SolutionOutlined } from '@ant-design/icons';
import ProcesoCandidatoDrawer from '../components/ProcesoCandidatoDrawer';
import {
  actualizarProcesoCandidato,
  agregarCandidatoAPipeline,
  eliminarProcesoCandidato,
  obtenerPipeline,
  ETAPAS,
  ETAPA_LABEL,
  type EtapaPipeline,
  type ProcesoCandidato,
} from '../api/pipeline';
import { obtenerMandato } from '../api/mandatos';
import { listarCandidatos, type Candidato } from '../api/talento';

const { Title, Text } = Typography;

export default function PipelineBoardPage() {
  const { id } = useParams<{ id: string }>();
  const procesoId = Number(id);
  const navigate = useNavigate();
  const { message } = AntApp.useApp();

  const [items, setItems] = useState<ProcesoCandidato[]>([]);
  const [titulo, setTitulo] = useState('');
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [cargando, setCargando] = useState(true);
  const [aAgregar, setAAgregar] = useState<number | undefined>();
  const [evalPcId, setEvalPcId] = useState<number | null>(null);

  const cargar = async () => {
    setCargando(true);
    try {
      const [pipe, mandato, cands] = await Promise.all([
        obtenerPipeline(procesoId),
        obtenerMandato(procesoId),
        listarCandidatos(),
      ]);
      setItems(pipe);
      setTitulo(mandato.titulo);
      setCandidatos(cands);
    } catch {
      message.error('No se pudo cargar el pipeline');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [procesoId]);

  const moverEtapa = async (pc: ProcesoCandidato, etapa: EtapaPipeline) => {
    setItems((prev) => prev.map((x) => (x.id === pc.id ? { ...x, etapa } : x)));
    try {
      await actualizarProcesoCandidato(pc.id, { etapa });
    } catch {
      message.error('No se pudo mover el candidato');
      cargar();
    }
  };

  const quitar = async (pc: ProcesoCandidato) => {
    try {
      await eliminarProcesoCandidato(pc.id);
      setItems((prev) => prev.filter((x) => x.id !== pc.id));
    } catch {
      message.error('No se pudo quitar el candidato');
    }
  };

  const agregar = async () => {
    if (!aAgregar) return;
    try {
      await agregarCandidatoAPipeline(procesoId, aAgregar);
      setAAgregar(undefined);
      await cargar();
    } catch (err) {
      const status = (err as { response?: { status?: number } }).response?.status;
      if (status === 409) message.warning('El candidato ya está en el pipeline');
      else message.error('No se pudo añadir el candidato');
    }
  };

  if (cargando) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 64 }}>
        <Spin size="large" />
      </div>
    );
  }

  const candidatosDisponibles = candidatos.filter(
    (c) => !items.some((pc) => pc.candidatoId === c.id),
  );

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Card>
        <Space style={{ width: '100%', justifyContent: 'space-between' }} align="start" wrap>
          <Space direction="vertical" size={0}>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              style={{ paddingLeft: 0 }}
              onClick={() => navigate(`/mandatos/${procesoId}`)}
            >
              {titulo || 'Mandato'}
            </Button>
            <Title level={4} style={{ margin: 0 }}>
              Pipeline
            </Title>
          </Space>
          <Space wrap>
            <Select
              style={{ minWidth: 260 }}
              showSearch
              allowClear
              optionFilterProp="label"
              placeholder="Añadir candidato al pipeline"
              value={aAgregar}
              onChange={setAAgregar}
              options={candidatosDisponibles.map((c) => ({ value: c.id, label: c.nombre }))}
            />
            <Button type="primary" onClick={agregar} disabled={!aAgregar}>
              Añadir
            </Button>
          </Space>
        </Space>
      </Card>

      <div style={{ overflowX: 'auto', paddingBottom: 8 }}>
        <div style={{ display: 'flex', gap: 12, minWidth: 'min-content' }}>
          {ETAPAS.map((etapa) => {
            const cards = items.filter((pc) => pc.etapa === etapa);
            return (
              <div key={etapa} style={{ width: 240, flex: '0 0 240px' }}>
                <Card
                  size="small"
                  title={
                    <Space>
                      <Text strong>{ETAPA_LABEL[etapa]}</Text>
                      <Tag>{cards.length}</Tag>
                    </Space>
                  }
                  styles={{ body: { background: '#f8fafc', minHeight: 120 } }}
                >
                  <Space direction="vertical" size={8} style={{ width: '100%' }}>
                    {cards.map((pc) => (
                      <Card key={pc.id} size="small" styles={{ body: { padding: 10 } }}>
                        <Space direction="vertical" size={6} style={{ width: '100%' }}>
                          <Button
                            type="link"
                            style={{ padding: 0, height: 'auto', textAlign: 'left' }}
                            onClick={() => navigate(`/talento/${pc.candidatoId}`)}
                          >
                            {pc.candidato?.nombre}
                          </Button>
                          <Select
                            size="small"
                            style={{ width: '100%' }}
                            value={pc.etapa}
                            onChange={(v) => moverEtapa(pc, v)}
                            options={ETAPAS.map((e) => ({ value: e, label: ETAPA_LABEL[e] }))}
                          />
                          <Space size={4} style={{ width: '100%', justifyContent: 'space-between' }}>
                            <Button
                              size="small"
                              icon={<SolutionOutlined />}
                              onClick={() => setEvalPcId(pc.id)}
                            >
                              Evaluar
                            </Button>
                            <Button
                              size="small"
                              danger
                              type="text"
                              icon={<DeleteOutlined />}
                              onClick={() => quitar(pc)}
                            />
                          </Space>
                        </Space>
                      </Card>
                    ))}
                  </Space>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      <ProcesoCandidatoDrawer
        procesoCandidatoId={evalPcId}
        open={evalPcId !== null}
        onClose={() => setEvalPcId(null)}
      />
    </Space>
  );
}
