import request from 'supertest';
import app from '../src/app';

describe('GET /api/health', () => {
  it('responde 200 con { ok: true }', async () => {
    const respuesta = await request(app).get('/api/health');
    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toEqual({ ok: true });
  });
});
