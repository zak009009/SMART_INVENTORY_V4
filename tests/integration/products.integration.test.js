const request = require('supertest');
const app = require('../../src/app');
const Product = require('../../src/models/product.model');
const User = require('../../src/models/user.model');

describe('Tests d\'intégration des produits', () => {
  let authToken;
  let adminToken;
  let testProduct;

  beforeAll(async () => {
    // S'assurer que JWT_SECRET est défini pour les tests
    if (!process.env.JWT_SECRET) {
      process.env.JWT_SECRET = 'test_jwt_secret_key';
    }

    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: `testuser${Date.now()}@example.com`,
        password: 'password123',
        role: 'user'
      });
    
    if (!userResponse.body.token) {
      throw new Error('Échec de la génération du token utilisateur: ' + JSON.stringify(userResponse.body));
    }
    authToken = userResponse.body.token;

    const adminResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: `admin${Date.now()}@example.com`,
        password: 'password123',
        role: 'admin'
      });
    
    if (!adminResponse.body.token) {
      throw new Error('Échec de la génération du token admin: ' + JSON.stringify(adminResponse.body));
    }
    adminToken = adminResponse.body.token;
  });

  beforeEach(async () => {
    testProduct = await Product.create({
      name: 'Test Product',
      sku: `TEST-${Date.now()}`,
      price: 99.99,
      category: 'Electronics',
      stock: 10,
      inStock: true
    });
  });

  describe('GET /api/products', () => {
    test('devrait récupérer la liste des produits sans authentification', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.meta).toHaveProperty('total');
      expect(response.body.meta).toHaveProperty('page');
      expect(response.body.meta).toHaveProperty('pages');
    });

    test('devrait filtrer les produits par catégorie', async () => {
      await Product.create({
        name: 'Book Product',
        sku: 'BOOK-001',
        price: 19.99,
        category: 'Books',
        stock: 5,
        inStock: true
      });

      const response = await request(app)
        .get('/api/products?category=Electronics')
        .expect(200);

      expect(response.body.data.length).toBeGreaterThan(0);
      response.body.data.forEach(product => {
        expect(product.category).toBe('Electronics');
      });
    });

    test('devrait filtrer les produits par statut de stock', async () => {
      await Product.create({
        name: 'Out of Stock Product',
        sku: 'OOS-001',
        price: 29.99,
        category: 'Electronics',
        stock: 0,
        inStock: false
      });

      const response = await request(app)
        .get('/api/products?inStock=true')
        .expect(200);

      response.body.data.forEach(product => {
        expect(product.inStock).toBe(true);
      });
    });

    test('devrait supporter la pagination', async () => {
      for (let i = 0; i < 15; i++) {
        await Product.create({
          name: `Product ${i}`,
          sku: `PROD-${i.toString().padStart(3, '0')}`,
          price: 10 + i,
          category: 'Test',
          stock: i,
          inStock: i % 2 === 0
        });
      }

      const response = await request(app)
        .get('/api/products?page=2&limit=5')
        .expect(200);

      expect(response.body.data.length).toBeLessThanOrEqual(5);
      expect(response.body.meta.page).toBe(2);
    });
  });

  describe('GET /api/products/:id', () => {
    test('devrait récupérer un produit par id', async () => {
      const response = await request(app)
        .get(`/api/products/${testProduct._id}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data._id).toBe(testProduct._id.toString());
      expect(response.body.data.name).toBe(testProduct.name);
      expect(response.body.data.sku).toBe(testProduct.sku);
    });

    test('devrait retourner 404 pour un produit inexistant (GET)', async () => {
      const response = await request(app)
        .get('/api/products/507f1f77bcf86cd799439011')
        .expect(404);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Produit introuvable');
    });

    test('devrait retourner 404 pour un id de produit invalide', async () => {
      const response = await request(app)
        .get('/api/products/invalid-id')
        .expect(404);
      expect(response.body.status).toBe('error');
    });
  });

  describe('POST /api/products', () => {
    test('devrait créer un produit avec authentification admin', async () => {
      const productData = {
        name: 'New Product',
        sku: 'NEW-001',
        price: 149.99,
        category: 'Electronics',
        stock: 20,
        inStock: true
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(productData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data.name).toBe(productData.name);
      expect(response.body.data.sku).toBe(productData.sku);
      expect(response.body.data.price).toBe(productData.price);

      const productInDb = await Product.findOne({ sku: productData.sku });
      expect(productInDb).toBeTruthy();
    });

    test('devrait retourner 401 sans authentification (POST)', async () => {
      await request(app)
        .post('/api/products')
        .send({
          name: 'New Product',
          sku: 'NEW-001',
          price: 149.99,
          category: 'Electronics'
        })
        .expect(401);
    });

    test('devrait retourner 403 avec le rôle user (POST)', async () => {
      await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'New Product',
          sku: 'NEW-001',
          price: 149.99,
          category: 'Electronics'
        })
        .expect(403);
    });

    test('devrait retourner 400 pour des données de produit invalides', async () => {
      const invalidData = {
        name: 'New Product',
        price: 149.99,
        category: 'Electronics'
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);
    });

    test('devrait retourner 400 pour un SKU dupliqué', async () => {
      const productData = {
        name: 'Duplicate SKU Product',
        sku: testProduct.sku,
        price: 149.99,
        category: 'Electronics'
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(productData)
        .expect(400);
    });
  });

  describe('PUT /api/products/:id', () => {
    test('devrait mettre à jour un produit avec authentification admin', async () => {
      const updateData = {
        name: 'Updated Product Name',
        price: 199.99,
        stock: 15
      };

      const response = await request(app)
        .put(`/api/products/${testProduct._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.price).toBe(updateData.price);
      expect(response.body.data.stock).toBe(updateData.stock);

      const updatedProduct = await Product.findById(testProduct._id);
      expect(updatedProduct.name).toBe(updateData.name);
      expect(updatedProduct.price).toBe(updateData.price);
    });

    test('devrait retourner 404 pour un produit inexistant (PUT)', async () => {
      const response = await request(app)
        .put('/api/products/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Name' })
        .expect(404);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Produit introuvable');
    });

    test('devrait retourner 401 sans authentification (PUT)', async () => {
      await request(app)
        .put(`/api/products/${testProduct._id}`)
        .send({ name: 'Updated Name' })
        .expect(401);
    });

    test('devrait retourner 403 avec le rôle user (PUT)', async () => {
      await request(app)
        .put(`/api/products/${testProduct._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated Name' })
        .expect(403);
    });
  });

  describe('DELETE /api/products/:id', () => {
    test('devrait supprimer un produit avec authentification admin', async () => {
      await request(app)
        .delete(`/api/products/${testProduct._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);

      const deletedProduct = await Product.findById(testProduct._id);
      expect(deletedProduct).toBeNull();
    });

    test('devrait retourner 404 pour un produit inexistant (DELETE)', async () => {
      const response = await request(app)
        .delete('/api/products/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Produit introuvable');
    });

    test('devrait retourner 401 sans authentification (DELETE)', async () => {
      await request(app)
        .delete(`/api/products/${testProduct._id}`)
        .expect(401);
    });

    test('devrait retourner 403 avec le rôle user (DELETE)', async () => {
      await request(app)
        .delete(`/api/products/${testProduct._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);
    });
  });
});
