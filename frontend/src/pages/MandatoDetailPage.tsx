import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  App as AntApp,
  Button,
  Card,
  Descriptions,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Spin,
  Switch,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ArrowLeftOutlined,
  EditOutlined,
  FileTextOutlined,
  PartitionOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import {
  actualizarMandato,
  asignarConsultores,
  asignarDimensiones,
  obtenerMandato,
  type EstadoProceso,
  type MandatoDetalle,
  type RolEnProceso,
} from '../api/mandatos';
import { listarCatalogo, type Dimension } from '../api/catalogos';
import { listarUsuariosSeleccionables, type UsuarioSeleccionable } from '../api/usuarios';
import { generarInforme, listarInformes, type InformeResumen } from '../api/informes';
import { candidatosSugeridos, type MatchCandidato } from '../api/ia';
import { agregarCandidatoAPipeline } from '../api/pipeline';
import { ESTADO_COLOR, ESTADO_LABEL } from './MandatosListPage';

const { Title } = Typography;

const ROL_LABEL: Record<RolEnProceso, string> = { lead: 'Lead', soporte: 'Soporte' };

export default function MandatoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const mandatoId = Number(id);
  const navigate = useNavigate();
  const { message } = AntApp.useApp();

  const [mandato, setMandato] = useState<MandatoDetalle | null>(null);
  const [dimensionesCat, setDimensionesCat] = useState<Dimension[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioSeleccionable[]>([]);
  const [cargando, setCargando] = useState(true);

  const [modalEditar, setModalEditar] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [formEditar] = Form.useForm();

  const [dimsSeleccionadas, setDimsSeleccionadas] = useState<number[]>([]);
  const [consultores, setConsultores] = useState<
    { usuarioId: number; rolEnProceso: RolEnProceso }[]
  >([]);
  const [nuevoUsuarioId, setNuevoUsuarioId] = useState<number | undefined>();
  const [nuevoRol, setNuevoRol] = useState<RolEnProceso>('soporte');
  const [informes, setInformes] = useState<InformeResumen[]>([]);
  const [matches, setMatches] = useState<MatchCandidato[] | null>(null);
  const [cargandoMatches, setCargandoMatches] = useState(false);
  const [anadiendo, setAnadiendo] = useState<number | null>(null);

  const cargar = async () => {
    setCargando(true);
    try {
      const [m, dims, us, infs] = await Promise.all([
        obtenerMandato(mandatoId),
        listarCatalogo<Dimension>('dimensiones'),
        listarUsuariosSeleccionables(),
        listarInformes(mandatoId),
      ]);
      setMandato(m);
      setDimensionesCat(dims);
      setUsuarios(us);
      setInformes(infs);
      setDimsSeleccionadas(m.dimensiones.map((d) => d.dimensionId));
      setConsultores(m.consultores.map((c) => ({ usuarioId: c.usuarioId, rolEnProceso: c.rolEnProceso })));
    } catch {
      message.error('No se pudo cargar el mandato');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mandatoId]);

  const abrirEditar = () => {
    if (!mandato) return;
    formEditar.setFieldsValue({
      titulo: mandato.titulo,
      estado: mandato.estado,
      confidencialidad: mandato.confidencialidad,
      anonimizarNombres: mandato.anonimizarNombres,
    });
    setModalEditar(true);
  };

  const onGuardarEditar = async (valores: Record<string, unknown>) => {
    setGuardando(true);
    try {
      const actualizado = await actualizarMandato(mandatoId, valores);
      setMandato(actualizado);
      message.success('Mandato actualizado');
      setModalEditar(false);
    } catch {
      message.error('No se pudo actualizar');
    } finally {
      setGuardando(false);
    }
  };

  const guardarDimensiones = async () => {
    setGuardando(true);
    try {
      const actualizado = await asignarDimensiones(mandatoId, dimsSeleccionadas);
      setMandato(actualizado);
      message.success('Dimensiones actualizadas');
    } catch {
      message.error('No se pudieron guardar las dimensiones');
    } finally {
      setGuardando(false);
    }
  };

  const anadirConsultor = () => {
    if (!nuevoUsuarioId) return;
    if (consultores.some((c) => c.usuarioId === nuevoUsuarioId)) {
      message.warning('Ese socio ya está asignado');
      return;
    }
    setConsultores([...consultores, { usuarioId: nuevoUsuarioId, rolEnProceso: nuevoRol }]);
    setNuevoUsuarioId(undefined);
    setNuevoRol('soporte');
  };

  const guardarConsultores = async () => {
    setGuardando(true);
    try {
      const actualizado = await asignarConsultores(mandatoId, consultores);
      setMandato(actualizado);
      message.success('Socios actualizados');
    } catch {
      message.error('No se pudieron guardar los socios');
    } finally {
      setGuardando(false);
    }
  };

  const generar = async () => {
    setGuardando(true);
    try {
      const inf = await generarInforme(mandatoId);
      message.success(`Informe v${inf.version} generado`);
      navigate(`/informes/${inf.id}`);
    } catch {
      message.error('No se pudo generar el informe');
    } finally {
      setGuardando(false);
    }
  };

  const sugerir = async () => {
    setCargandoMatches(true);
    try {
      setMatches(await candidatosSugeridos(mandatoId));
    } catch (err) {
      const resp = (err as { response?: { status?: number; data?: { mensaje?: string } } }).response;
      if (resp?.status === 503) {
        message.warning('IA no disponible: falta configurar la API key en el backend');
      } else {
        message.error(resp?.data?.mensaje ?? 'No se pudieron obtener sugerencias');
      }
    } finally {
      setCargandoMatches(false);
    }
  };

  const anadirAlPipeline = async (candidatoId: number) => {
    setAnadiendo(candidatoId);
    try {
      await agregarCandidatoAPipeline(mandatoId, candidatoId);
      message.success('Candidato añadido al pipeline');
      setMatches((prev) => (prev ? prev.filter((m) => m.candidatoId !== candidatoId) : prev));
    } catch (err) {
      const resp = (err as { response?: { status?: number; data?: { mensaje?: string } } }).response;
      if (resp?.status === 409) {
        message.warning('El candidato ya está en el pipeline');
      } else {
        message.error(resp?.data?.mensaje ?? 'No se pudo añadir al pipeline');
      }
    } finally {
      setAnadiendo(null);
    }
  };

  const colorScore = (s: number) => (s >= 75 ? 'green' : s >= 50 ? 'gold' : 'default');

  const nombreUsuario = (usuarioId: number) =>
    usuarios.find((u) => u.id === usuarioId)?.nombre ?? `Usuario ${usuarioId}`;

  const columnasConsultores: ColumnsType<{ usuarioId: number; rolEnProceso: RolEnProceso }> = [
    { title: 'Socio', key: 'nombre', render: (_, c) => nombreUsuario(c.usuarioId) },
    {
      title: 'Rol',
      dataIndex: 'rolEnProceso',
      key: 'rol',
      width: 120,
      render: (rol: RolEnProceso) => <Tag color={rol === 'lead' ? 'blue' : 'default'}>{ROL_LABEL[rol]}</Tag>,
    },
    {
      title: '',
      key: 'quitar',
      width: 90,
      render: (_, c) => (
        <Button
          size="small"
          danger
          onClick={() => setConsultores(consultores.filter((x) => x.usuarioId !== c.usuarioId))}
        >
          Quitar
        </Button>
      ),
    },
  ];

  if (cargando) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 64 }}>
        <Spin size="large" />
      </div>
    );
  }
  if (!mandato) {
    return (
      <Card>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/mandatos')}>
          Volver a mandatos
        </Button>
      </Card>
    );
  }

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Card>
        <Space style={{ width: '100%', justifyContent: 'space-between' }} align="start">
          <Space direction="vertical" size={0}>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              style={{ paddingLeft: 0 }}
              onClick={() => navigate('/mandatos')}
            >
              Mandatos
            </Button>
            <Space align="center">
              <Title level={4} style={{ margin: 0 }}>
                {mandato.titulo}
              </Title>
              <Tag color={ESTADO_COLOR[mandato.estado]}>{ESTADO_LABEL[mandato.estado]}</Tag>
            </Space>
          </Space>
          <Space>
            <Button
              icon={<PartitionOutlined />}
              onClick={() => navigate(`/mandatos/${mandatoId}/pipeline`)}
            >
              Pipeline
            </Button>
            <Button icon={<EditOutlined />} onClick={abrirEditar}>
              Editar
            </Button>
          </Space>
        </Space>

        <Descriptions column={1} style={{ marginTop: 16 }} bordered size="small">
          <Descriptions.Item label="Cliente">{mandato.cliente?.nombre ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Vertical">{mandato.vertical?.nombre ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Responsable">{mandato.creador?.nombre ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Confidencialidad">{mandato.confidencialidad}</Descriptions.Item>
          <Descriptions.Item label="Anonimizar nombres">
            {mandato.anonimizarNombres ? 'Sí' : 'No'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card
        title="Dimensiones de evaluación"
        extra={
          <Button type="primary" loading={guardando} onClick={guardarDimensiones}>
            Guardar dimensiones
          </Button>
        }
      >
        <Select
          mode="multiple"
          style={{ width: '100%' }}
          placeholder="Selecciona las dimensiones a evaluar en este mandato"
          value={dimsSeleccionadas}
          onChange={setDimsSeleccionadas}
          optionFilterProp="label"
          options={dimensionesCat.map((d) => ({ value: d.id, label: d.nombre }))}
        />
      </Card>

      <Card title="Socios asignados">
        <Space style={{ marginBottom: 12, flexWrap: 'wrap' }}>
          <Select
            style={{ minWidth: 220 }}
            placeholder="Selecciona socio"
            showSearch
            optionFilterProp="label"
            value={nuevoUsuarioId}
            onChange={setNuevoUsuarioId}
            options={usuarios.map((u) => ({ value: u.id, label: u.nombre }))}
          />
          <Select
            style={{ width: 140 }}
            value={nuevoRol}
            onChange={setNuevoRol}
            options={[
              { value: 'lead', label: 'Lead' },
              { value: 'soporte', label: 'Soporte' },
            ]}
          />
          <Button onClick={anadirConsultor}>Añadir</Button>
          <Button type="primary" loading={guardando} onClick={guardarConsultores}>
            Guardar socios
          </Button>
        </Space>
        <Table
          rowKey="usuarioId"
          columns={columnasConsultores}
          dataSource={consultores}
          pagination={false}
          size="small"
          locale={{ emptyText: 'Sin socios asignados' }}
        />
      </Card>

      <Card
        title="Candidatos sugeridos (IA)"
        extra={
          <Button
            type="primary"
            icon={<ThunderboltOutlined />}
            loading={cargandoMatches}
            onClick={sugerir}
          >
            Sugerir con IA
          </Button>
        }
      >
        {matches === null ? (
          <Typography.Text type="secondary">
            Pulsa «Sugerir con IA» para puntuar el pool de talento contra este mandato según sus
            dimensiones de evaluación, skills y trayectoria.
          </Typography.Text>
        ) : (
          <Table
            rowKey="candidatoId"
            size="small"
            pagination={false}
            dataSource={matches}
            locale={{ emptyText: 'Sin sugerencias' }}
            columns={[
              {
                title: 'Candidato',
                key: 'nombre',
                render: (_, m: MatchCandidato) => (
                  <Button
                    type="link"
                    style={{ padding: 0 }}
                    onClick={() => navigate(`/talento/${m.candidatoId}`)}
                  >
                    {m.nombre}
                  </Button>
                ),
              },
              {
                title: 'Score',
                dataIndex: 'score',
                key: 'score',
                width: 80,
                defaultSortOrder: 'descend',
                sorter: (a: MatchCandidato, b: MatchCandidato) => a.score - b.score,
                render: (s: number) => <Tag color={colorScore(s)}>{s}</Tag>,
              },
              { title: 'Justificación', dataIndex: 'justificacion', key: 'just' },
              {
                title: '',
                key: 'add',
                width: 160,
                render: (_, m: MatchCandidato) => (
                  <Button
                    size="small"
                    loading={anadiendo === m.candidatoId}
                    onClick={() => anadirAlPipeline(m.candidatoId)}
                  >
                    Añadir al pipeline
                  </Button>
                ),
              },
            ]}
          />
        )}
      </Card>

      <Card
        title="Informes"
        extra={
          <Button
            type="primary"
            icon={<FileTextOutlined />}
            loading={guardando}
            onClick={generar}
          >
            Generar informe
          </Button>
        }
      >
        <Table
          rowKey="id"
          size="small"
          pagination={false}
          columns={[
            { title: 'Versión', dataIndex: 'version', key: 'version', render: (v: number) => `v${v}` },
            {
              title: 'Fecha',
              dataIndex: 'fechaGeneracion',
              key: 'fecha',
              render: (f: string) => new Date(f).toLocaleString('es-ES'),
            },
            {
              title: 'Generado por',
              key: 'gen',
              render: (_, r: InformeResumen) => r.generador?.nombre ?? '—',
            },
            {
              title: '',
              key: 'ver',
              width: 80,
              render: (_, r: InformeResumen) => (
                <Button size="small" onClick={() => navigate(`/informes/${r.id}`)}>
                  Ver
                </Button>
              ),
            },
          ]}
          dataSource={informes}
          locale={{ emptyText: 'Sin informes generados' }}
        />
      </Card>

      <Modal
        title="Editar mandato"
        open={modalEditar}
        onCancel={() => setModalEditar(false)}
        onOk={() => formEditar.submit()}
        okText="Guardar"
        cancelText="Cancelar"
        confirmLoading={guardando}
        destroyOnClose
      >
        <Form form={formEditar} layout="vertical" onFinish={onGuardarEditar} requiredMark={false}>
          <Form.Item
            label="Título"
            name="titulo"
            rules={[{ required: true, message: 'El título es obligatorio' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Estado" name="estado">
            <Select
              options={(['abierto', 'cerrado', 'archivado'] as EstadoProceso[]).map((e) => ({
                value: e,
                label: ESTADO_LABEL[e],
              }))}
            />
          </Form.Item>
          <Form.Item label="Confidencialidad" name="confidencialidad">
            <Input />
          </Form.Item>
          <Form.Item label="Anonimizar nombres" name="anonimizarNombres" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
