const User = require('../../../src/models/user.model');

describe('Tests unitaires du modèle User', () => {
  describe('Validation du schéma User', () => {
    test('devrait créer un utilisateur valide', async () => {
      const userData = {
        email: 'test@example.com',
        passwordHash: 'hashedpassword123',
        role: 'user'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.passwordHash).toBe(userData.passwordHash);
      expect(savedUser.role).toBe(userData.role);
      expect(savedUser.createdAt).toBeDefined();
      expect(savedUser.updatedAt).toBeDefined();
    });

    test('devrait échouer la validation sans email requis', async () => {
      const userData = {
        passwordHash: 'hashedpassword123'
      };

      const user = new User(userData);
      
      await expect(user.save()).rejects.toThrow();
    });

    test('devrait échouer la validation sans passwordHash requis', async () => {
      const userData = {
        email: 'test@example.com'
      };

      const user = new User(userData);
      
      await expect(user.save()).rejects.toThrow();
    });

    test('devrait définir le rôle par défaut à user', async () => {
      const userData = {
        email: `defaultrole${Date.now()}@example.com`,
        passwordHash: 'hashedpassword123'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.role).toBe('user');
    });

    test('devrait accepter le rôle admin', async () => {
      const userData = {
        email: 'admin@example.com',
        passwordHash: 'hashedpassword123',
        role: 'admin'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.role).toBe('admin');
    });

    test('devrait rejeter un rôle invalide', async () => {
      const userData = {
        email: 'test@example.com',
        passwordHash: 'hashedpassword123',
        role: 'invalidrole'
      };

      const user = new User(userData);
      
      await expect(user.save()).rejects.toThrow();
    });

    test('devrait appliquer la contrainte d\'email unique', async () => {
      const userData = {
        email: 'duplicate@example.com',
        passwordHash: 'hashedpassword123'
      };

      const user1 = new User(userData);
      await user1.save();

      const user2 = new User(userData);
      
      await expect(user2.save()).rejects.toThrow();
    });

    test('devrait tronquer et mettre en minuscules l\'email', async () => {
      const timestamp = Date.now();
      const userData = {
        email: `  TEST${timestamp}@EXAMPLE.COM  `,
        passwordHash: 'hashedpassword123'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.email).toBe(`test${timestamp}@example.com`);
    });
  });
});
