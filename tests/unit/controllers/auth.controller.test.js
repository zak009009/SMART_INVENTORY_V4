const authController = require('../../../src/controllers/auth.controller');
const authService = require('../../../src/services/auth.service');

// Mock the auth service
jest.mock('../../../src/services/auth.service');

describe('Tests unitaires du contrôleur Auth', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('register', () => {
    test('devrait enregistrer l\'utilisateur avec succès', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        role: 'user'
      };

      const serviceResult = {
        user: {
          id: 'mockuserid',
          email: userData.email,
          role: userData.role,
          createdAt: new Date()
        },
        token: 'mock.jwt.token'
      };

      req.body = userData;
      authService.register.mockResolvedValue(serviceResult);

      await authController.register(req, res, next);

      expect(authService.register).toHaveBeenCalledWith(userData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: serviceResult.user,
        token: serviceResult.token
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('devrait retourner 400 si l\'email est manquant (register)', async () => {
      req.body = {
        password: 'password123'
      };

      await authController.register(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: "Les champs 'email' et 'password' sont requis"
      });
      expect(authService.register).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    test('devrait retourner 400 si le mot de passe est manquant (register)', async () => {
      req.body = {
        email: 'test@example.com'
      };

      await authController.register(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: "Les champs 'email' et 'password' sont requis"
      });
      expect(authService.register).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    test('devrait appeler next avec une erreur si le service lève une exception', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const error = new Error('Service error');
      req.body = userData;
      authService.register.mockRejectedValue(error);

      await authController.register(req, res, next);

      expect(authService.register).toHaveBeenCalledWith(userData);
      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    test('devrait connecter l\'utilisateur avec succès', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const serviceResult = {
        user: {
          id: 'mockuserid',
          email: loginData.email,
          role: 'user',
          createdAt: new Date()
        },
        token: 'mock.jwt.token'
      };

      req.body = loginData;
      authService.login.mockResolvedValue(serviceResult);

      await authController.login(req, res, next);

      expect(authService.login).toHaveBeenCalledWith(loginData);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: serviceResult.user,
        token: serviceResult.token
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('devrait retourner 400 si l\'email est manquant (login)', async () => {
      req.body = {
        password: 'password123'
      };

      await authController.login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: "Les champs 'email' et 'password' sont requis"
      });
      expect(authService.login).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    test('devrait retourner 400 si le mot de passe est manquant (login)', async () => {
      req.body = {
        email: 'test@example.com'
      };

      await authController.login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: "Les champs 'email' et 'password' sont requis"
      });
      expect(authService.login).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    test('devrait appeler next avec une erreur si le service lève une exception (login)', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const error = new Error('Service error');
      req.body = loginData;
      authService.login.mockRejectedValue(error);

      await authController.login(req, res, next);

      expect(authService.login).toHaveBeenCalledWith(loginData);
      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });
});
