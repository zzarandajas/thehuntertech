import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  App as AntApp,
  Button,
  Card,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ArrowLeftOutlined, DownloadOutlined, LinkOutlined } from '@ant-design/icons';
import {
  crearShareLink,
  descargarPdf,
  obtenerInforme,
  revocarShareLink,
  type Informe,
  type ShareLink,
} from '../api/informes';
import InformeView from '../components/InformeView';

const { Title, Text } = Typography;

function urlPublica(token: string) {
  return `${window.location.origin}/public/informes/${token}`;
}

export default function InformePreviewPage() {
  const { id } = useParams<{ id: string }>();
  const informeId = Number(id);
  const navigate = useNavigate();
  const { message } = AntApp.useApp();
  const [informe, setInforme] = useState<Informe | null>(null);
  const [cargando, setCargando] = useState(true);
  const [ocupado, setOcupado] = useState(false);

  const cargar = async () => {
    setCargando(true);
    try {
      setInforme(await obtenerInforme(informeId));
    } catch {
      message.error('No se pudo cargar el informe');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [informeId]);

  const generarEnlace = async () => {
    setOcupado(true);
    try {
      await crearShareLink(informeId, 30);
      message.success('Enlace creado (30 días)');
      await cargar();
    } catch {
      message.error('No se pudo crear el enlace');
    } finally {
      setOcupado(false);
    }
  };

  const revocar = async (link: ShareLink) => {
    try {
      await revocarShareLink(link.id);
      message.success('Enlace revocado');
      await cargar();
    } catch {
      message.error('No se pudo revocar');
    }
  };

  const copiar = (token: string) => {
    navigator.clipboard.writeText(urlPublica(token));
    message.success('Enlace copiado');
  };

  if (cargando) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 64 }}>
        <Spin size="large" />
      </div>
    );
  }
  if (!informe) {
    return (
      <Card>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
          Volver
        </Button>
      </Card>
    );
  }

  const estadoLink = (l: ShareLink) => {
    if (l.revocado) return <Tag color="red">Revocado</Tag>;
    if (new Date(l.expiresAt).getTime() < Date.now()) return <Tag>Expirado</Tag>;
    return <Tag color="green">Activo</Tag>;
  };

  const columnas: ColumnsType<ShareLink> = [
    {
      title: 'Enlace público',
      key: 'url',
      render: (_, l) => (
        <Text ellipsis style={{ maxWidth: 320 }} copyable={{ text: urlPublica(l.token) }}>
          {urlPublica(l.token)}
        </Text>
      ),
    },
    {
      title: 'Caduca',
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      render: (f: string) => new Date(f).toLocaleDateString('es-ES'),
    },
    { title: 'Estado', key: 'estado', render: (_, l) => estadoLink(l) },
    {
      title: '',
      key: 'acciones',
      render: (_, l) => (
        <Space>
          <Button size="small" icon={<LinkOutlined />} onClick={() => copiar(l.token)}>
            Copiar
          </Button>
          {!l.revocado && (
            <Button size="small" danger onClick={() => revocar(l)}>
              Revocar
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Card>
        <Space style={{ width: '100%', justifyContent: 'space-between' }} align="start" wrap>
          <Space direction="vertical" size={0}>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              style={{ paddingLeft: 0 }}
              onClick={() => navigate(`/mandatos/${informe.procesoId}`)}
            >
              Volver al mandato
            </Button>
            <Title level={4} style={{ margin: 0 }}>
              Informe v{informe.version}
            </Title>
            <Text type="secondary">
              Generado por {informe.generador?.nombre ?? '—'} ·{' '}
              {new Date(informe.fechaGeneracion).toLocaleString('es-ES')}
            </Text>
          </Space>
          <Space wrap>
            <Button icon={<LinkOutlined />} loading={ocupado} onClick={generarEnlace}>
              Nuevo enlace
            </Button>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={() => descargarPdf(informeId, `informe-v${informe.version}.pdf`)}
            >
              Descargar PDF
            </Button>
          </Space>
        </Space>
      </Card>

      {informe.shareLinks && informe.shareLinks.length > 0 && (
        <Card title="Enlaces de compartición">
          <Table rowKey="id" columns={columnas} dataSource={informe.shareLinks} pagination={false} size="small" />
        </Card>
      )}

      <InformeView snapshot={informe.snapshotJson} />
    </Space>
  );
}
