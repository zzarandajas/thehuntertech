import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, ConfigProvider, Result, Space, Spin, Typography } from 'antd';
import esES from 'antd/locale/es_ES';
import { DownloadOutlined } from '@ant-design/icons';
import { obtenerInformePublico, type SnapshotInforme } from '../api/informes';
import InformeView from '../components/InformeView';
import { themeConfig, COLORS } from '../theme';

const { Text } = Typography;

// Vista pública del informe (sin layout de autenticación) para el Board del cliente.
export default function PublicInformePage() {
  const { token } = useParams<{ token: string }>();
  const [snapshot, setSnapshot] = useState<SnapshotInforme | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    obtenerInformePublico(token)
      .then((r) => setSnapshot(r.snapshot))
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }, [token]);

  return (
    <ConfigProvider locale={esES} theme={themeConfig}>
      <div style={{ minHeight: '100vh', background: COLORS.background, padding: '32px 16px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          {cargando ? (
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
              <Spin size="large" />
            </div>
          ) : error ? (
            <Result status="warning" title="Enlace no disponible" subTitle={error} />
          ) : snapshot ? (
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <div style={{ textAlign: 'right' }}>
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  href={`/public/informes/${token}/pdf`}
                  target="_blank"
                >
                  Descargar PDF
                </Button>
              </div>
              <InformeView snapshot={snapshot} />
              <Text type="secondary" style={{ display: 'block', textAlign: 'center' }}>
                Documento confidencial · TheHunter.tech
              </Text>
            </Space>
          ) : null}
        </div>
      </div>
    </ConfigProvider>
  );
}
