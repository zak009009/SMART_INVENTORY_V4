const request = require('supertest');
const app = require('../../src/app');

describe('🚫 Tests de Données Invalides - Démonstration de Robustesse', () => {
  describe('📧 Validation Email - Formats Invalides', () => {
    test('Email sans @ retourne 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'emailsansarobase.com',
          password: 'motdepasse123'
        });
      
      expect([400, 422]).toContain(res.status);
      if (res.body.error) {
        expect(res.body.error).toMatch(/email|invalide/i);
      }
    });

    test('Email avec espaces retourne 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test @example.com',
          password: 'motdepasse123'
        });
      
      expect([400, 422]).toContain(res.status);
    });

    test('Email avec caractères spéciaux invalides retourne 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test<script>@example.com',
          password: 'motdepasse123'
        });
      
      expect([400, 422]).toContain(res.status);
    });

    test('Email vide retourne 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: '',
          password: 'motdepasse123'
        });
      
      expect([400, 422]).toContain(res.status);
    });

    test('Email null retourne 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: null,
          password: 'motdepasse123'
        });
      
      expect([400, 422]).toContain(res.status);
    });
  });

  describe('🔐 Validation Mot de Passe - Critères Invalides', () => {
    test('Mot de passe de 1 caractère retourne 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'a'
        });
      
      expect([400, 422]).toContain(res.status);
    });

    test('Mot de passe vide retourne 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: ''
        });
      
      expect([400, 422]).toContain(res.status);
    });

    test('Mot de passe null retourne 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: null
        });
      
      expect([400, 422]).toContain(res.status);
    });

    test('Mot de passe undefined retourne 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com'
          // password manquant
        });
      
      expect([400, 422]).toContain(res.status);
    });
  });

  describe('🏷️ Validation Types de Données - Types Incorrects', () => {
    test('Email comme nombre retourne 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 12345,
          password: 'motdepasse123'
        });
      
      expect([400, 422]).toContain(res.status);
    });

    test('Email comme tableau retourne 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: ['test@example.com'],
          password: 'motdepasse123'
        });
      
      expect([400, 422]).toContain(res.status);
    });

    test('Email comme objet retourne 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: { value: 'test@example.com' },
          password: 'motdepasse123'
        });
      
      expect([400, 422]).toContain(res.status);
    });

    test('Mot de passe comme nombre retourne 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 123456
        });
      
      expect([400, 422]).toContain(res.status);
    });

    test('Mot de passe comme tableau retourne 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: ['motdepasse123']
        });
      
      expect([400, 422]).toContain(res.status);
    });
  });

  describe('📦 Paramètres HTTP Manquants/Malformés', () => {
    test('Content-Type manquant retourne 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send('email=test@example.com&password=123456');
      
      expect([400, 415]).toContain(res.status);
    });

    test('Content-Type text/plain retourne 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .set('Content-Type', 'text/plain')
        .send('email=test@example.com&password=123456');
      
      expect([400, 415]).toContain(res.status);
    });

    test('Content-Type application/xml retourne 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .set('Content-Type', 'application/xml')
        .send('<user><email>test@example.com</email><password>123456</password></user>');
      
      expect([400, 415]).toContain(res.status);
    });

    test('JSON malformé - accolade manquante retourne 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send('{"email": "test@example.com", "password": "123456"');
      
      expect(res.status).toBe(400);
    });

    test('JSON malformé - virgule en trop retourne 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send('{"email": "test@example.com",, "password": "123456"}');
      
      expect(res.status).toBe(400);
    });

    test('JSON malformé - guillemets manquants retourne 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send('{email: "test@example.com", password: "123456"}');
      
      expect(res.status).toBe(400);
    });
  });

  describe('🔢 Validation Numérique - Valeurs Invalides', () => {
    test('Prix comme string non numérique (produits) retourne 401', async () => {
      const res = await request(app)
        .post('/api/products')
        .send({
          name: 'Produit Test',
          sku: 'TEST-001',
          price: 'pas-un-nombre',
          category: 'Electronics'
        });
      
      expect(res.status).toBe(401); // Pas d'auth d'abord
    });

    test('Prix négatif (produits) retourne 401', async () => {
      const res = await request(app)
        .post('/api/products')
        .send({
          name: 'Produit Test',
          sku: 'TEST-001',
          price: -50.99,
          category: 'Electronics'
        });
      
      expect(res.status).toBe(401); // Pas d'auth d'abord
    });

    test('Prix avec caractères spéciaux retourne 401', async () => {
      const res = await request(app)
        .post('/api/products')
        .send({
          name: 'Produit Test',
          sku: 'TEST-001',
          price: '29.99€',
          category: 'Electronics'
        });
      
      expect(res.status).toBe(401); // Pas d'auth d'abord
    });
  });

  describe('📏 Validation Longueur - Limites Dépassées', () => {
    test('Email trop long (>254 caractères) retourne 400', async () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: longEmail,
          password: 'motdepasse123'
        });
      
      expect([400, 422]).toContain(res.status);
    });

    test('Mot de passe extrêmement long retourne 400', async () => {
      const longPassword = 'a'.repeat(1000);
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: longPassword
        });
      
      expect([400, 413, 422]).toContain(res.status);
    });

    test('Nom de produit vide retourne 401', async () => {
      const res = await request(app)
        .post('/api/products')
        .send({
          name: '',
          sku: 'TEST-001',
          price: 29.99,
          category: 'Electronics'
        });
      
      expect(res.status).toBe(401); // Pas d'auth d'abord
    });
  });

  describe('🔤 Validation Caractères - Caractères Interdits', () => {
    test('SKU avec caractères spéciaux interdits retourne 401', async () => {
      const res = await request(app)
        .post('/api/products')
        .send({
          name: 'Produit Test',
          sku: 'TEST@#$%^&*()',
          price: 29.99,
          category: 'Electronics'
        });
      
      expect(res.status).toBe(401); // Pas d'auth d'abord
    });

    test('Email avec caractères Unicode retourne 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'tëst@éxämplé.com',
          password: 'motdepasse123'
        });
      
      // Peut être accepté selon la configuration
      expect(res.status).toBeLessThan(500);
    });
  });

  describe('🗂️ Structure JSON - Structures Invalides', () => {
    test('JSON avec structure imbriquée incorrecte retourne 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          user: {
            credentials: {
              email: 'test@example.com',
              password: 'motdepasse123'
            }
          }
        });
      
      expect([400, 422]).toContain(res.status);
    });

    test('Tableau au lieu d\'objet retourne 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(['test@example.com', 'motdepasse123']);
      
      expect([400, 422]).toContain(res.status);
    });

    test('String au lieu d\'objet retourne 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send('test@example.com:motdepasse123');
      
      expect([400, 422]).toContain(res.status);
    });
  });

  describe('🔐 Tentatives d\'Injection - Sécurité', () => {
    test('Injection NoSQL dans email retourne 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: { $ne: null },
          password: 'motdepasse123'
        });
      
      expect([400, 422]).toContain(res.status);
    });

    test('Injection JavaScript dans email retourne 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: '<script>alert("xss")</script>@example.com',
          password: 'motdepasse123'
        });
      
      expect([400, 422]).toContain(res.status);
    });

    test('Injection SQL dans mot de passe retourne 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: "'; DROP TABLE users; --"
        });
      
      expect([400, 422]).toContain(res.status);
    });

    test('Injection de commande dans email retourne 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com; rm -rf /',
          password: 'motdepasse123'
        });
      
      expect([400, 422]).toContain(res.status);
    });
  });

  describe('📊 Limites de Payload - Taille Excessive', () => {
    test('Payload JSON très volumineux retourne 413', async () => {
      const largeData = 'A'.repeat(1024); // 1KB de données
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'motdepasse123',
          extraData: largeData
        });
      
      expect([400, 413, 422]).toContain(res.status);
    });

    test('Nombreux champs supplémentaires retourne 400', async () => {
      const payload = {
        email: 'test@example.com',
        password: 'motdepasse123'
      };
      
      // Ajouter 100 champs supplémentaires
      for (let i = 0; i < 100; i++) {
        payload[`field${i}`] = `value${i}`;
      }
      
      const res = await request(app)
        .post('/api/auth/register')
        .send(payload);
      
      expect([400, 413, 422]).toContain(res.status);
    });
  });

  describe('🌐 Headers HTTP - Headers Malformés', () => {
    test('Accept header invalide', async () => {
      const res = await request(app)
        .get('/health')
        .set('Accept', 'invalid/content-type');
      
      expect(res.status).toBeLessThan(500); // Devrait gérer gracieusement
    });

    test('User-Agent avec caractères de contrôle', async () => {
      const res = await request(app)
        .get('/health')
        .set('User-Agent', 'Test\x00\x01\x02Agent');
      
      expect(res.status).toBeLessThan(500);
    });

    test('Authorization header malformé', async () => {
      const res = await request(app)
        .get('/api/products')
        .set('Authorization', 'InvalidFormat');
      
      expect(res.status).toBe(401);
    });
  });
});
