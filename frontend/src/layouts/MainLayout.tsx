import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Avatar, Drawer, Dropdown, type MenuProps } from 'antd';
import {
  AppstoreOutlined,
  ContactsOutlined,
  DashboardOutlined,
  FileSearchOutlined,
  LogoutOutlined,
  MenuOutlined,
  SolutionOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { ReactNode } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Marca } from '../components/Brand';
import './MainLayout.css';

// Etiqueta de rol para la UI (consultor se muestra como "Socio").
const ETIQUETA_ROL: Record<string, string> = {
  admin: 'Administrador',
  consultor: 'Socio',
};

interface NavItem {
  key: string;
  icon: ReactNode;
  label: string;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { key: '/', icon: <DashboardOutlined />, label: 'Inicio' },
  { key: '/mandatos', icon: <FileSearchOutlined />, label: 'Mandatos' },
  { key: '/talento', icon: <ContactsOutlined />, label: 'Talento' },
  { key: '/clientes', icon: <TeamOutlined />, label: 'Clientes' },
  { key: '/catalogos', icon: <AppstoreOutlined />, label: 'Catálogos', adminOnly: true },
  { key: '/usuarios', icon: <SolutionOutlined />, label: 'Usuarios', adminOnly: true },
];

export default function MainLayout() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const esAdmin = usuario?.rol === 'admin';
  const items = NAV_ITEMS.filter((i) => !i.adminOnly || esAdmin);

  // Marca como activo el item cuya ruta coincide (prefijo más largo gana).
  const activo =
    items
      .map((i) => i.key)
      .filter((k) => (k === '/' ? location.pathname === '/' : location.pathname.startsWith(k)))
      .sort((a, b) => b.length - a.length)[0] ?? '/';

  // Refuerza el efecto glass con una sombra sutil una vez el usuario hace scroll.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Cierra el menú móvil al cambiar de ruta.
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  const ir = (key: string) => {
    if (key !== location.pathname) navigate(key);
  };

  const cerrarSesion = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const menuUsuario: MenuProps = {
    items: [{ key: 'logout', icon: <LogoutOutlined />, label: 'Cerrar sesión', danger: true }],
    onClick: ({ key }) => {
      if (key === 'logout') cerrarSesion();
    },
  };

  return (
    <div className="app-shell">
      <header className={`app-header${scrolled ? ' is-scrolled' : ''}`}>
        <div className="app-header__inner">
          <button className="app-brand" onClick={() => ir('/')} aria-label="Ir al inicio">
            <Marca tone="dark" size="sm" />
          </button>

          <nav className="app-nav" aria-label="Navegación principal">
            {items.map((it) => (
              <button
                key={it.key}
                className={`app-nav__item${activo === it.key ? ' is-active' : ''}`}
                onClick={() => ir(it.key)}
                aria-current={activo === it.key ? 'page' : undefined}
              >
                <span className="app-nav__icon">{it.icon}</span>
                {it.label}
              </button>
            ))}
          </nav>

          <div className="app-header__right">
            <Dropdown menu={menuUsuario} trigger={['click']} placement="bottomRight">
              <button className="app-user" aria-label="Menú de usuario">
                <Avatar size={34} icon={<UserOutlined />} className="app-user__avatar" />
                <span className="app-user__meta">
                  <span className="app-user__name">{usuario?.nombre}</span>
                  <span className="app-user__role">
                    {usuario ? ETIQUETA_ROL[usuario.rol] ?? usuario.rol : ''}
                  </span>
                </span>
              </button>
            </Dropdown>

            <button
              className="app-burger"
              onClick={() => setDrawerOpen(true)}
              aria-label="Abrir menú de navegación"
            >
              <MenuOutlined />
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        <Outlet />
      </main>

      <Drawer
        placement="right"
        width={280}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        closable={false}
        styles={{ body: { padding: 0 }, header: { display: 'none' } }}
        className="app-drawer"
      >
        <div className="app-drawer__brand">
          <Marca tone="dark" size="sm" />
        </div>
        <nav className="app-drawer__nav">
          {items.map((it) => (
            <button
              key={it.key}
              className={`app-drawer__item${activo === it.key ? ' is-active' : ''}`}
              onClick={() => ir(it.key)}
            >
              <span className="app-nav__icon">{it.icon}</span>
              {it.label}
            </button>
          ))}
        </nav>
        <div className="app-drawer__foot">
          <div className="app-drawer__user">
            <Avatar size={38} icon={<UserOutlined />} className="app-user__avatar" />
            <span className="app-user__meta">
              <span className="app-user__name">{usuario?.nombre}</span>
              <span className="app-user__role">
                {usuario ? ETIQUETA_ROL[usuario.rol] ?? usuario.rol : ''}
              </span>
            </span>
          </div>
          <button className="app-drawer__logout" onClick={cerrarSesion}>
            <LogoutOutlined /> Cerrar sesión
          </button>
        </div>
      </Drawer>
    </div>
  );
}
