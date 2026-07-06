import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  App as AntApp,
  Button,
  Card,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import {
  crearCandidato,
  listarCandidatos,
  DISPONIBILIDAD_COLOR,
  DISPONIBILIDAD_LABEL,
  type Candidato,
  type Disponibilidad,
  type FiltrosTalento,
} from '../api/talento';
import { listarCatalogo, type Origen, type Skill } from '../api/catalogos';

const { Title } = Typography;

const DISPONIBILIDADES: Disponibilidad[] = [
  'activo_busqueda',
  'abierto_a_ofertas',
  'no_disponible',
  'colocado',
  'desconocido',
];

export default function TalentoListPage() {
  const navigate = useNavigate();
  const { message } = AntApp.useApp();
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [origenes, setOrigenes] = useState<Origen[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [cargando, setCargando] = useState(true);
  const [filtros, setFiltros] = useState<FiltrosTalento>({});
  const [modal, setModal] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [form] = Form.useForm();

  const cargarCandidatos = async (f: FiltrosTalento) => {
    setCargando(true);
    try {
      setCandidatos(await listarCandidatos(f));
    } catch {
      message.error('No se pudieron cargar los candidatos');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    Promise.all([listarCatalogo<Origen>('origenes'), listarCatalogo<Skill>('skills')])
      .then(([o, s]) => {
        setOrigenes(o);
        setSkills(s);
      })
      .catch(() => undefined);
    cargarCandidatos({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const aplicarFiltros = (parcial: Partial<FiltrosTalento>) => {
    const nuevos = { ...filtros, ...parcial };
    setFiltros(nuevos);
    cargarCandidatos(nuevos);
  };

  const onCrear = async (valores: Record<string, unknown>) => {
    setGuardando(true);
    try {
      const nuevo = await crearCandidato(valores);
      message.success('Candidato creado');
      setModal(false);
      form.resetFields();
      navigate(`/talento/${nuevo.id}`);
    } catch (err) {
      const resp = (err as { response?: { status?: number; data?: { candidatoId?: number } } })
        .response;
      if (resp?.status === 409 && resp.data?.candidatoId) {
        const idExistente = resp.data.candidatoId;
        message.warning('Ya existe un candidato con ese email o LinkedIn');
        setModal(false);
        navigate(`/talento/${idExistente}`);
      } else {
        message.error('No se pudo crear el candidato');
      }
    } finally {
      setGuardando(false);
    }
  };

  const columnas: ColumnsType<Candidato> = [
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      key: 'nombre',
      render: (nombre: string, c) => (
        <Button type="link" style={{ padding: 0 }} onClick={() => navigate(`/talento/${c.id}`)}>
          {nombre}
        </Button>
      ),
    },
    { title: 'Email', dataIndex: 'email', key: 'email', render: (e: string | null) => e ?? '—' },
    {
      title: 'Disponibilidad',
      dataIndex: 'disponibilidad',
      key: 'disponibilidad',
      render: (d: Disponibilidad) => (
        <Tag color={DISPONIBILIDAD_COLOR[d]}>{DISPONIBILIDAD_LABEL[d]}</Tag>
      ),
    },
    { title: 'Origen', key: 'origen', render: (_, c) => c.origen?.nombre ?? '—' },
  ];

  return (
    <Card>
      <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          Base de talento
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModal(true)}>
          Nuevo candidato
        </Button>
      </Space>

      <Space wrap style={{ marginBottom: 16 }}>
        <Input.Search
          allowClear
          placeholder="Buscar por nombre, email o LinkedIn"
          prefix={<SearchOutlined />}
          style={{ width: 280 }}
          onSearch={(v) => aplicarFiltros({ search: v || undefined })}
        />
        <Select
          allowClear
          placeholder="Disponibilidad"
          style={{ width: 200 }}
          onChange={(v) => aplicarFiltros({ disponibilidad: v })}
          options={DISPONIBILIDADES.map((d) => ({ value: d, label: DISPONIBILIDAD_LABEL[d] }))}
        />
        <Select
          allowClear
          placeholder="Origen"
          style={{ width: 180 }}
          onChange={(v) => aplicarFiltros({ origenId: v })}
          options={origenes.map((o) => ({ value: o.id, label: o.nombre }))}
        />
        <Select
          allowClear
          showSearch
          optionFilterProp="label"
          placeholder="Skill"
          style={{ width: 200 }}
          onChange={(v) => aplicarFiltros({ skillId: v })}
          options={skills.map((s) => ({ value: s.id, label: s.nombre }))}
        />
      </Space>

      <Table
        rowKey="id"
        loading={cargando}
        columns={columnas}
        dataSource={candidatos}
        pagination={{ pageSize: 10, hideOnSinglePage: true }}
      />

      <Modal
        title="Nuevo candidato"
        open={modal}
        onCancel={() => setModal(false)}
        onOk={() => form.submit()}
        okText="Crear"
        cancelText="Cancelar"
        confirmLoading={guardando}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={onCrear} requiredMark={false}>
          <Form.Item
            label="Nombre"
            name="nombre"
            rules={[{ required: true, message: 'El nombre es obligatorio' }]}
          >
            <Input autoFocus />
          </Form.Item>
          <Form.Item label="Email" name="email" rules={[{ type: 'email', message: 'Email no válido' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="LinkedIn" name="linkedinUrl">
            <Input placeholder="https://linkedin.com/in/..." />
          </Form.Item>
          <Form.Item label="Disponibilidad" name="disponibilidad" initialValue="desconocido">
            <Select options={DISPONIBILIDADES.map((d) => ({ value: d, label: DISPONIBILIDAD_LABEL[d] }))} />
          </Form.Item>
          <Form.Item label="Origen" name="origenId">
            <Select
              allowClear
              options={origenes.map((o) => ({ value: o.id, label: o.nombre }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
