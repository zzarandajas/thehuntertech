import { useEffect, useState } from 'react';
import {
  App as AntApp,
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Space,
  Switch,
  Table,
  Tag,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined } from '@ant-design/icons';
import {
  actualizarCatalogo,
  crearCatalogo,
  listarCatalogo,
} from '../api/catalogos';

export interface CampoCatalogo {
  name: string;
  label: string;
  tipo?: 'text' | 'number' | 'textarea';
  requerido?: boolean;
}

interface ItemCatalogo {
  id: number;
  activo: boolean;
  [k: string]: unknown;
}

interface Props {
  ruta: string;
  campos: CampoCatalogo[];
  esAdmin: boolean;
}

// Tabla genérica de catálogo: listar + (admin) crear/editar + estado activo.
export default function CatalogoTab({ ruta, campos, esAdmin }: Props) {
  const { message } = AntApp.useApp();
  const [items, setItems] = useState<ItemCatalogo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState<ItemCatalogo | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [form] = Form.useForm();

  const cargar = async () => {
    setCargando(true);
    try {
      setItems(await listarCatalogo<ItemCatalogo>(ruta));
    } catch {
      message.error('No se pudo cargar el catálogo');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ruta]);

  const abrirNuevo = () => {
    setEditando(null);
    form.resetFields();
    setModal(true);
  };

  const abrirEditar = (item: ItemCatalogo) => {
    setEditando(item);
    form.setFieldsValue(item);
    setModal(true);
  };

  const onGuardar = async (valores: Record<string, unknown>) => {
    setGuardando(true);
    try {
      if (editando) {
        await actualizarCatalogo(ruta, editando.id, valores);
        message.success('Actualizado');
      } else {
        await crearCatalogo(ruta, valores);
        message.success('Creado');
      }
      setModal(false);
      await cargar();
    } catch {
      message.error('No se pudo guardar');
    } finally {
      setGuardando(false);
    }
  };

  const columnas: ColumnsType<ItemCatalogo> = [
    ...campos.map((c) => ({
      title: c.label,
      dataIndex: c.name,
      key: c.name,
      render: (valor: unknown) => (valor === null || valor === '' ? '—' : String(valor)),
    })),
    {
      title: 'Estado',
      dataIndex: 'activo',
      key: 'activo',
      width: 110,
      render: (activo: boolean) =>
        activo ? <Tag color="green">Activo</Tag> : <Tag>Inactivo</Tag>,
    },
    ...(esAdmin
      ? [
          {
            title: 'Acciones',
            key: 'acciones',
            width: 100,
            render: (_: unknown, item: ItemCatalogo) => (
              <Button size="small" onClick={() => abrirEditar(item)}>
                Editar
              </Button>
            ),
          },
        ]
      : []),
  ];

  return (
    <>
      {esAdmin && (
        <Space style={{ width: '100%', justifyContent: 'flex-end', marginBottom: 12 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={abrirNuevo}>
            Nuevo
          </Button>
        </Space>
      )}

      <Table
        rowKey="id"
        loading={cargando}
        columns={columnas}
        dataSource={items}
        pagination={{ pageSize: 10, hideOnSinglePage: true }}
        size="small"
      />

      <Modal
        title={editando ? 'Editar elemento' : 'Nuevo elemento'}
        open={modal}
        onCancel={() => setModal(false)}
        onOk={() => form.submit()}
        okText="Guardar"
        cancelText="Cancelar"
        confirmLoading={guardando}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={onGuardar} requiredMark={false}>
          {campos.map((c) => (
            <Form.Item
              key={c.name}
              label={c.label}
              name={c.name}
              rules={c.requerido ? [{ required: true, message: `${c.label} obligatorio` }] : []}
            >
              {c.tipo === 'number' ? (
                <InputNumber style={{ width: '100%' }} />
              ) : c.tipo === 'textarea' ? (
                <Input.TextArea rows={3} />
              ) : (
                <Input />
              )}
            </Form.Item>
          ))}
          {editando && (
            <Form.Item label="Activo" name="activo" valuePropName="checked">
              <Switch />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </>
  );
}
