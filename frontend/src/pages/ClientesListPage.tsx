import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  App as AntApp,
  Button,
  Card,
  Form,
  Input,
  Modal,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined } from '@ant-design/icons';
import { crearCliente, listarClientes, type Cliente, type DatosCliente } from '../api/clientes';

const { Title } = Typography;

export default function ClientesListPage() {
  const navigate = useNavigate();
  const { message } = AntApp.useApp();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [form] = Form.useForm<DatosCliente>();

  const cargar = async () => {
    setCargando(true);
    try {
      setClientes(await listarClientes());
    } catch {
      message.error('No se pudieron cargar los clientes');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCrear = async (valores: DatosCliente) => {
    setGuardando(true);
    try {
      const nuevo = await crearCliente(valores);
      message.success('Cliente creado');
      setModalAbierto(false);
      form.resetFields();
      navigate(`/clientes/${nuevo.id}`);
    } catch {
      message.error('No se pudo crear el cliente');
    } finally {
      setGuardando(false);
    }
  };

  const columns: ColumnsType<Cliente> = [
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      key: 'nombre',
      render: (nombre: string, cliente) => (
        <Button type="link" style={{ padding: 0 }} onClick={() => navigate(`/clientes/${cliente.id}`)}>
          {nombre}
        </Button>
      ),
      sorter: (a, b) => a.nombre.localeCompare(b.nombre),
    },
    {
      title: 'Sector',
      dataIndex: 'sector',
      key: 'sector',
      render: (sector: string | null) => sector ?? '—',
    },
    {
      title: 'Estado',
      dataIndex: 'activo',
      key: 'activo',
      width: 120,
      render: (activo: boolean) =>
        activo ? <Tag color="green">Activo</Tag> : <Tag>Inactivo</Tag>,
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 100,
      render: (_, cliente) => (
        <Button size="small" onClick={() => navigate(`/clientes/${cliente.id}`)}>
          Ver
        </Button>
      ),
    },
  ];

  return (
    <Card>
      <Space
        style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16 }}
        align="center"
      >
        <Title level={4} style={{ margin: 0 }}>
          Clientes
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalAbierto(true)}>
          Nuevo cliente
        </Button>
      </Space>

      <Table
        rowKey="id"
        loading={cargando}
        columns={columns}
        dataSource={clientes}
        pagination={{ pageSize: 10, hideOnSinglePage: true }}
      />

      <Modal
        title="Nuevo cliente"
        open={modalAbierto}
        onCancel={() => setModalAbierto(false)}
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
            <Input placeholder="Nombre del cliente" autoFocus />
          </Form.Item>
          <Form.Item label="Sector" name="sector">
            <Input placeholder="Ej: Travel Tech" />
          </Form.Item>
          <Form.Item label="Notas" name="notas">
            <Input.TextArea rows={3} placeholder="Notas internas" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
