const request = require('supertest');
const app = require('../../src/app');

describe('Tests de validation des données - Cas simples', () => {
  describe('Tests d\'authentification - Validation des entrées', () => {
    test('Email invalide retourne une erreur de validation', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'email-invalide',
          password: 'motdepasse123'
        });
      
      expect([400, 422]).toContain(res.status);
      if (res.body.error) {
        expect(res.body.error).toMatch(/email|invalide/i);
      }
    });

    test('Mot de passe trop court retourne une erreur', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: '123'
        });
      
      expect([400, 422]).toContain(res.status);
    });

    test('Champs manquants retournent une erreur', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({});
      
      expect([400, 422]).toContain(res.status);
    });
  });

  describe('Tests de sécurité basiques', () => {
    test('Accès aux produits sans authentification', async () => {
      const res = await request(app)
        .get('/api/products');
      
      expect(res.status).toBe(401);
    });

    test('Création de produit sans authentification', async () => {
      const res = await request(app)
        .post('/api/products')
        .send({
          name: 'Produit Test',
          sku: 'TEST-001',
          price: 29.99,
          category: 'Electronics'
        });
      
      expect(res.status).toBe(401);
    });

    test('Accès aux commandes sans authentification', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({
          products: [
            {
              productId: '507f1f77bcf86cd799439011',
              quantity: 2
            }
          ]
        });
      
      expect(res.status).toBe(401);
    });
  });

  describe('Tests de routes et méthodes HTTP', () => {
    test('Route inexistante retourne 404', async () => {
      const res = await request(app)
        .get('/api/route-inexistante');
      
      expect(res.status).toBe(404);
    });

    test('Méthode HTTP non supportée', async () => {
      const res = await request(app)
        .patch('/health'); // PATCH n'est pas supporté sur /health
      
      expect([404, 405]).toContain(res.status);
    });
  });

  describe('Tests de Content-Type et format', () => {
    test('JSON malformé retourne une erreur', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send('{"email": "test@example.com", "password":');
      
      expect(res.status).toBe(400);
    });

    test('Content-Type incorrect', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .set('Content-Type', 'text/plain')
        .send('email=test@example.com&password=123456');
      
      expect([400, 415]).toContain(res.status);
    });
  });

  describe('Tests de validation de types de données', () => {
    test('Types de données incorrects dans l\'authentification', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 123, // Devrait être string
          password: ['motdepasse'] // Devrait être string
        });
      
      expect([400, 422]).toContain(res.status);
    });
  });

  describe('Tests de limites et edge cases', () => {
    test('Données très longues', async () => {
      const longString = 'A'.repeat(1000);
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: `${longString}@example.com`,
          password: 'motdepasse123'
        });
      
      expect([400, 413, 422]).toContain(res.status);
    });

    test('Caractères spéciaux dans les données', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test+special@example.com',
          password: 'motdepasse123!@#'
        });
      
      // Devrait soit réussir soit échouer gracieusement
      expect(res.status).toBeLessThan(500);
    });
  });

  describe('Tests de robustesse', () => {
    test('Requête vide', async () => {
      const res = await request(app)
        .post('/api/auth/register');
      
      expect([400, 422]).toContain(res.status);
    });

    test('Headers manquants', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'motdepasse123'
        });
      
      // Devrait gérer gracieusement
      expect(res.status).toBeLessThan(500);
    });
  });
});
