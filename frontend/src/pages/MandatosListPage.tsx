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
import { PlusOutlined } from '@ant-design/icons';
import { crearMandato, listarMandatos, type EstadoProceso, type Mandato } from '../api/mandatos';
import { listarClientes, type Cliente } from '../api/clientes';
import { listarCatalogo, type Vertical } from '../api/catalogos';

const { Title } = Typography;

export const ESTADO_COLOR: Record<EstadoProceso, string> = {
  abierto: 'green',
  cerrado: 'blue',
  archivado: 'default',
};
export const ESTADO_LABEL: Record<EstadoProceso, string> = {
  abierto: 'Abierto',
  cerrado: 'Cerrado',
  archivado: 'Archivado',
};

export default function MandatosListPage() {
  const navigate = useNavigate();
  const { message } = AntApp.useApp();
  const [mandatos, setMandatos] = useState<Mandato[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [verticales, setVerticales] = useState<Vertical[]>([]);
  const [cargando, setCargando] = useState(true);
  const [modal, setModal] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [form] = Form.useForm();

  const cargar = async () => {
    setCargando(true);
    try {
      const [m, c, v] = await Promise.all([
        listarMandatos(),
        listarClientes(),
        listarCatalogo<Vertical>('verticales'),
      ]);
      setMandatos(m);
      setClientes(c);
      setVerticales(v);
    } catch {
      message.error('No se pudieron cargar los mandatos');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCrear = async (valores: {
    clienteId: number;
    verticalId: number;
    titulo: string;
  }) => {
    setGuardando(true);
    try {
      const nuevo = await crearMandato(valores);
      message.success('Mandato creado');
      setModal(false);
      form.resetFields();
      navigate(`/mandatos/${nuevo.id}`);
    } catch {
      message.error('No se pudo crear el mandato');
    } finally {
      setGuardando(false);
    }
  };

  const columnas: ColumnsType<Mandato> = [
    {
      title: 'Título',
      dataIndex: 'titulo',
      key: 'titulo',
      render: (titulo: string, m) => (
        <Button type="link" style={{ padding: 0 }} onClick={() => navigate(`/mandatos/${m.id}`)}>
          {titulo}
        </Button>
      ),
    },
    { title: 'Cliente', key: 'cliente', render: (_, m) => m.cliente?.nombre ?? '—' },
    { title: 'Vertical', key: 'vertical', render: (_, m) => m.vertical?.nombre ?? '—' },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      width: 130,
      render: (estado: EstadoProceso) => (
        <Tag color={ESTADO_COLOR[estado]}>{ESTADO_LABEL[estado]}</Tag>
      ),
    },
  ];

  return (
    <Card>
      <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          Mandatos
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModal(true)}>
          Nuevo mandato
        </Button>
      </Space>

      <Table
        rowKey="id"
        loading={cargando}
        columns={columnas}
        dataSource={mandatos}
        pagination={{ pageSize: 10, hideOnSinglePage: true }}
      />

      <Modal
        title="Nuevo mandato"
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
            label="Cliente"
            name="clienteId"
            rules={[{ required: true, message: 'Selecciona un cliente' }]}
          >
            <Select
              showSearch
              optionFilterProp="label"
              placeholder="Selecciona cliente"
              options={clientes.map((c) => ({ value: c.id, label: c.nombre }))}
            />
          </Form.Item>
          <Form.Item
            label="Vertical"
            name="verticalId"
            rules={[{ required: true, message: 'Selecciona una vertical' }]}
          >
            <Select
              showSearch
              optionFilterProp="label"
              placeholder="Selecciona vertical"
              options={verticales.map((v) => ({ value: v.id, label: v.nombre }))}
            />
          </Form.Item>
          <Form.Item
            label="Título"
            name="titulo"
            rules={[{ required: true, message: 'El título es obligatorio' }]}
          >
            <Input placeholder="Ej: CMO para expansión EMEA" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
