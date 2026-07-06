import { ConfigProvider, Layout, Typography, theme } from 'antd';
import esES from 'antd/locale/es_ES';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

// Sprint 0: pantalla en blanco que confirma que Ant Design (theme + locale es_ES) carga.
function App() {
  return (
    <ConfigProvider
      locale={esES}
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: { colorPrimary: '#1f6feb' },
      }}
    >
      <Layout style={{ minHeight: '100vh' }}>
        <Content
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <Title level={2} style={{ margin: 0 }}>
            TheHunter.tech
          </Title>
          <Paragraph type="secondary" style={{ margin: 0 }}>
            Sprint 0 — Ant Design cargado correctamente.
          </Paragraph>
        </Content>
      </Layout>
    </ConfigProvider>
  );
}

export default App;
