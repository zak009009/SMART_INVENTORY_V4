const Product = require('../../../src/models/product.model');

describe('Tests unitaires du modèle Product', () => {
  describe('Validation du schéma Product', () => {
    test('devrait créer un produit valide', async () => {
      const productData = {
        name: 'Test Product',
        sku: 'TEST-001',
        price: 99.99,
        category: 'Electronics',
        stock: 10,
        inStock: true
      };

      const product = new Product(productData);
      const savedProduct = await product.save();

      expect(savedProduct._id).toBeDefined();
      expect(savedProduct.name).toBe(productData.name);
      expect(savedProduct.sku).toBe(productData.sku);
      expect(savedProduct.price).toBe(productData.price);
      expect(savedProduct.category).toBe(productData.category);
      expect(savedProduct.stock).toBe(productData.stock);
      expect(savedProduct.inStock).toBe(productData.inStock);
      expect(savedProduct.createdAt).toBeDefined();
      expect(savedProduct.updatedAt).toBeDefined();
    });

    test('devrait échouer la validation sans nom requis', async () => {
      const productData = {
        sku: 'TEST-001',
        price: 99.99,
        category: 'Electronics'
      };

      const product = new Product(productData);
      
      await expect(product.save()).rejects.toThrow();
    });

    test('devrait échouer la validation sans sku requis', async () => {
      const productData = {
        name: 'Test Product',
        price: 99.99,
        category: 'Electronics'
      };

      const product = new Product(productData);
      
      await expect(product.save()).rejects.toThrow();
    });

    test('devrait échouer la validation sans prix requis', async () => {
      const productData = {
        name: 'Test Product',
        sku: 'TEST-001',
        category: 'Electronics'
      };

      const product = new Product(productData);
      
      await expect(product.save()).rejects.toThrow();
    });

    test('devrait échouer la validation sans catégorie requise', async () => {
      const productData = {
        name: 'Test Product',
        sku: 'TEST-001',
        price: 99.99
      };

      const product = new Product(productData);
      
      await expect(product.save()).rejects.toThrow();
    });

    test('devrait définir le stock par défaut à 0', async () => {
      const productData = {
        name: 'Test Product',
        sku: 'TEST-001',
        price: 99.99,
        category: 'Electronics'
      };

      const product = new Product(productData);
      const savedProduct = await product.save();

      expect(savedProduct.stock).toBe(0);
    });

    test('devrait définir inStock par défaut à false', async () => {
      const productData = {
        name: 'Test Product',
        sku: 'TEST-001',
        price: 99.99,
        category: 'Electronics'
      };

      const product = new Product(productData);
      const savedProduct = await product.save();

      expect(savedProduct.inStock).toBe(false);
    });

    test('devrait rejeter un prix négatif', async () => {
      const productData = {
        name: 'Test Product',
        sku: 'TEST-001',
        price: -10,
        category: 'Electronics'
      };

      const product = new Product(productData);
      
      await expect(product.save()).rejects.toThrow();
    });

    test('devrait rejeter un stock négatif', async () => {
      const productData = {
        name: 'Test Product',
        sku: 'TEST-001',
        price: 99.99,
        category: 'Electronics',
        stock: -5
      };

      const product = new Product(productData);
      
      await expect(product.save()).rejects.toThrow();
    });

    test('devrait appliquer la contrainte de sku unique', async () => {
      const productData = {
        name: 'Test Product',
        sku: 'DUPLICATE-SKU',
        price: 99.99,
        category: 'Electronics'
      };

      const product1 = new Product(productData);
      await product1.save();

      const product2 = new Product({
        ...productData,
        name: 'Another Product'
      });
      
      await expect(product2.save()).rejects.toThrow();
    });

    test('devrait tronquer le nom et la catégorie', async () => {
      const productData = {
        name: '  Test Product  ',
        sku: 'TEST-001',
        price: 99.99,
        category: '  Electronics  '
      };

      const product = new Product(productData);
      const savedProduct = await product.save();

      expect(savedProduct.name).toBe('Test Product');
      expect(savedProduct.category).toBe('Electronics');
    });

    test('devrait tronquer le sku', async () => {
      const productData = {
        name: 'Test Product',
        sku: '  TEST-001  ',
        price: 99.99,
        category: 'Electronics'
      };

      const product = new Product(productData);
      const savedProduct = await product.save();

      expect(savedProduct.sku).toBe('TEST-001');
    });
  });
});
