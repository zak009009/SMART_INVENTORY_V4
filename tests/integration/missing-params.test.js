const request = require('supertest');
const app = require('../../src/app');

describe('🔍 Tests de Paramètres Manquants - Erreurs HTTP Détaillées', () => {
  describe('❌ Paramètres HTTP Manquants', () => {
    test('ÉCHEC: Requête POST sans body doit échouer', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        // Pas de .send() = pas de body
        .expect(400);
      
      console.log('📭 ERREUR BODY MANQUANT:');
      console.log('   Status:', res.status);
      console.log('   Body:', JSON.stringify(res.body, null, 2));
      console.log('   Headers:', res.headers);
      
      // Montrer que l'erreur est bien détectée
      expect(res.body.error || res.body.message).toBeDefined();
    });

    test('ÉCHEC: Content-Length manquant avec données', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .set('Content-Length', '') // Content-Length vide
        .send('{"email":"test@example.com","password":"123456"}');
      
      console.log('📏 ERREUR CONTENT-LENGTH:');
      console.log('   Status:', res.status);
      console.log('   Body:', JSON.stringify(res.body, null, 2));
      
      // Devrait échouer ou gérer l'erreur
      expect([400, 411, 413]).toContain(res.status);
    });

    test('ÉCHEC: Accept header manquant pour API', async () => {
      const res = await request(app)
        .get('/api/products')
        .set('Accept', ''); // Accept vide
      
      console.log('🎯 ERREUR ACCEPT HEADER:');
      console.log('   Status:', res.status);
      console.log('   Body:', JSON.stringify(res.body, null, 2));
      
      // Peut être 401 (pas d'auth) ou autre erreur
      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('🔍 Paramètres de Requête Invalides', () => {
    test('ÉCHEC: Query parameters malformés', async () => {
      const res = await request(app)
        .get('/api/products?page=abc&limit=xyz&sort=invalid_field');
      
      console.log('🔢 ERREUR QUERY PARAMS:');
      console.log('   Status:', res.status);
      console.log('   Query reçue: page=abc&limit=xyz&sort=invalid_field');
      console.log('   Body:', JSON.stringify(res.body, null, 2));
      
      // Devrait retourner une erreur de validation ou 401
      expect(res.status).toBeGreaterThanOrEqual(400);
    });

    test('ÉCHEC: ID de ressource invalide dans URL', async () => {
      const res = await request(app)
        .get('/api/products/id-completement-invalide-123');
      
      console.log('🆔 ERREUR ID INVALIDE:');
      console.log('   Status:', res.status);
      console.log('   URL: /api/products/id-completement-invalide-123');
      console.log('   Body:', JSON.stringify(res.body, null, 2));
      
      // Devrait retourner 400 (ID invalide) ou 401 (pas d'auth)
      expect([400, 401, 404]).toContain(res.status);
    });
  });

  describe('📝 Corps de Requête Malformé', () => {
    test('ÉCHEC: JSON avec syntaxe incorrecte', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send('{"email": "test@example.com" "password": "123456"}'); // Virgule manquante
      
      console.log('🔧 ERREUR JSON SYNTAXE:');
      console.log('   Status:', res.status);
      console.log('   JSON envoyé: {"email": "test@example.com" "password": "123456"}');
      console.log('   Body:', JSON.stringify(res.body, null, 2));
      
      expect(res.status).toBe(400);
      expect(res.body.error || res.body.message).toMatch(/json|parse|syntax/i);
    });

    test('ÉCHEC: Champs requis manquants avec message détaillé', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          // email manquant
          password: 'motdepasse123'
        });
      
      console.log('📋 ERREUR CHAMPS MANQUANTS:');
      console.log('   Status:', res.status);
      console.log('   Données envoyées: { password: "motdepasse123" }');
      console.log('   Body:', JSON.stringify(res.body, null, 2));
      
      expect([400, 422]).toContain(res.status);
      expect(res.body.error || res.body.message).toBeDefined();
    });

    test('ÉCHEC: Types de données incorrects', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 12345, // Devrait être string
          password: ['motdepasse'] // Devrait être string
        });
      
      console.log('🏷️ ERREUR TYPES INCORRECTS:');
      console.log('   Status:', res.status);
      console.log('   Données: { email: 12345, password: ["motdepasse"] }');
      console.log('   Body:', JSON.stringify(res.body, null, 2));
      
      expect([400, 422]).toContain(res.status);
      expect(res.body.error || res.body.message).toBeDefined();
    });
  });

  describe('🌐 Headers HTTP Manquants/Incorrects', () => {
    test('ÉCHEC: Authorization header malformé', async () => {
      const res = await request(app)
        .get('/api/products')
        .set('Authorization', 'InvalidFormat token123'); // Format incorrect
      
      console.log('🔐 ERREUR AUTH HEADER:');
      console.log('   Status:', res.status);
      console.log('   Header: Authorization: InvalidFormat token123');
      console.log('   Body:', JSON.stringify(res.body, null, 2));
      
      expect(res.status).toBe(401);
      expect(res.body.error || res.body.message).toMatch(/authorization|token|invalid/i);
    });

    test('ÉCHEC: User-Agent suspect ou manquant', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .set('User-Agent', '') // User-Agent vide
        .send({
          email: 'test@example.com',
          password: 'motdepasse123'
        });
      
      console.log('🤖 ERREUR USER-AGENT:');
      console.log('   Status:', res.status);
      console.log('   User-Agent: [vide]');
      console.log('   Body:', JSON.stringify(res.body, null, 2));
      
      // Peut être accepté ou rejeté selon la configuration
      expect(res.status).toBeLessThan(500);
    });
  });

  describe('📊 Erreurs de Validation Métier Détaillées', () => {
    test('ÉCHEC: Produit avec données business invalides', async () => {
      const res = await request(app)
        .post('/api/products')
        .send({
          name: '', // Nom vide
          sku: '', // SKU vide
          price: 'not-a-number', // Prix non numérique
          category: null // Catégorie null
        });
      
      console.log('💼 ERREUR VALIDATION MÉTIER:');
      console.log('   Status:', res.status);
      console.log('   Données: { name: "", sku: "", price: "not-a-number", category: null }');
      console.log('   Body:', JSON.stringify(res.body, null, 2));
      
      // Devrait être 401 (pas d'auth) mais montrer la structure d'erreur
      expect(res.status).toBeGreaterThanOrEqual(400);
    });

    test('ÉCHEC: Commande avec structure invalide', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({
          products: 'not-an-array', // Devrait être un tableau
          total: 'invalid-number', // Devrait être un nombre
          customer: { id: null } // ID client null
        });
      
      console.log('🛒 ERREUR COMMANDE INVALIDE:');
      console.log('   Status:', res.status);
      console.log('   Données: { products: "not-an-array", total: "invalid-number", customer: { id: null } }');
      console.log('   Body:', JSON.stringify(res.body, null, 2));
      
      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('🔒 Erreurs de Sécurité avec Détails', () => {
    test('ÉCHEC: Tentative de bypass d\'authentification', async () => {
      const res = await request(app)
        .get('/api/products')
        .set('Authorization', 'Bearer admin') // Token trop simple
        .set('X-Admin-Override', 'true'); // Header suspect
      
      console.log('🚨 ERREUR BYPASS AUTH:');
      console.log('   Status:', res.status);
      console.log('   Headers suspects: Authorization: Bearer admin, X-Admin-Override: true');
      console.log('   Body:', JSON.stringify(res.body, null, 2));
      
      expect([401, 403]).toContain(res.status);
    });

    test('ÉCHEC: Injection dans paramètres URL', async () => {
      const maliciousId = "'; DROP TABLE products; --";
      const res = await request(app)
        .get(`/api/products/${encodeURIComponent(maliciousId)}`);
      
      console.log('💉 ERREUR INJECTION URL:');
      console.log('   Status:', res.status);
      console.log('   ID malicieux:', maliciousId);
      console.log('   Body:', JSON.stringify(res.body, null, 2));
      
      expect([400, 401, 404]).toContain(res.status);
    });
  });
});
