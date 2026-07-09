import { useEffect, useState } from 'react';
import {
  App as AntApp,
  Button,
  Card,
  Form,
  Input,
  Modal,
  Popconfirm,
  Space,
  Spin,
  Tag,
  Typography,
} from 'antd';
import { EditOutlined, PlusOutlined, DeleteOutlined, ApartmentOutlined } from '@ant-design/icons';
import {
  listarPlantillas,
  crearPlantilla,
  actualizarPlantilla,
  eliminarPlantilla,
  reemplazarEtapasPlantilla,
  type Plantilla,
} from '../api/plantillas';
import EtapasEditor, { type EtapaEditable } from '../components/EtapasEditor';

const { Title, Text } = Typography;

// Etapas iniciales de una plantilla nueva (punto de partida editable).
const STARTER_ETAPAS: EtapaEditable[] = [
  { nombre: 'Sourcing', color: '#64748b', esFinal: false },
  { nombre: 'Longlist', color: '#0ea5e9', esFinal: false },
  { nombre: 'Shortlist', color: '#6366f1', esFinal: false },
  { nombre: 'Presentado', color: '#8b5cf6', esFinal: false },
  { nombre: 'Entrevista cliente', color: '#f59e0b', esFinal: false },
  { nombre: 'Oferta', color: '#10b981', esFinal: false },
  { nombre: 'Contratado', color: '#16a34a', esFinal: true },
  { nombre: 'Descartado', color: '#ef4444', esFinal: true },
];

export default function PlantillasPage() {
  const { message } = AntApp.useApp();
  const [plantillas, setPlantillas] = useState<Plantilla[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [editando, setEditando] = useState<Plantilla | null>(null);
  const [modalDatos, setModalDatos] = useState(false);
  const [etapasDe, setEtapasDe] = useState<Plantilla | null>(null);
  const [form] = Form.useForm();

  const cargar = async () => {
    setCargando(true);
    try {
      setPlantillas(await listarPlantillas());
    } catch {
      message.error('No se pudieron cargar las plantillas');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const abrirNueva = () => {
    setEditando(null);
    form.resetFields();
    setModalDatos(true);
  };

  const abrirEditar = (p: Plantilla) => {
    setEditando(p);
    form.setFieldsValue({ nombre: p.nombre, descripcion: p.descripcion });
    setModalDatos(true);
  };

  const guardarDatos = async (valores: { nombre: string; descripcion?: string }) => {
    setGuardando(true);
    try {
      if (editando) {
        await actualizarPlantilla(editando.id, valores);
        message.success('Plantilla actualizada');
      } else {
        await crearPlantilla({ ...valores, etapas: STARTER_ETAPAS });
        message.success('Plantilla creada');
      }
      setModalDatos(false);
      form.resetFields();
      await cargar();
    } catch {
      message.error('No se pudo guardar la plantilla');
    } finally {
      setGuardando(false);
    }
  };

  const borrar = async (p: Plantilla) => {
    try {
      await eliminarPlantilla(p.id);
      message.success('Plantilla eliminada');
      await cargar();
    } catch (err) {
      const mensaje =
        (err as { response?: { data?: { mensaje?: string } } }).response?.data?.mensaje ??
        'No se pudo eliminar la plantilla';
      message.error(mensaje);
    }
  };

  const guardarEtapas = async (etapas: EtapaEditable[]) => {
    if (!etapasDe) return;
    setGuardando(true);
    try {
      await reemplazarEtapasPlantilla(etapasDe.id, etapas);
      message.success('Etapas actualizadas');
      setEtapasDe(null);
      await cargar();
    } catch {
      message.error('No se pudieron guardar las etapas');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Card>
      <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16 }} wrap>
        <div>
          <Title level={4} style={{ margin: 0 }}>
            Plantillas de pipeline
          </Title>
          <Text type="secondary">
            Conjuntos de etapas reutilizables. Al crear un mandato se copian sus etapas.
          </Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={abrirNueva}>
          Nueva plantilla
        </Button>
      </Space>

      {cargando ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <Spin size="large" />
        </div>
      ) : (
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          {plantillas.map((p) => {
            const etapas = [...(p.etapas ?? [])].sort((a, b) => a.orden - b.orden);
            return (
              <Card key={p.id} size="small" styles={{ body: { padding: 16 } }}>
                <Space
                  style={{ width: '100%', justifyContent: 'space-between' }}
                  align="start"
                  wrap
                >
                  <Space direction="vertical" size={8} style={{ maxWidth: 640 }}>
                    <Space size={8} wrap>
                      <Text strong style={{ fontSize: 15 }}>
                        {p.nombre}
                      </Text>
                      {p.esDefault && <Tag color="blue">Por defecto</Tag>}
                    </Space>
                    {p.descripcion && <Text type="secondary">{p.descripcion}</Text>}
                    <Space size={[6, 6]} wrap>
                      {etapas.length === 0 ? (
                        <Text type="secondary">Sin etapas</Text>
                      ) : (
                        etapas.map((e) => (
                          <Tag
                            key={e.id}
                            color={e.color}
                            style={{ color: '#fff', borderColor: 'transparent' }}
                          >
                            {e.nombre}
                            {e.esFinal ? ' ·fin' : ''}
                          </Tag>
                        ))
                      )}
                    </Space>
                  </Space>
                  <Space>
                    <Button icon={<ApartmentOutlined />} onClick={() => setEtapasDe(p)}>
                      Etapas
                    </Button>
                    <Button icon={<EditOutlined />} onClick={() => abrirEditar(p)}>
                      Editar
                    </Button>
                    <Popconfirm
                      title="¿Eliminar esta plantilla?"
                      okText="Eliminar"
                      cancelText="Cancelar"
                      okButtonProps={{ danger: true }}
                      onConfirm={() => borrar(p)}
                      disabled={p.esDefault}
                    >
                      <Button danger icon={<DeleteOutlined />} disabled={p.esDefault} />
                    </Popconfirm>
                  </Space>
                </Space>
              </Card>
            );
          })}
        </Space>
      )}

      <Modal
        title={editando ? 'Editar plantilla' : 'Nueva plantilla'}
        open={modalDatos}
        onCancel={() => setModalDatos(false)}
        onOk={() => form.submit()}
        okText="Guardar"
        cancelText="Cancelar"
        confirmLoading={guardando}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={guardarDatos} requiredMark={false}>
          <Form.Item
            label="Nombre"
            name="nombre"
            rules={[{ required: true, message: 'El nombre es obligatorio' }]}
          >
            <Input placeholder="Ej: Ejecutivo C-level" />
          </Form.Item>
          <Form.Item label="Descripción" name="descripcion">
            <Input.TextArea rows={2} placeholder="Opcional" />
          </Form.Item>
        </Form>
      </Modal>

      <EtapasEditor
        open={etapasDe !== null}
        title={etapasDe ? `Etapas · ${etapasDe.nombre}` : 'Etapas'}
        etapas={[...(etapasDe?.etapas ?? [])]
          .sort((a, b) => a.orden - b.orden)
          .map((e) => ({ id: e.id, nombre: e.nombre, color: e.color, esFinal: e.esFinal }))}
        nota="Arrastra para reordenar. Estas etapas se copiarán a los nuevos mandatos que usen esta plantilla."
        guardando={guardando}
        onCancel={() => setEtapasDe(null)}
        onGuardar={guardarEtapas}
      />
    </Card>
  );
}
