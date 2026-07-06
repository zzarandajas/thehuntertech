import { Navigate, Route, Routes } from 'react-router-dom';
import { App as AntApp, ConfigProvider } from 'antd';
import esES from 'antd/locale/es_ES';
import { themeConfig } from './theme';
import { AuthProvider } from './auth/AuthContext';
import PrivateRoute from './auth/PrivateRoute';
import LoginPage from './pages/LoginPage';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import ClientesListPage from './pages/ClientesListPage';
import ClienteDetailPage from './pages/ClienteDetailPage';
import CatalogosPage from './pages/CatalogosPage';
import UsuariosPage from './pages/UsuariosPage';
import MandatosListPage from './pages/MandatosListPage';
import MandatoDetailPage from './pages/MandatoDetailPage';
import TalentoListPage from './pages/TalentoListPage';
import CandidatoProfilePage from './pages/CandidatoProfilePage';
import PipelineBoardPage from './pages/PipelineBoardPage';
import InformePreviewPage from './pages/InformePreviewPage';
import PublicInformePage from './pages/PublicInformePage';

export default function App() {
  return (
    <ConfigProvider locale={esES} theme={themeConfig}>
      <AntApp>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/public/informes/:token" element={<PublicInformePage />} />
            <Route element={<PrivateRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/informes/:id" element={<InformePreviewPage />} />
                <Route path="/clientes" element={<ClientesListPage />} />
                <Route path="/clientes/:id" element={<ClienteDetailPage />} />
                <Route path="/mandatos" element={<MandatosListPage />} />
                <Route path="/mandatos/:id" element={<MandatoDetailPage />} />
                <Route path="/mandatos/:id/pipeline" element={<PipelineBoardPage />} />
                <Route path="/talento" element={<TalentoListPage />} />
                <Route path="/talento/:id" element={<CandidatoProfilePage />} />
                <Route path="/catalogos" element={<CatalogosPage />} />
                <Route path="/usuarios" element={<UsuariosPage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </AntApp>
    </ConfigProvider>
  );
}
