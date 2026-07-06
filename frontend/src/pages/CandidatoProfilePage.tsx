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
import { ArrowLeftOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import {
  actualizarCandidato,
  crearDocumento,
  crearInteraccion,
  guardarExperiencia,
  guardarSkills,
  obtenerCandidato,
  DISPONIBILIDAD_COLOR,
  DISPONIBILIDAD_LABEL,
  type CandidatoDetalle,
  type Disponibilidad,
  type Experiencia,
  type Interaccion,
  type TipoInteraccion,
} from '../api/talento';
import { listarCatalogo, type Origen, type Skill } from '../api/catalogos';

const { Title, Paragraph } = Typography;

const DISPONIBILIDADES: Disponibilidad[] = [
  'activo_busqueda',
  'abierto_a_ofertas',
  'no_disponible',
  'colocado',
  'desconocido',
];
const TIPOS_INTERACCION: TipoInteraccion[] = ['llamada', 'email', 'reunion', 'nota', 'linkedin'];

export default function CandidatoProfilePage() {
  const { id } = useParams<{ id: string }>();
  const candidatoId = Number(id);
  const navigate = useNavigate();
  const { message } = AntApp.useApp();

  const [candidato, setCandidato] = useState<CandidatoDetalle | null>(null);
  const [origenes, setOrigenes] = useState<Origen[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [modalPerfil, setModalPerfil] = useState(false);
  const [modalExp, setModalExp] = useState(false);
  const [modalInter, setModalInter] = useState(false);
  const [modalDoc, setModalDoc] = useState(false);
  const [skillsSel, setSkillsSel] = useState<number[]>([]);

  const [formPerfil] = Form.useForm();
  const [formExp] = Form.useForm();
  const [formInter] = Form.useForm();
  const [formDoc] = Form.useForm();

  const cargar = async () => {
    setCargando(true);
    try {
      const [c, o, s] = await Promise.all([
        obtenerCandidato(candidatoId),
        listarCatalogo<Origen>('origenes'),
        listarCatalogo<Skill>('skills'),
      ]);
      setCandidato(c);
      setOrigenes(o);
      setSkills(s);
      setSkillsSel(c.skills.map((sk) => sk.skillId));
    } catch {
      message.error('No se pudo cargar el candidato');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidatoId]);

  const abrirPerfil = () => {
    if (!candidato) return;
    formPerfil.setFieldsValue(candidato);
    setModalPerfil(true);
  };

  const onGuardarPerfil = async (valores: Record<string, unknown>) => {
    setGuardando(true);
    try {
      await actualizarCandidato(candidatoId, valores);
      message.success('Perfil actualizado');
      setModalPerfil(false);
      await cargar();
    } catch {
      message.error('No se pudo actualizar el perfil');
    } finally {
      setGuardando(false);
    }
  };

  const abrirExp = () => {
    formExp.setFieldsValue({ items: candidato?.experiencias ?? [] });
    setModalExp(true);
  };

  const onGuardarExp = async (valores: { items?: Experiencia[] }) => {
    setGuardando(true);
    try {
      await guardarExperiencia(candidatoId, valores.items ?? []);
      message.success('Experiencia actualizada');
      setModalExp(false);
      await cargar();
    } catch {
      message.error('No se pudo guardar la experiencia');
    } finally {
      setGuardando(false);
    }
  };

  const onGuardarSkills = async () => {
    setGuardando(true);
    try {
      await guardarSkills(
        candidatoId,
        skillsSel.map((skillId) => ({ skillId })),
      );
      message.success('Skills actualizadas');
      await cargar();
    } catch {
      message.error('No se pudieron guardar las skills');
    } finally {
      setGuardando(false);
    }
  };

  const onCrearInter = async (valores: { tipo: TipoInteraccion; resumen?: string }) => {
    setGuardando(true);
    try {
      await crearInteraccion(candidatoId, valores);
      message.success('Interacción registrada');
      setModalInter(false);
      formInter.resetFields();
      await cargar();
    } catch {
      message.error('No se pudo registrar la interacción');
    } finally {
      setGuardando(false);
    }
  };

  const onCrearDoc = async (valores: { tipo?: 'cv' | 'otro'; nombreArchivo: string; path: string }) => {
    setGuardando(true);
    try {
      await crearDocumento(candidatoId, valores);
      message.success('Documento añadido');
      setModalDoc(false);
      formDoc.resetFields();
      await cargar();
    } catch {
      message.error('No se pudo añadir el documento');
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 64 }}>
        <Spin size="large" />
      </div>
    );
  }
  if (!candidato) {
    return (
      <Card>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/talento')}>
          Volver al talento
        </Button>
      </Card>
    );
  }

  const colExp: ColumnsType<Experiencia> = [
    { title: 'Empresa', dataIndex: 'empresa', key: 'empresa' },
    { title: 'Cargo', dataIndex: 'cargo', key: 'cargo', render: (v) => v ?? '—' },
    { title: 'Periodo', dataIndex: 'periodo', key: 'periodo', render: (v) => v ?? '—' },
  ];
  const colInter: ColumnsType<Interaccion> = [
    { title: 'Tipo', dataIndex: 'tipo', key: 'tipo', render: (t: string) => <Tag>{t}</Tag> },
    {
      title: 'Fecha',
      dataIndex: 'fecha',
      key: 'fecha',
      render: (f: string) => new Date(f).toLocaleString('es-ES'),
    },
    { title: 'Resumen', dataIndex: 'resumen', key: 'resumen', render: (v) => v ?? '—' },
    { title: 'Usuario', key: 'usuario', render: (_, i) => i.usuario?.nombre ?? '—' },
  ];

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Card>
        <Space style={{ width: '100%', justifyContent: 'space-between' }} align="start">
          <Space direction="vertical" size={0}>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              style={{ paddingLeft: 0 }}
              onClick={() => navigate('/talento')}
            >
              Talento
            </Button>
            <Space align="center">
              <Title level={4} style={{ margin: 0 }}>
                {candidato.nombre}
              </Title>
              <Tag color={DISPONIBILIDAD_COLOR[candidato.disponibilidad]}>
                {DISPONIBILIDAD_LABEL[candidato.disponibilidad]}
              </Tag>
              {candidato.consentimientoRgpd && <Tag color="green">RGPD ✓</Tag>}
            </Space>
          </Space>
          <Button icon={<EditOutlined />} onClick={abrirPerfil}>
            Editar
          </Button>
        </Space>

        <Descriptions column={2} style={{ marginTop: 16 }} bordered size="small">
          <Descriptions.Item label="Email">{candidato.email ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Teléfono">{candidato.telefono ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="LinkedIn">
            {candidato.linkedinUrl ? (
              <a href={candidato.linkedinUrl} target="_blank" rel="noreferrer">
                Perfil
              </a>
            ) : (
              '—'
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Ciudad">{candidato.ciudadResidencia ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Idiomas">{candidato.idiomas ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Origen">{candidato.origen?.nombre ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Salario estimado">
            {candidato.salarioActualEstimado ?? '—'}
          </Descriptions.Item>
          <Descriptions.Item label="CV">
            {candidato.cvUrl ? (
              <a href={candidato.cvUrl} target="_blank" rel="noreferrer">
                Ver CV
              </a>
            ) : (
              '—'
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Formación" span={2}>
            {candidato.formacion ?? '—'}
          </Descriptions.Item>
          <Descriptions.Item label="Notas internas" span={2}>
            {candidato.notasInternas ?? '—'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card
        title="Experiencia"
        extra={
          <Button icon={<EditOutlined />} onClick={abrirExp}>
            Editar
          </Button>
        }
      >
        <Table
          rowKey={(r) => String(r.id ?? r.empresa)}
          columns={colExp}
          dataSource={candidato.experiencias}
          pagination={false}
          size="small"
          locale={{ emptyText: 'Sin experiencia registrada' }}
        />
      </Card>

      <Card
        title="Skills"
        extra={
          <Button type="primary" loading={guardando} onClick={onGuardarSkills}>
            Guardar skills
          </Button>
        }
      >
        <Select
          mode="multiple"
          style={{ width: '100%' }}
          placeholder="Selecciona las skills del candidato"
          value={skillsSel}
          onChange={setSkillsSel}
          optionFilterProp="label"
          options={skills.map((s) => ({ value: s.id, label: s.nombre }))}
        />
      </Card>

      <Card
        title="Interacciones"
        extra={
          <Button icon={<PlusOutlined />} onClick={() => setModalInter(true)}>
            Registrar
          </Button>
        }
      >
        <Table
          rowKey="id"
          columns={colInter}
          dataSource={candidato.interacciones}
          pagination={{ pageSize: 5, hideOnSinglePage: true }}
          size="small"
          locale={{ emptyText: 'Sin interacciones' }}
        />
      </Card>

      <Card
        title="Documentos"
        extra={
          <Button icon={<PlusOutlined />} onClick={() => setModalDoc(true)}>
            Añadir
          </Button>
        }
      >
        <Table
          rowKey="id"
          columns={[
            { title: 'Nombre', dataIndex: 'nombreArchivo', key: 'nombreArchivo' },
            { title: 'Tipo', dataIndex: 'tipo', key: 'tipo', render: (t: string) => <Tag>{t}</Tag> },
            {
              title: 'Enlace',
              dataIndex: 'path',
              key: 'path',
              render: (p: string) => (
                <a href={p} target="_blank" rel="noreferrer">
                  Abrir
                </a>
              ),
            },
          ]}
          dataSource={candidato.documentos}
          pagination={false}
          size="small"
          locale={{ emptyText: 'Sin documentos' }}
        />
      </Card>

      {/* --------------------------- Modales --------------------------- */}
      <Modal
        title="Editar perfil"
        open={modalPerfil}
        onCancel={() => setModalPerfil(false)}
        onOk={() => formPerfil.submit()}
        okText="Guardar"
        cancelText="Cancelar"
        confirmLoading={guardando}
        width={640}
        destroyOnClose
      >
        <Form form={formPerfil} layout="vertical" onFinish={onGuardarPerfil} requiredMark={false}>
          <Form.Item label="Nombre" name="nombre" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Space style={{ display: 'flex' }} align="start">
            <Form.Item label="Email" name="email" style={{ flex: 1 }}>
              <Input />
            </Form.Item>
            <Form.Item label="Teléfono" name="telefono" style={{ flex: 1 }}>
              <Input />
            </Form.Item>
          </Space>
          <Form.Item label="LinkedIn" name="linkedinUrl">
            <Input />
          </Form.Item>
          <Space style={{ display: 'flex' }} align="start">
            <Form.Item label="Ciudad" name="ciudadResidencia" style={{ flex: 1 }}>
              <Input />
            </Form.Item>
            <Form.Item label="Idiomas" name="idiomas" style={{ flex: 1 }}>
              <Input />
            </Form.Item>
          </Space>
          <Space style={{ display: 'flex' }} align="start">
            <Form.Item label="Disponibilidad" name="disponibilidad" style={{ flex: 1 }}>
              <Select options={DISPONIBILIDADES.map((d) => ({ value: d, label: DISPONIBILIDAD_LABEL[d] }))} />
            </Form.Item>
            <Form.Item label="Origen" name="origenId" style={{ flex: 1 }}>
              <Select allowClear options={origenes.map((o) => ({ value: o.id, label: o.nombre }))} />
            </Form.Item>
          </Space>
          <Space style={{ display: 'flex' }} align="start">
            <Form.Item label="Salario estimado" name="salarioActualEstimado" style={{ flex: 1 }}>
              <Input />
            </Form.Item>
            <Form.Item label="CV (URL)" name="cvUrl" style={{ flex: 1 }}>
              <Input />
            </Form.Item>
          </Space>
          <Form.Item label="Formación" name="formacion">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item label="Notas internas" name="notasInternas">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item label="Consentimiento RGPD" name="consentimientoRgpd" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Editar experiencia"
        open={modalExp}
        onCancel={() => setModalExp(false)}
        onOk={() => formExp.submit()}
        okText="Guardar"
        cancelText="Cancelar"
        confirmLoading={guardando}
        width={720}
        destroyOnClose
      >
        <Form form={formExp} layout="vertical" onFinish={onGuardarExp}>
          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field) => (
                  <Space key={field.key} align="start" style={{ display: 'flex', marginBottom: 8 }} wrap>
                    <Form.Item
                      name={[field.name, 'empresa']}
                      rules={[{ required: true, message: 'Empresa' }]}
                    >
                      <Input placeholder="Empresa" />
                    </Form.Item>
                    <Form.Item name={[field.name, 'cargo']}>
                      <Input placeholder="Cargo" />
                    </Form.Item>
                    <Form.Item name={[field.name, 'periodo']}>
                      <Input placeholder="Periodo" />
                    </Form.Item>
                    <Form.Item name={[field.name, 'descripcion']}>
                      <Input placeholder="Descripción" />
                    </Form.Item>
                    <Button danger onClick={() => remove(field.name)}>
                      Quitar
                    </Button>
                  </Space>
                ))}
                <Button type="dashed" block icon={<PlusOutlined />} onClick={() => add()}>
                  Añadir experiencia
                </Button>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>

      <Modal
        title="Registrar interacción"
        open={modalInter}
        onCancel={() => setModalInter(false)}
        onOk={() => formInter.submit()}
        okText="Registrar"
        cancelText="Cancelar"
        confirmLoading={guardando}
        destroyOnClose
      >
        <Form form={formInter} layout="vertical" onFinish={onCrearInter} requiredMark={false}>
          <Form.Item label="Tipo" name="tipo" rules={[{ required: true }]} initialValue="nota">
            <Select options={TIPOS_INTERACCION.map((t) => ({ value: t, label: t }))} />
          </Form.Item>
          <Form.Item label="Resumen" name="resumen">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Añadir documento"
        open={modalDoc}
        onCancel={() => setModalDoc(false)}
        onOk={() => formDoc.submit()}
        okText="Añadir"
        cancelText="Cancelar"
        confirmLoading={guardando}
        destroyOnClose
      >
        <Paragraph type="secondary">
          Se guarda como referencia (nombre + enlace); la subida de ficheros llegará más adelante.
        </Paragraph>
        <Form form={formDoc} layout="vertical" onFinish={onCrearDoc} requiredMark={false}>
          <Form.Item label="Nombre del archivo" name="nombreArchivo" rules={[{ required: true }]}>
            <Input placeholder="cv_juan_perez.pdf" />
          </Form.Item>
          <Form.Item label="Enlace / ruta" name="path" rules={[{ required: true }]}>
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item label="Tipo" name="tipo" initialValue="cv">
            <Select
              options={[
                { value: 'cv', label: 'CV' },
                { value: 'otro', label: 'Otro' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
