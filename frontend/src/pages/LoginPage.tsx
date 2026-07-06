import { useState } from 'react';
import type { CSSProperties } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Alert, Button, Form, Input } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { useAuth } from '../auth/AuthContext';
import { COLORS } from '../theme';
import { Monograma } from '../components/Brand';
import './LoginPage.css';

interface Credenciales {
  email: string;
  password: string;
}

function MarcaTexto({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  return (
    <span className="login-mark" style={{ color: tone === 'light' ? '#f8fafc' : COLORS.navy }}>
      <Monograma tone={tone} />
      <span>
        TheHunter<span className="login-mark__dot">.tech</span>
      </span>
    </span>
  );
}

export default function LoginPage() {
  const { usuario, cargando, login } = useAuth();
  const navigate = useNavigate();
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Si ya hay sesión, no mostrar el login.
  if (!cargando && usuario) {
    return <Navigate to="/" replace />;
  }

  const onFinish = async (valores: Credenciales) => {
    setError(null);
    setEnviando(true);
    try {
      await login(valores.email, valores.password);
      navigate('/', { replace: true });
    } catch (err) {
      const mensaje =
        (err as { response?: { data?: { mensaje?: string } } })?.response?.data?.mensaje ??
        'No se pudo iniciar sesión. Inténtalo de nuevo.';
      setError(mensaje);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="login-shell" style={{ '--login-gold': COLORS.gold } as CSSProperties}>
      {/* ---------------------------- Panel de marca --------------------------- */}
      <aside className="login-brand">
        <div className="login-brand__photo" />
        <div className="login-brand__grid" />

        <div className="login-brand__top">
          <MarcaTexto tone="light" />
        </div>

        <div className="login-brand__mid">
          <span className="login-eyebrow">Executive Search</span>
          <h1 className="login-headline">
            Identificamos a los líderes que <em>definen el futuro</em>.
          </h1>
          <p className="login-lead">
            Plataforma interna de búsqueda de altos directivos y asesoramiento de liderazgo
            para compañías que no se conforman con lo previsible.
          </p>
        </div>

        <div className="login-brand__bottom">
          <div className="login-pillars">
            <span>Executive Search</span>
            <span className="login-pillars__sep" />
            <span>Leadership Advisory</span>
            <span className="login-pillars__sep" />
            <span>Board &amp; Governance</span>
          </div>
          <p className="login-confidential">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 2 4 5v6c0 5 3.4 8.5 8 11 4.6-2.5 8-6 8-11V5l-8-3Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </svg>
            Acceso restringido · Información estrictamente confidencial
          </p>
        </div>
      </aside>

      {/* --------------------------- Panel de acceso --------------------------- */}
      <main className="login-panel">
        <div className="login-card">
          <div className="login-card__mark">
            <MarcaTexto tone="dark" />
          </div>

          <h2 className="login-title">Bienvenido de nuevo</h2>
          <p className="login-subtitle">
            Introduce tus credenciales corporativas para acceder a la plataforma.
          </p>

          {error && (
            <Alert
              type="error"
              message={error}
              showIcon
              style={{ marginBottom: 18 }}
              closable
              onClose={() => setError(null)}
            />
          )}

          <Form layout="vertical" onFinish={onFinish} requiredMark={false} disabled={enviando}>
            <Form.Item
              label="Correo corporativo"
              name="email"
              rules={[
                { required: true, message: 'Introduce tu email' },
                { type: 'email', message: 'Email no válido' },
              ]}
            >
              <Input
                size="large"
                prefix={<MailOutlined style={{ color: '#94a3b8' }} />}
                placeholder="nombre@thehunter.tech"
                autoComplete="username"
                autoFocus
              />
            </Form.Item>

            <Form.Item
              label="Contraseña"
              name="password"
              rules={[{ required: true, message: 'Introduce tu contraseña' }]}
            >
              <Input.Password
                size="large"
                prefix={<LockOutlined style={{ color: '#94a3b8' }} />}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </Form.Item>

            <a className="login-forgot" href="mailto:soporte@thehunter.tech?subject=Recuperar%20acceso">
              ¿Has olvidado tu acceso?
            </a>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                className="login-submit"
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={enviando}
              >
                Acceder a la plataforma
              </Button>
            </Form.Item>
          </Form>

          <div className="login-foot">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="4" y="10" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.6" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.6" />
            </svg>
            Conexión cifrada de extremo a extremo · © {new Date().getFullYear()} TheHunter.tech
          </div>
        </div>
      </main>
    </div>
  );
}
