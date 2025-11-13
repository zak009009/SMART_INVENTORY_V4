const request = require('supertest');
const app = require('../../src/app');

describe('Tests d\'intégration de vérification de santé', () => {
  describe('GET /health', () => {
    test('devrait retourner le statut de santé', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('timestamp');
      expect(typeof response.body.uptime).toBe('number');
      expect(response.body.uptime).toBeGreaterThan(0);
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
    });

    test('devrait retourner un format de réponse cohérent', async () => {
      const response1 = await request(app).get('/health');
      const response2 = await request(app).get('/health');

      expect(response1.body.status).toBe(response2.body.status);
      expect(response2.body.uptime).toBeGreaterThanOrEqual(response1.body.uptime);
    });
  });

  describe('Gestion des erreurs', () => {
    test('devrait retourner 404 pour des routes inexistantes', async () => {
      await request(app)
        .get('/non-existent-route')
        .expect(404);
    });

    test('devrait gérer le JSON mal formé dans le corps de la requête', async () => {
      await request(app)
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}')
        .expect(400);
    });
  });

  describe('CORS et en-têtes de sécurité', () => {
    test('devrait inclure les en-têtes de sécurité', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.headers).toHaveProperty('x-dns-prefetch-control');
      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers).toHaveProperty('x-download-options');
      expect(response.headers).toHaveProperty('x-content-type-options');
    });

    test('devrait gérer les requêtes CORS preflight', async () => {
      const response = await request(app)
        .options('/api/products')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'GET')
        .expect(204);
      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });
  });
});
