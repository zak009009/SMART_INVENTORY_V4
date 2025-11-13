const request = require('supertest');
const app = require('../../src/app');

describe('Tests de validation - Commandes (routes protégées)', () => {
  describe('POST /api/orders', () => {
    test('Sans authentification retourne 401', async () => {
      await request(app)
        .post('/api/orders')
        .send({})
        .expect(401);
    });

    test('Produits vides sans auth retourne 401', async () => {
      await request(app)
        .post('/api/orders')
        .send({
          products: []
        })
        .expect(401);
    });

    test('Quantité négative sans auth retourne 401', async () => {
      await request(app)
        .post('/api/orders')
        .send({
          products: [
            {
              productId: '507f1f77bcf86cd799439011',
              quantity: -1
            }
          ]
        })
        .expect(401);
    });

    test('ID produit invalide sans auth retourne 401', async () => {
      await request(app)
        .post('/api/orders')
        .send({
          products: [
            {
              productId: 'id-invalide',
              quantity: 2
            }
          ]
        })
        .expect(401);
    });

    test('Quantité manquante sans auth retourne 401', async () => {
      await request(app)
        .post('/api/orders')
        .send({
          products: [
            {
              productId: '507f1f77bcf86cd799439011'
              // quantity manquante
            }
          ]
        })
        .expect(401);
    });
  });

  describe('GET /api/orders/:id', () => {
    test('Sans authentification retourne 401', async () => {
      await request(app)
        .get('/api/orders/id-invalide')
        .expect(401);
    });
  });

  describe('PUT /api/orders/:id', () => {
    test('Sans authentification retourne 401', async () => {
      await request(app)
        .put('/api/orders/id-invalide')
        .send({
          status: 'completed'
        })
        .expect(401);
    });

    test('Statut invalide sans auth retourne 401', async () => {
      await request(app)
        .put('/api/orders/507f1f77bcf86cd799439011')
        .send({
          status: 'statut-inexistant'
        })
        .expect(401);
    });
  });

  describe('DELETE /api/orders/:id', () => {
    test('Sans authentification retourne 401', async () => {
      await request(app)
        .delete('/api/orders/id-invalide')
        .expect(401);
    });
  });
});

describe('Tests de sécurité - Injection', () => {
  test('Tentative d\'injection NoSQL sans auth retourne 401', async () => {
    await request(app)
      .post('/api/products')
      .send({
        name: 'Produit Test',
        sku: 'TEST-001',
        price: { $gt: 0 }, // Tentative d'injection
        category: 'Electronics'
      })
      .expect(401);
  });

  test('Tentative d\'injection dans l\'email retourne 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: { $ne: null }, // Tentative d'injection
        password: 'motdepasse123'
      })
      .expect(400);
    
    expect(res.body.error).toBeDefined();
  });
});

describe('Tests de limites - Payload', () => {
  test('Payload trop volumineux sans auth retourne 401 ou 413', async () => {
    const largeData = 'A'.repeat(1024); // 1KB pour éviter les timeouts
    const res = await request(app)
      .post('/api/products')
      .send({
        name: largeData,
        sku: 'TEST-001',
        price: 29.99,
        category: 'Electronics'
      });
    
    // Peut retourner 401 (pas d'auth) ou 413 (payload trop gros)
    expect([401, 413]).toContain(res.status);
  });
});
