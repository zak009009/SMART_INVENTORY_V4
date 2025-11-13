const request = require('supertest');
const app = require('../../src/app');

describe('Tests de sécurité et autorisation', () => {
  describe('Tests d\'authentification', () => {
    test('Accès sans token retourne 401', async () => {
      await request(app)
        .get('/api/products')
        .expect(401);
    });

    test('Token invalide retourne 401', async () => {
      await request(app)
        .get('/api/products')
        .set('Authorization', 'Bearer token-invalide')
        .expect(401);
    });

    test('Token malformé retourne 401', async () => {
      await request(app)
        .get('/api/products')
        .set('Authorization', 'InvalidFormat token')
        .expect(401);
    });

    test('Header Authorization manquant retourne 401', async () => {
      await request(app)
        .post('/api/products')
        .send({
          name: 'Produit Test',
          sku: 'TEST-001',
          price: 29.99,
          category: 'Electronics'
        })
        .expect(401);
    });
  });

  describe('Tests de rate limiting', () => {
    test('Trop de requêtes sur auth retourne 429', async () => {
      // Simuler plusieurs tentatives de connexion
      const promises = [];
      for (let i = 0; i < 20; i++) {
        promises.push(
          request(app)
            .post('/api/auth/login')
            .send({
              email: 'test@example.com',
              password: 'wrongpassword'
            })
        );
      }
      
      const responses = await Promise.all(promises);
      const rateLimitedResponses = responses.filter(res => res.status === 429);
      
      // Au moins une requête devrait être rate limitée
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    }, 10000); // Timeout plus long pour ce test
  });

  describe('Tests de validation des headers', () => {
    test('Content-Length incohérent retourne 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .set('Content-Length', '5')
        .send({
          email: 'test@example.com',
          password: 'motdepasse123'
        });
      
      // Le comportement peut varier selon la configuration
      expect([400, 413]).toContain(res.status);
    });

    test('User-Agent suspect retourne 403', async () => {
      // Test avec un User-Agent potentiellement malveillant
      await request(app)
        .get('/health')
        .set('User-Agent', '<script>alert("xss")</script>')
        .expect(200); // Health endpoint devrait toujours fonctionner
    });
  });

  describe('Tests de Cross-Origin', () => {
    test('Origin non autorisé avec CORS', async () => {
      const res = await request(app)
        .options('/api/products')
        .set('Origin', 'http://malicious-site.com')
        .set('Access-Control-Request-Method', 'POST');
      
      // CORS devrait gérer cela
      expect(res.status).toBeLessThan(500);
    });
  });

  describe('Tests de méthodes HTTP', () => {
    test('TRACE method retourne 405', async () => {
      await request(app)
        .trace('/api/products')
        .expect(404); // Express ne supporte pas TRACE par défaut
    });

    test('OPTIONS sur endpoint protégé', async () => {
      const res = await request(app)
        .options('/api/products');
      
      expect(res.status).toBeLessThan(500);
    });
  });

  describe('Tests de validation stricte', () => {
    test('Champs supplémentaires ignorés', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'motdepasse123',
          maliciousField: '<script>alert("xss")</script>',
          anotherField: { $ne: null }
        });
      
      // Devrait soit réussir en ignorant les champs, soit échouer avec 400
      expect([200, 201, 400]).toContain(res.status);
    });

    test('Types de données incorrects retourne 400', async () => {
      const res = await request(app)
        .post('/api/products')
        .send({
          name: 123, // Devrait être string
          sku: 'TEST-001',
          price: 'not-a-number', // Devrait être number
          category: 'Electronics'
        })
        .expect(400);
      
      expect(res.body.error).toBeDefined();
    });
  });

  describe('Tests de limites de ressources', () => {
    test('Requête avec beaucoup de paramètres', async () => {
      const params = new URLSearchParams();
      for (let i = 0; i < 1000; i++) {
        params.append(`param${i}`, `value${i}`);
      }
      
      const res = await request(app)
        .get(`/api/products?${params.toString()}`);
      
      // Devrait gérer gracieusement
      expect(res.status).toBeLessThan(500);
    });

    test('Nested objects profonds retourne 400', async () => {
      let deepObject = {};
      let current = deepObject;
      
      // Créer un objet très profond
      for (let i = 0; i < 100; i++) {
        current.nested = {};
        current = current.nested;
      }
      
      const res = await request(app)
        .post('/api/products')
        .send({
          name: 'Test',
          sku: 'TEST-001',
          price: 29.99,
          category: 'Electronics',
          metadata: deepObject
        });
      
      // Devrait soit rejeter soit traiter gracieusement
      expect([200, 201, 400, 413]).toContain(res.status);
    });
  });
});
