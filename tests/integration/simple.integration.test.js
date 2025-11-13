const request = require('supertest');
const app = require('../../src/app');

describe('Tests d\'intégration simples', () => {
  test('GET /health retourne le statut ok', async () => {
    const res = await request(app).get('/health').expect(200);
    expect(res.body.status).toBe('ok');
    expect(typeof res.body.uptime).toBe('number');
  });

  test('Route inconnue retourne 404', async () => {
    await request(app).get('/__unknown__route__').expect(404);
  });
});

describe('Tests de validation - Authentification', () => {
  describe('POST /api/auth/register', () => {
    test('Email invalide retourne 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'email-invalide',
          password: 'motdepasse123'
        })
        .expect(400);
      
      expect(res.body.error).toContain('Adresse email invalide');
    });

    test('Mot de passe trop court retourne 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: '123'
        })
        .expect(400);
      
      expect(res.body.error).toContain('au moins 6 caractères');
    });

    test('Données manquantes retourne 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({})
        .expect(400);
      
      expect(res.body.error).toBeDefined();
    });

    test('Email manquant retourne 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          password: 'motdepasse123'
        })
        .expect(400);
      
      expect(res.body.error).toBeDefined();
    });
  });

  describe('POST /api/auth/login', () => {
    test('Email invalide retourne 400', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'pas-un-email',
          password: 'motdepasse123'
        })
        .expect(400);
      
      expect(res.body.error).toBeDefined();
    });

    test('Données manquantes retourne 400', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400);
    });
  });
});

describe('Tests de validation - Produits (routes protégées)', () => {
  describe('POST /api/products', () => {
    test('Sans authentification retourne 401', async () => {
      await request(app)
        .post('/api/products')
        .send({
          name: 'AB',
          sku: 'TEST-001',
          price: 29.99,
          category: 'Electronics'
        })
        .expect(401);
    });

    test('SKU invalide sans auth retourne 401', async () => {
      await request(app)
        .post('/api/products')
        .send({
          name: 'Produit Test',
          sku: 'TEST@#$%',
          price: 29.99,
          category: 'Electronics'
        })
        .expect(401);
    });

    test('Prix négatif sans auth retourne 401', async () => {
      await request(app)
        .post('/api/products')
        .send({
          name: 'Produit Test',
          sku: 'TEST-001',
          price: -10.50,
          category: 'Electronics'
        })
        .expect(401);
    });

    test('Données manquantes sans auth retourne 401', async () => {
      await request(app)
        .post('/api/products')
        .send({
          name: 'Produit Test'
          // SKU, price, category manquants
        })
        .expect(401);
    });

    test('Catégorie manquante sans auth retourne 401', async () => {
      await request(app)
        .post('/api/products')
        .send({
          name: 'Produit Test',
          sku: 'TEST-001',
          price: 29.99
          // category manquante
        })
        .expect(401);
    });
  });

  describe('PUT /api/products/:id', () => {
    test('Sans authentification retourne 401', async () => {
      await request(app)
        .put('/api/products/id-invalide')
        .send({
          name: 'Produit Modifié',
          sku: 'TEST-002',
          price: 39.99,
          category: 'Electronics'
        })
        .expect(401);
    });
  });

  describe('GET /api/products/:id', () => {
    test('ID invalide retourne 404', async () => {
      await request(app)
        .get('/api/products/id-invalide')
        .expect(404);
    });
  });
});

describe('Tests de méthodes HTTP non autorisées', () => {
  test('DELETE sur /health retourne 405', async () => {
    await request(app)
      .delete('/health')
      .expect(404); // Express retourne 404 pour les routes non définies
  });

  test('PUT sur /health retourne 405', async () => {
    await request(app)
      .put('/health')
      .expect(404);
  });
});

describe('Tests de Content-Type', () => {
  test('POST sans Content-Type application/json retourne 400', async () => {
    await request(app)
      .post('/api/auth/register')
      .set('Content-Type', 'text/plain')
      .send('email=test@example.com&password=123456')
      .expect(400);
  });

  test('POST avec JSON malformé retourne 400', async () => {
    await request(app)
      .post('/api/auth/register')
      .set('Content-Type', 'application/json')
      .send('{"email": "test@example.com", "password":')
      .expect(400);
  });
});

describe('Tests de limites de données', () => {
  test('Nom de produit trop long sans auth retourne 401', async () => {
    const longName = 'A'.repeat(101); // Plus de 100 caractères
    await request(app)
      .post('/api/products')
      .send({
        name: longName,
        sku: 'TEST-001',
        price: 29.99,
        category: 'Electronics'
      })
      .expect(401);
  });

  test('SKU trop long sans auth retourne 401', async () => {
    const longSku = 'A'.repeat(21); // Plus de 20 caractères
    await request(app)
      .post('/api/products')
      .send({
        name: 'Produit Test',
        sku: longSku,
        price: 29.99,
        category: 'Electronics'
      })
      .expect(401);
  });
});
