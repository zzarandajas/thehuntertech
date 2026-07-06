import { useEffect, useState } from 'react';
import {
  App as AntApp,
  Button,
  Card,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined } from '@ant-design/icons';
import {
  actualizarUsuario,
  crearUsuario,
  listarUsuarios,
  type Usuario,
} from '../api/usuarios';

const { Title } = Typography;

const ETIQUETA_ROL: Record<string, string> = { admin: 'Administrador', consultor: 'Socio' };

export default function UsuariosPage() {
  const { message } = AntApp.useApp();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState<Usuario | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [form] = Form.useForm();

  const cargar = async () => {
    setCargando(true);
    try {
      setUsuarios(await listarUsuarios());
    } catch {
      message.error('No se pudieron cargar los usuarios');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const abrirNuevo = () => {
    setEditando(null);
    form.resetFields();
    form.setFieldsValue({ rol: 'consultor' });
    setModal(true);
  };

  const abrirEditar = (u: Usuario) => {
    setEditando(u);
    form.setFieldsValue({ nombre: u.nombre, email: u.email, rol: u.rol, activo: u.activo });
    setModal(true);
  };

  const onGuardar = async (valores: Record<string, unknown>) => {
    setGuardando(true);
    try {
      if (editando) {
        const cambios = { ...valores };
        if (!cambios.password) delete cambios.password;
        await actualizarUsuario(editando.id, cambios);
        message.success('Usuario actualizado');
      } else {
        await crearUsuario(valores as never);
        message.success('Usuario creado');
      }
      setModal(false);
      await cargar();
    } catch (err) {
      const m =
        (err as { response?: { data?: { mensaje?: string } } })?.response?.data?.mensaje ??
        'No se pudo guardar el usuario';
      message.error(m);
    } finally {
      setGuardando(false);
    }
  };

  const columnas: ColumnsType<Usuario> = [
    { title: 'Nombre', dataIndex: 'nombre', key: 'nombre' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Rol',
      dataIndex: 'rol',
      key: 'rol',
      render: (rol: string) => <Tag color={rol === 'admin' ? 'blue' : 'default'}>{ETIQUETA_ROL[rol] ?? rol}</Tag>,
    },
    {
      title: 'Estado',
      dataIndex: 'activo',
      key: 'activo',
      width: 110,
      render: (activo: boolean) => (activo ? <Tag color="green">Activo</Tag> : <Tag>Inactivo</Tag>),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 100,
      render: (_, u) => (
        <Button size="small" onClick={() => abrirEditar(u)}>
          Editar
        </Button>
      ),
    },
  ];

  return (
    <Card>
      <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          Usuarios
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={abrirNuevo}>
          Nuevo usuario
        </Button>
      </Space>

      <Table
        rowKey="id"
        loading={cargando}
        columns={columnas}
        dataSource={usuarios}
        pagination={{ pageSize: 10, hideOnSinglePage: true }}
      />

      <Modal
        title={editando ? 'Editar usuario' : 'Nuevo usuario'}
        open={modal}
        onCancel={() => setModal(false)}
        onOk={() => form.submit()}
        okText="Guardar"
        cancelText="Cancelar"
        confirmLoading={guardando}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={onGuardar} requiredMark={false}>
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
          <Form.Item
            label={editando ? 'Nueva contraseña (opcional)' : 'Contraseña'}
            name="password"
            rules={editando ? [] : [{ required: true, message: 'La contraseña es obligatoria' }]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <Form.Item label="Rol" name="rol" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'consultor', label: 'Socio' },
                { value: 'admin', label: 'Administrador' },
              ]}
            />
          </Form.Item>
          {editando && (
            <Form.Item label="Activo" name="activo" valuePropName="checked">
              <Switch />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </Card>
  );
}
