# 🧪 Postman Testing Guide - Smart Inventory API

## 🌐 Base URL
```
https://smart-inventory-v4.vercel.app
```

## 📋 API Routes & Test Data

### 1. Health Check
```http
GET /health
```

**Expected Response:**
```json
{
  "status": "ok",
  "uptime": 123.456,
  "timestamp": "2025-11-14T00:11:00.000Z",
  "environment": "production",
  "hasMongoUri": true
}
```

---

### 2. User Registration
```http
POST /api/auth/register
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "Test123!@#",
  "role": "user"
}
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "Utilisateur créé avec succès",
  "data": {
    "user": {
      "id": "673b1234567890abcdef1234",
      "username": "testuser",
      "email": "test@example.com",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 3. User Login
```http
POST /api/auth/login
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "test@example.com",
  "password": "Test123!@#"
}
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "Connexion réussie",
  "data": {
    "user": {
      "id": "673b1234567890abcdef1234",
      "username": "testuser",
      "email": "test@example.com",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 4. Get All Products
```http
GET /api/products
```

**Query Parameters (Optional):**
```
?page=1&limit=10&category=electronics&minPrice=100&maxPrice=1000
```

**Expected Response:**
```json
{
  "status": "success",
  "data": [
    {
      "_id": "673b1234567890abcdef5678",
      "name": "Laptop Dell XPS 13",
      "description": "Ultrabook haute performance",
      "price": 1299.99,
      "category": "electronics",
      "stock": 15,
      "sku": "DELL-XPS13-001",
      "createdAt": "2025-11-14T00:00:00.000Z",
      "updatedAt": "2025-11-14T00:00:00.000Z"
    }
  ],
  "count": 1,
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 1
  }
}
```

---

### 5. Get Product by ID
```http
GET /api/products/673b1234567890abcdef5678
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "_id": "673b1234567890abcdef5678",
    "name": "Laptop Dell XPS 13",
    "description": "Ultrabook haute performance",
    "price": 1299.99,
    "category": "electronics",
    "stock": 15,
    "sku": "DELL-XPS13-001",
    "createdAt": "2025-11-14T00:00:00.000Z",
    "updatedAt": "2025-11-14T00:00:00.000Z"
  }
}
```

---

### 6. Create Product (Admin Only)
```http
POST /api/products
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN
```

**Request Body:**
```json
{
  "name": "iPhone 15 Pro",
  "description": "Smartphone Apple dernière génération",
  "price": 1199.99,
  "category": "electronics",
  "stock": 25,
  "sku": "APPLE-IP15P-001"
}
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "Produit créé avec succès",
  "data": {
    "_id": "673b1234567890abcdef9999",
    "name": "iPhone 15 Pro",
    "description": "Smartphone Apple dernière génération",
    "price": 1199.99,
    "category": "electronics",
    "stock": 25,
    "sku": "APPLE-IP15P-001",
    "createdAt": "2025-11-14T00:11:00.000Z",
    "updatedAt": "2025-11-14T00:11:00.000Z"
  }
}
```

---

### 7. Update Product (Admin Only)
```http
PUT /api/products/673b1234567890abcdef9999
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN
```

**Request Body:**
```json
{
  "name": "iPhone 15 Pro Max",
  "price": 1399.99,
  "stock": 30
}
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "Produit mis à jour avec succès",
  "data": {
    "_id": "673b1234567890abcdef9999",
    "name": "iPhone 15 Pro Max",
    "description": "Smartphone Apple dernière génération",
    "price": 1399.99,
    "category": "electronics",
    "stock": 30,
    "sku": "APPLE-IP15P-001",
    "createdAt": "2025-11-14T00:11:00.000Z",
    "updatedAt": "2025-11-14T00:12:00.000Z"
  }
}
```

---

### 8. Delete Product (Admin Only)
```http
DELETE /api/products/673b1234567890abcdef9999
Authorization: Bearer YOUR_JWT_TOKEN
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "Produit supprimé avec succès"
}
```

---

### 9. Get All Orders (Authenticated)
```http
GET /api/orders
Authorization: Bearer YOUR_JWT_TOKEN
```

**Expected Response:**
```json
{
  "status": "success",
  "data": [
    {
      "_id": "673b1234567890abcdef7777",
      "user": "673b1234567890abcdef1234",
      "products": [
        {
          "product": "673b1234567890abcdef5678",
          "quantity": 2,
          "price": 1299.99
        }
      ],
      "totalAmount": 2599.98,
      "status": "pending",
      "createdAt": "2025-11-14T00:00:00.000Z",
      "updatedAt": "2025-11-14T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

---

### 10. Create Order (Authenticated)
```http
POST /api/orders
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN
```

**Request Body:**
```json
{
  "products": [
    {
      "product": "673b1234567890abcdef5678",
      "quantity": 1
    },
    {
      "product": "673b1234567890abcdef9999",
      "quantity": 2
    }
  ]
}
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "Commande créée avec succès",
  "data": {
    "_id": "673b1234567890abcdef8888",
    "user": "673b1234567890abcdef1234",
    "products": [
      {
        "product": "673b1234567890abcdef5678",
        "quantity": 1,
        "price": 1299.99
      },
      {
        "product": "673b1234567890abcdef9999",
        "quantity": 2,
        "price": 1399.99
      }
    ],
    "totalAmount": 4099.97,
    "status": "pending",
    "createdAt": "2025-11-14T00:13:00.000Z",
    "updatedAt": "2025-11-14T00:13:00.000Z"
  }
}
```

---

## 🔑 Authentication Headers

For protected routes, include the JWT token in the Authorization header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📊 Test Data for Database Seeding

### Sample Users:
```json
[
  {
    "username": "admin",
    "email": "admin@smartinventory.com",
    "password": "Admin123!@#",
    "role": "admin"
  },
  {
    "username": "user1",
    "email": "user1@example.com",
    "password": "User123!@#",
    "role": "user"
  },
  {
    "username": "manager",
    "email": "manager@smartinventory.com",
    "password": "Manager123!@#",
    "role": "manager"
  }
]
```

### Sample Products:
```json
[
  {
    "name": "MacBook Pro 16\"",
    "description": "Ordinateur portable professionnel Apple",
    "price": 2499.99,
    "category": "electronics",
    "stock": 10,
    "sku": "APPLE-MBP16-001"
  },
  {
    "name": "Samsung Galaxy S24",
    "description": "Smartphone Android haut de gamme",
    "price": 899.99,
    "category": "electronics",
    "stock": 50,
    "sku": "SAMSUNG-S24-001"
  },
  {
    "name": "Chaise de Bureau Ergonomique",
    "description": "Chaise de bureau confortable et ergonomique",
    "price": 299.99,
    "category": "furniture",
    "stock": 25,
    "sku": "CHAIR-ERG-001"
  },
  {
    "name": "Casque Audio Sony WH-1000XM5",
    "description": "Casque sans fil à réduction de bruit",
    "price": 399.99,
    "category": "electronics",
    "stock": 30,
    "sku": "SONY-WH1000XM5-001"
  }
]
```

## 🚨 Error Responses

### 400 Bad Request:
```json
{
  "status": "error",
  "message": "Données invalides",
  "errors": [
    {
      "field": "email",
      "message": "Format d'email invalide"
    }
  ]
}
```

### 401 Unauthorized:
```json
{
  "status": "error",
  "message": "Token manquant ou invalide"
}
```

### 403 Forbidden:
```json
{
  "status": "error",
  "message": "Accès refusé - privilèges insuffisants"
}
```

### 404 Not Found:
```json
{
  "status": "error",
  "message": "Ressource non trouvée"
}
```

### 500 Internal Server Error:
```json
{
  "status": "error",
  "message": "Erreur interne du serveur"
}
```
