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
  Space,
  Spin,
  Switch,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ArrowLeftOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import {
  actualizarCliente,
  crearContacto,
  obtenerCliente,
  type ClienteContacto,
  type ClienteDetalle,
  type DatosCliente,
  type DatosContacto,
} from '../api/clientes';

const { Title } = Typography;

export default function ClienteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const clienteId = Number(id);
  const navigate = useNavigate();
  const { message } = AntApp.useApp();

  const [cliente, setCliente] = useState<ClienteDetalle | null>(null);
  const [cargando, setCargando] = useState(true);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalContacto, setModalContacto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [formEditar] = Form.useForm<DatosCliente>();
  const [formContacto] = Form.useForm<DatosContacto>();

  const cargar = async () => {
    setCargando(true);
    try {
      setCliente(await obtenerCliente(clienteId));
    } catch {
      message.error('No se pudo cargar el cliente');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clienteId]);

  const abrirEditar = () => {
    if (!cliente) return;
    formEditar.setFieldsValue({
      nombre: cliente.nombre,
      sector: cliente.sector,
      notas: cliente.notas,
      activo: cliente.activo,
    });
    setModalEditar(true);
  };

  const onGuardarEditar = async (valores: DatosCliente) => {
    setGuardando(true);
    try {
      await actualizarCliente(clienteId, valores);
      message.success('Cliente actualizado');
      setModalEditar(false);
      await cargar();
    } catch {
      message.error('No se pudo actualizar el cliente');
    } finally {
      setGuardando(false);
    }
  };

  const onCrearContacto = async (valores: DatosContacto) => {
    setGuardando(true);
    try {
      await crearContacto(clienteId, valores);
      message.success('Contacto añadido');
      setModalContacto(false);
      formContacto.resetFields();
      await cargar();
    } catch {
      message.error('No se pudo añadir el contacto');
    } finally {
      setGuardando(false);
    }
  };

  const columnasContactos: ColumnsType<ClienteContacto> = [
    { title: 'Nombre', dataIndex: 'nombre', key: 'nombre' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Cargo',
      dataIndex: 'cargo',
      key: 'cargo',
      render: (cargo: string | null) => cargo ?? '—',
    },
  ];

  if (cargando) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 64 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!cliente) {
    return (
      <Card>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/clientes')}>
          Volver a clientes
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
              onClick={() => navigate('/clientes')}
            >
              Clientes
            </Button>
            <Title level={4} style={{ margin: 0 }}>
              {cliente.nombre}
            </Title>
          </Space>
          <Button icon={<EditOutlined />} onClick={abrirEditar}>
            Editar
          </Button>
        </Space>

        <Descriptions column={1} style={{ marginTop: 16 }} bordered size="small">
          <Descriptions.Item label="Sector">{cliente.sector ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Estado">
            {cliente.activo ? <Tag color="green">Activo</Tag> : <Tag>Inactivo</Tag>}
          </Descriptions.Item>
          <Descriptions.Item label="Notas">{cliente.notas ?? '—'}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card>
        <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16 }}>
          <Title level={5} style={{ margin: 0 }}>
            Contactos
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalContacto(true)}
          >
            Añadir contacto
          </Button>
        </Space>
        <Table
          rowKey="id"
          columns={columnasContactos}
          dataSource={cliente.contactos}
          pagination={false}
          locale={{ emptyText: 'Sin contactos todavía' }}
        />
      </Card>

      <Modal
        title="Editar cliente"
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
            label="Nombre"
            name="nombre"
            rules={[{ required: true, message: 'El nombre es obligatorio' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Sector" name="sector">
            <Input />
          </Form.Item>
          <Form.Item label="Notas" name="notas">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item label="Activo" name="activo" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Añadir contacto"
        open={modalContacto}
        onCancel={() => setModalContacto(false)}
        onOk={() => formContacto.submit()}
        okText="Añadir"
        cancelText="Cancelar"
        confirmLoading={guardando}
        destroyOnClose
      >
        <Form form={formContacto} layout="vertical" onFinish={onCrearContacto} requiredMark={false}>
          <Form.Item
            label="Nombre"
            name="nombre"
            rules={[{ required: true, message: 'El nombre es obligatorio' }]}
          >
            <Input autoFocus />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'El email es obligatorio' },
              { type: 'email', message: 'Email no válido' },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Cargo" name="cargo">
            <Input placeholder="Ej: CHRO" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
