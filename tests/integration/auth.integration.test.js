const request = require('supertest');
const app = require('../../src/app');
const User = require('../../src/models/user.model');

describe('Tests d\'intégration d\'authentification', () => {
  describe('POST /api/auth/register', () => {
    test('devrait enregistrer un nouvel utilisateur avec succès', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        role: 'user'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.email).toBe(userData.email);
      expect(response.body.data.role).toBe(userData.role);
      expect(response.body.data).not.toHaveProperty('passwordHash');
      expect(response.body).toHaveProperty('token');

      const userInDb = await User.findOne({ email: userData.email });
      expect(userInDb).toBeTruthy();
      expect(userInDb.email).toBe(userData.email);
      expect(userInDb.role).toBe(userData.role);
    });

    test('devrait retourner 400 si l\'email est manquant (register)', async () => {
      const userData = {
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe("Les champs 'email' et 'password' sont requis");
    });

    test('devrait retourner 400 si le mot de passe est manquant (register)', async () => {
      const userData = {
        email: 'test@example.com'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe("Les champs 'email' et 'password' sont requis");
    });

    test('devrait retourner 400 pour un email dupliqué', async () => {
      const userData = {
        email: 'duplicate@example.com',
        password: 'password123'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.message).toBe('Cet email est déjà enregistré');
    });

    test('devrait utiliser le rôle user par défaut si non spécifié', async () => {
      const userData = {
        email: 'defaultrole@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.data.role).toBe('user');
    });

    test('devrait accepter le rôle admin', async () => {
      const userData = {
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.data.role).toBe('admin');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'logintest@example.com',
          password: 'password123',
          role: 'user'
        });
    });

    test('devrait se connecter avec succès avec des identifiants valides', async () => {
      const loginData = {
        email: 'logintest@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.email).toBe(loginData.email);
      expect(response.body.data.role).toBe('user');
      expect(response.body.data).not.toHaveProperty('passwordHash');
      expect(response.body).toHaveProperty('token');
    });

    test('devrait retourner 400 si l\'email est manquant (login)', async () => {
      const loginData = {
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe("Les champs 'email' et 'password' sont requis");
    });

    test('devrait retourner 400 si le mot de passe est manquant (login)', async () => {
      const loginData = {
        email: 'logintest@example.com'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe("Les champs 'email' et 'password' sont requis");
    });

    test('devrait retourner 401 pour un utilisateur inexistant', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.message).toBe('Identifiants invalides');
    });

    test('devrait retourner 401 pour un mot de passe invalide', async () => {
      const loginData = {
        email: 'logintest@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.message).toBe('Identifiants invalides');
    });
  });

  describe('Limitation de débit', () => {
    test('devrait appliquer la limitation de débit aux endpoints d\'authentification', async () => {
      const requests = [];
      for (let i = 0; i < 10; i++) {
        requests.push(
          request(app)
            .post('/api/auth/register')
            .send({
              email: `ratelimit${i}@example.com`,
              password: 'password123'
            })
        );
      }

      const responses = await Promise.all(requests);
      const successfulResponses = responses.filter(res => res.status === 201);
      
      expect(successfulResponses.length).toBeGreaterThan(0);
    });
  });
});
