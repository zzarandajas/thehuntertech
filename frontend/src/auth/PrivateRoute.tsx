import { Navigate, Outlet } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuth } from './AuthContext';

// Protege rutas: espera la hidratación, y si no hay usuario redirige a /login.
export default function PrivateRoute() {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
