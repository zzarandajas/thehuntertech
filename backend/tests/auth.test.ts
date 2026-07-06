import request from 'supertest';
import app from '../src/app';

const EMAIL = process.env.ADMIN_EMAIL;
const PASSWORD = process.env.ADMIN_PASSWORD;

describe('Autenticación', () => {
  it('login con credenciales válidas devuelve token y usuario', async () => {
    if (!EMAIL || !PASSWORD) {
      // Sin admin configurado en el entorno de test, se omite.
      return;
    }
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: EMAIL, password: PASSWORD });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    expect(res.body.usuario.email).toBe(EMAIL);
  });

  it('login con contraseña incorrecta devuelve 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: EMAIL || 'inexistente@thehunter.tech', password: 'contraseña-incorrecta-xyz' });
    expect(res.status).toBe(401);
  });

  it('GET /api/auth/me sin token devuelve 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('GET /api/usuarios sin token devuelve 401', async () => {
    const res = await request(app).get('/api/usuarios');
    expect(res.status).toBe(401);
  });
});
