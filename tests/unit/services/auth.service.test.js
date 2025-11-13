const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authService = require('../../../src/services/auth.service');
const User = require('../../../src/models/user.model');

// Mock bcrypt and jwt
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('Tests unitaires du service Auth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    test('devrait enregistrer un nouvel utilisateur avec succès', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        role: 'user'
      };

      const hashedPassword = 'hashedpassword123';
      const mockToken = 'mock.jwt.token';
      const mockUser = {
        _id: 'mockuserid',
        email: userData.email,
        passwordHash: hashedPassword,
        role: userData.role,
        createdAt: new Date()
      };

      // Mock User.findOne to return null (user doesn't exist)
      jest.spyOn(User, 'findOne').mockResolvedValue(null);
      
      // Mock bcrypt.hash
      bcrypt.hash.mockResolvedValue(hashedPassword);
      
      // Mock User.create
      jest.spyOn(User, 'create').mockResolvedValue(mockUser);
      
      // Mock jwt.sign
      jwt.sign.mockReturnValue(mockToken);

      const result = await authService.register(userData);

      expect(User.findOne).toHaveBeenCalledWith({ email: userData.email });
      const saltRounds = parseInt(process.env.SALT_ROUNDS || '10', 10);
      expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, saltRounds);
      expect(User.create).toHaveBeenCalledWith({
        email: userData.email,
        passwordHash: hashedPassword,
        role: userData.role
      });
      expect(jwt.sign).toHaveBeenCalled();
      
      expect(result).toEqual({
        user: {
          id: mockUser._id,
          email: mockUser.email,
          role: mockUser.role,
          createdAt: mockUser.createdAt
        },
        token: mockToken
      });
    });

    test('devrait lever une erreur si l\'email existe déjà', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'password123'
      };

      const existingUser = {
        _id: 'existinguserid',
        email: userData.email
      };

      jest.spyOn(User, 'findOne').mockResolvedValue(existingUser);

      await expect(authService.register(userData)).rejects.toThrow('Cet email est déjà enregistré');
      
      expect(User.findOne).toHaveBeenCalledWith({ email: userData.email });
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(User.create).not.toHaveBeenCalled();
    });

    test('devrait utiliser le rôle "user" par défaut si non spécifié', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const hashedPassword = 'hashedpassword123';
      const mockUser = {
        _id: 'mockuserid',
        email: userData.email,
        passwordHash: hashedPassword,
        role: 'user',
        createdAt: new Date()
      };

      jest.spyOn(User, 'findOne').mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue(hashedPassword);
      jest.spyOn(User, 'create').mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue('mock.token');

      await authService.register(userData);

      expect(User.create).toHaveBeenCalledWith({
        email: userData.email,
        passwordHash: hashedPassword,
        role: 'user'
      });
    });
  });

  describe('login', () => {
    test('devrait connecter l\'utilisateur avec succès avec des identifiants valides', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockUser = {
        _id: 'mockuserid',
        email: loginData.email,
        passwordHash: 'hashedpassword123',
        role: 'user',
        createdAt: new Date()
      };

      const mockToken = 'mock.jwt.token';

      jest.spyOn(User, 'findOne').mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue(mockToken);

      const result = await authService.login(loginData);

      expect(User.findOne).toHaveBeenCalledWith({ email: loginData.email });
      expect(bcrypt.compare).toHaveBeenCalledWith(loginData.password, mockUser.passwordHash);
      expect(jwt.sign).toHaveBeenCalled();
      
      expect(result).toEqual({
        user: {
          id: mockUser._id,
          email: mockUser.email,
          role: mockUser.role,
          createdAt: mockUser.createdAt
        },
        token: mockToken
      });
    });

    test('devrait lever une erreur si l\'utilisateur n\'est pas trouvé', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      jest.spyOn(User, 'findOne').mockResolvedValue(null);

      await expect(authService.login(loginData)).rejects.toThrow('Identifiants invalides');
      
      expect(User.findOne).toHaveBeenCalledWith({ email: loginData.email });
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    test('devrait lever une erreur si le mot de passe est invalide', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const mockUser = {
        _id: 'mockuserid',
        email: loginData.email,
        passwordHash: 'hashedpassword123',
        role: 'user'
      };

      jest.spyOn(User, 'findOne').mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      await expect(authService.login(loginData)).rejects.toThrow('Identifiants invalides');
      
      expect(User.findOne).toHaveBeenCalledWith({ email: loginData.email });
      expect(bcrypt.compare).toHaveBeenCalledWith(loginData.password, mockUser.passwordHash);
      expect(jwt.sign).not.toHaveBeenCalled();
    });
  });
});
