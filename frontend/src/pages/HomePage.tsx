import { useEffect, useState } from 'react';
import { App as AntApp, Card, Col, Progress, Row, Spin, Statistic, Typography } from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  ContactsOutlined,
  FileSearchOutlined,
} from '@ant-design/icons';
import { obtenerStats, type DashboardStats } from '../api/dashboard';
import { useAuth } from '../auth/AuthContext';
import { COLORS } from '../theme';

const { Title, Text } = Typography;

export default function HomePage() {
  const { usuario } = useAuth();
  const { message } = AntApp.useApp();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    obtenerStats()
      .then(setStats)
      .catch(() => message.error('No se pudieron cargar los indicadores'))
      .finally(() => setCargando(false));
  }, [message]);

  const maxVertical = stats ? Math.max(1, ...stats.porVertical.map((v) => v.total)) : 1;

  return (
    <div>
      <Title level={4} style={{ marginTop: 0 }}>
        Hola, {usuario?.nombre}
      </Title>
      <Text type="secondary">Resumen de la actividad de búsqueda.</Text>

      {cargando ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 64 }}>
          <Spin size="large" />
        </div>
      ) : stats ? (
        <>
          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={12} md={6}>
              <Card>
                <Statistic
                  title="Mandatos activos"
                  value={stats.mandatos.activos}
                  prefix={<FileSearchOutlined style={{ color: COLORS.accent }} />}
                />
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card>
                <Statistic
                  title="Mandatos cerrados"
                  value={stats.mandatos.cerrados}
                  prefix={<CheckCircleOutlined style={{ color: '#16a34a' }} />}
                />
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card>
                <Statistic
                  title="Candidatos en base"
                  value={stats.totalCandidatos}
                  prefix={<ContactsOutlined style={{ color: COLORS.navy }} />}
                />
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card>
                <Statistic
                  title="Tiempo medio de cierre"
                  value={stats.tiempoMedioCierreDias}
                  suffix="días"
                  prefix={<ClockCircleOutlined style={{ color: '#d97706' }} />}
                />
              </Card>
            </Col>
          </Row>

          <Card title="Mandatos por vertical" style={{ marginTop: 16 }}>
            {stats.porVertical.length === 0 ? (
              <Text type="secondary">Todavía no hay mandatos.</Text>
            ) : (
              stats.porVertical.map((v) => (
                <div key={v.vertical} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>{v.vertical}</Text>
                    <Text strong>{v.total}</Text>
                  </div>
                  <Progress
                    percent={Math.round((v.total / maxVertical) * 100)}
                    showInfo={false}
                    strokeColor={COLORS.accent}
                  />
                </div>
              ))
            )}
          </Card>
        </>
      ) : null}
    </div>
  );
}
