const request = require('supertest');
const app = require('../../src/app');

describe('🚨 Démonstration d\'Erreurs - Tests qui Échouent Intentionnellement', () => {
  describe('❌ Erreurs de Validation - Réponses d\'Erreur Visibles', () => {
    test('ÉCHEC INTENTIONNEL: Email invalide doit retourner message d\'erreur spécifique', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'email-sans-arobase-invalide',
          password: 'motdepasse123'
        });
      
      console.log('📧 ERREUR EMAIL - Status:', res.status);
      console.log('📧 ERREUR EMAIL - Body:', JSON.stringify(res.body, null, 2));
      
      // Ce test va échouer pour montrer la réponse d'erreur
      expect(res.status).toBe(200); // Intentionnellement faux
      expect(res.body.message).toBe('SUCCESS'); // Intentionnellement faux
    });

    test('ÉCHEC INTENTIONNEL: Mot de passe trop court doit montrer validation', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: '12' // Trop court
        });
      
      console.log('🔐 ERREUR PASSWORD - Status:', res.status);
      console.log('🔐 ERREUR PASSWORD - Body:', JSON.stringify(res.body, null, 2));
      
      // Ce test va échouer pour montrer la validation
      expect(res.status).toBe(201); // Intentionnellement faux
      expect(res.body.error).toBeUndefined(); // Intentionnellement faux
    });

    test('ÉCHEC INTENTIONNEL: Données manquantes doivent retourner erreur détaillée', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({}); // Aucune donnée
      
      console.log('📝 ERREUR DONNÉES MANQUANTES - Status:', res.status);
      console.log('📝 ERREUR DONNÉES MANQUANTES - Body:', JSON.stringify(res.body, null, 2));
      
      // Ce test va échouer pour montrer l'erreur
      expect(res.status).toBe(200); // Intentionnellement faux
      expect(res.body).toEqual({ success: true }); // Intentionnellement faux
    });
  });

  describe('🌐 Erreurs HTTP - Protocole et Headers', () => {
    test('ÉCHEC INTENTIONNEL: Content-Type incorrect doit être rejeté', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .set('Content-Type', 'text/plain')
        .send('email=test@example.com&password=123456');
      
      console.log('📡 ERREUR CONTENT-TYPE - Status:', res.status);
      console.log('📡 ERREUR CONTENT-TYPE - Headers:', res.headers);
      console.log('📡 ERREUR CONTENT-TYPE - Body:', JSON.stringify(res.body, null, 2));
      
      // Ce test va échouer pour montrer l'erreur HTTP
      expect(res.status).toBe(200); // Intentionnellement faux
      expect(res.body.error).toBe('SUCCESS'); // Intentionnellement faux
    });

    test('ÉCHEC INTENTIONNEL: JSON malformé doit retourner erreur de parsing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send('{"email": "test@example.com", "password":'); // JSON cassé
      
      console.log('🔧 ERREUR JSON MALFORMÉ - Status:', res.status);
      console.log('🔧 ERREUR JSON MALFORMÉ - Body:', JSON.stringify(res.body, null, 2));
      
      // Ce test va échouer pour montrer l'erreur de parsing
      expect(res.status).toBe(201); // Intentionnellement faux
      expect(res.body.message).toBe('JSON parsed successfully'); // Intentionnellement faux
    });
  });

  describe('🔐 Erreurs d\'Authentification - Accès Refusé', () => {
    test('ÉCHEC INTENTIONNEL: Accès sans token doit être bloqué', async () => {
      const res = await request(app)
        .get('/api/products');
      
      console.log('🔒 ERREUR AUTH - Status:', res.status);
      console.log('🔒 ERREUR AUTH - Body:', JSON.stringify(res.body, null, 2));
      
      // Ce test va échouer pour montrer l'erreur d'auth
      expect(res.status).toBe(200); // Intentionnellement faux
      expect(res.body.products).toBeDefined(); // Intentionnellement faux
    });

    test('ÉCHEC INTENTIONNEL: Token invalide doit retourner erreur spécifique', async () => {
      const res = await request(app)
        .get('/api/products')
        .set('Authorization', 'Bearer token_completement_invalide_123456');
      
      console.log('🎫 ERREUR TOKEN - Status:', res.status);
      console.log('🎫 ERREUR TOKEN - Body:', JSON.stringify(res.body, null, 2));
      
      // Ce test va échouer pour montrer l'erreur de token
      expect(res.status).toBe(200); // Intentionnellement faux
      expect(res.body.error).toBeUndefined(); // Intentionnellement faux
    });
  });

  describe('💼 Erreurs de Validation Métier - Règles Business', () => {
    test('ÉCHEC INTENTIONNEL: Prix négatif doit être rejeté avec message clair', async () => {
      const res = await request(app)
        .post('/api/products')
        .send({
          name: 'Produit Test',
          sku: 'TEST-001',
          price: -50.99, // Prix négatif
          category: 'Electronics'
        });
      
      console.log('💰 ERREUR PRIX NÉGATIF - Status:', res.status);
      console.log('💰 ERREUR PRIX NÉGATIF - Body:', JSON.stringify(res.body, null, 2));
      
      // Ce test va échouer pour montrer l'erreur métier
      expect(res.status).toBe(201); // Intentionnellement faux
      expect(res.body.product).toBeDefined(); // Intentionnellement faux
    });

    test('ÉCHEC INTENTIONNEL: SKU invalide doit retourner erreur de format', async () => {
      const res = await request(app)
        .post('/api/products')
        .send({
          name: 'Produit Test',
          sku: 'TEST@#$%^&*()', // Caractères interdits
          price: 29.99,
          category: 'Electronics'
        });
      
      console.log('🏷️ ERREUR SKU INVALIDE - Status:', res.status);
      console.log('🏷️ ERREUR SKU INVALIDE - Body:', JSON.stringify(res.body, null, 2));
      
      // Ce test va échouer pour montrer l'erreur de validation
      expect(res.status).toBe(200); // Intentionnellement faux
      expect(res.body.error).toBe(''); // Intentionnellement faux
    });
  });

  describe('🚨 Erreurs de Sécurité - Tentatives d\'Attaque', () => {
    test('ÉCHEC INTENTIONNEL: Injection NoSQL doit être détectée', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: { $ne: null }, // Tentative d'injection
          password: { $ne: null }
        });
      
      console.log('💉 ERREUR INJECTION NOSQL - Status:', res.status);
      console.log('💉 ERREUR INJECTION NOSQL - Body:', JSON.stringify(res.body, null, 2));
      
      // Ce test va échouer pour montrer la détection d'injection
      expect(res.status).toBe(200); // Intentionnellement faux
      expect(res.body.token).toBeDefined(); // Intentionnellement faux
    });

    test('ÉCHEC INTENTIONNEL: XSS dans email doit être bloqué', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: '<script>alert("hack")</script>@evil.com',
          password: 'motdepasse123'
        });
      
      console.log('🔥 ERREUR XSS - Status:', res.status);
      console.log('🔥 ERREUR XSS - Body:', JSON.stringify(res.body, null, 2));
      
      // Ce test va échouer pour montrer la protection XSS
      expect(res.status).toBe(201); // Intentionnellement faux
      expect(res.body.user).toBeDefined(); // Intentionnellement faux
    });
  });

  describe('📏 Erreurs de Limites - Données Trop Volumineuses', () => {
    test('ÉCHEC INTENTIONNEL: Email trop long doit être rejeté', async () => {
      const longEmail = 'a'.repeat(300) + '@example.com'; // Trop long
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: longEmail,
          password: 'motdepasse123'
        });
      
      console.log('📏 ERREUR EMAIL TROP LONG - Status:', res.status);
      console.log('📏 ERREUR EMAIL TROP LONG - Body:', JSON.stringify(res.body, null, 2));
      
      // Ce test va échouer pour montrer l'erreur de limite
      expect(res.status).toBe(200); // Intentionnellement faux
      expect(res.body.error).toBeNull(); // Intentionnellement faux
    });
  });

  describe('🔄 Erreurs de Route - Endpoints Inexistants', () => {
    test('ÉCHEC INTENTIONNEL: Route inexistante doit retourner 404 détaillé', async () => {
      const res = await request(app)
        .get('/api/endpoint-qui-nexiste-absolument-pas');
      
      console.log('🗺️ ERREUR ROUTE 404 - Status:', res.status);
      console.log('🗺️ ERREUR ROUTE 404 - Body:', JSON.stringify(res.body, null, 2));
      
      // Ce test va échouer pour montrer l'erreur 404
      expect(res.status).toBe(200); // Intentionnellement faux
      expect(res.body.data).toBeDefined(); // Intentionnellement faux
    });
  });
});
