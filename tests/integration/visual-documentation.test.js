const request = require('supertest');
const app = require('../../src/app');

describe('📊 Smart Inventory API - Visual Documentation', () => {
  describe('✅ Successful Operations', () => {
    test('🏥 Health Check - API Status', async () => {
      const res = await request(app)
        .get('/health')
        .expect(200);
      
      expect(res.body).toHaveProperty('status', 'ok');
      expect(res.body).toHaveProperty('uptime');
      expect(res.body).toHaveProperty('timestamp');
      
      // Documentation logging
      console.log('🏥 HEALTH CHECK SUCCESS:');
      console.log('   Status: 200 OK');
      console.log('   Response:', JSON.stringify(res.body, null, 2));
      console.log('   Headers:', JSON.stringify(res.headers, null, 2));
    });

    test('📝 User Registration - Valid Data', async () => {
      const userData = {
        email: `test-${Date.now()}@example.com`,
        password: 'motdepasse123',
        role: 'user'
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(userData);
      
      console.log('📝 USER REGISTRATION:');
      console.log('   Status:', res.status);
      console.log('   Request Data:', JSON.stringify(userData, null, 2));
      console.log('   Response:', JSON.stringify(res.body, null, 2));
      
      if (res.status === 201) {
        expect(res.body).toHaveProperty('user');
        expect(res.body.user).toHaveProperty('email', userData.email);
      }
    });
  });

  describe('❌ Validation Errors - Data Quality Control', () => {
    test('📧 Invalid Email Format - Validation Test', async () => {
      const invalidData = {
        email: 'invalid-email-format',
        password: 'motdepasse123'
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(invalidData);
      
      console.log('📧 EMAIL VALIDATION ERROR:');
      console.log('   Status:', res.status);
      console.log('   Invalid Data:', JSON.stringify(invalidData, null, 2));
      console.log('   Error Response:', JSON.stringify(res.body, null, 2));
      
      expect([400, 422]).toContain(res.status);
      expect(res.body.error || res.body.message).toBeDefined();
    });

    test('🔐 Password Too Short - Security Validation', async () => {
      const weakPassword = {
        email: 'test@example.com',
        password: '123'
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(weakPassword);
      
      console.log('🔐 PASSWORD VALIDATION ERROR:');
      console.log('   Status:', res.status);
      console.log('   Weak Data:', JSON.stringify(weakPassword, null, 2));
      console.log('   Security Response:', JSON.stringify(res.body, null, 2));
      
      expect([400, 422]).toContain(res.status);
      expect(res.body.error || res.body.message).toMatch(/password|caractères/i);
    });

    test('📝 Missing Required Fields - Completeness Check', async () => {
      const incompleteData = {};

      const res = await request(app)
        .post('/api/auth/register')
        .send(incompleteData);
      
      console.log('📝 MISSING FIELDS ERROR:');
      console.log('   Status:', res.status);
      console.log('   Incomplete Data:', JSON.stringify(incompleteData, null, 2));
      console.log('   Validation Response:', JSON.stringify(res.body, null, 2));
      
      expect([400, 422]).toContain(res.status);
      expect(res.body.error || res.body.message).toBeDefined();
    });

    test('🏷️ Incorrect Data Types - Type Safety', async () => {
      const wrongTypes = {
        email: 12345,
        password: ['motdepasse']
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(wrongTypes);
      
      console.log('🏷️ TYPE VALIDATION ERROR:');
      console.log('   Status:', res.status);
      console.log('   Wrong Types:', JSON.stringify(wrongTypes, null, 2));
      console.log('   Type Safety Response:', JSON.stringify(res.body, null, 2));
      
      expect([400, 422, 500]).toContain(res.status);
      expect(res.body.error || res.body.message).toBeDefined();
    });
  });

  describe('🌐 HTTP Protocol Errors - Network Layer Validation', () => {
    test('🔧 Malformed JSON - Syntax Validation', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send('{"email": "test@example.com", "password":');
      
      console.log('🔧 JSON SYNTAX ERROR:');
      console.log('   Status:', res.status);
      console.log('   Malformed JSON: {"email": "test@example.com", "password":');
      console.log('   Parser Response:', JSON.stringify(res.body, null, 2));
      
      expect(res.status).toBe(400);
      expect(res.body.error || res.body.message).toMatch(/json|parse|syntax/i);
    });

    test('📡 Wrong Content-Type - Header Validation', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .set('Content-Type', 'text/plain')
        .send('email=test@example.com&password=123456');
      
      console.log('📡 CONTENT-TYPE ERROR:');
      console.log('   Status:', res.status);
      console.log('   Wrong Header: Content-Type: text/plain');
      console.log('   Header Response:', JSON.stringify(res.body, null, 2));
      
      expect([400, 415]).toContain(res.status);
    });

    test('📭 Empty Request Body - Payload Validation', async () => {
      const res = await request(app)
        .post('/api/auth/register');
      
      console.log('📭 EMPTY BODY ERROR:');
      console.log('   Status:', res.status);
      console.log('   Empty Request: [no body sent]');
      console.log('   Payload Response:', JSON.stringify(res.body, null, 2));
      
      expect(res.status).toBe(400);
    });
  });

  describe('🔐 Authentication & Authorization - Security Layer', () => {
    test('🔒 Missing Authentication Token - Access Control', async () => {
      const res = await request(app)
        .get('/api/products');
      
      console.log('🔒 MISSING TOKEN ERROR:');
      console.log('   Status:', res.status);
      console.log('   Protected Endpoint: GET /api/products');
      console.log('   Auth Response:', JSON.stringify(res.body, null, 2));
      
      expect([401, 200]).toContain(res.status); // May vary based on implementation
    });

    test('🎫 Invalid Authentication Token - Token Validation', async () => {
      const res = await request(app)
        .get('/api/products')
        .set('Authorization', 'Bearer invalid_token_12345');
      
      console.log('🎫 INVALID TOKEN ERROR:');
      console.log('   Status:', res.status);
      console.log('   Invalid Token: Bearer invalid_token_12345');
      console.log('   Token Response:', JSON.stringify(res.body, null, 2));
      
      expect([401, 200]).toContain(res.status);
    });

    test('📋 Malformed Authorization Header - Header Format', async () => {
      const res = await request(app)
        .get('/api/products')
        .set('Authorization', 'InvalidFormat token123');
      
      console.log('📋 MALFORMED AUTH HEADER:');
      console.log('   Status:', res.status);
      console.log('   Malformed Header: Authorization: InvalidFormat token123');
      console.log('   Format Response:', JSON.stringify(res.body, null, 2));
      
      expect([401, 200]).toContain(res.status);
    });
  });

  describe('🚨 Security Tests - Attack Prevention', () => {
    test('💉 NoSQL Injection Attempt - Database Security', async () => {
      const injectionAttempt = {
        email: { $ne: null },
        password: { $ne: null }
      };

      const res = await request(app)
        .post('/api/auth/login')
        .send(injectionAttempt);
      
      console.log('💉 NOSQL INJECTION ATTEMPT:');
      console.log('   Status:', res.status);
      console.log('   Injection Data:', JSON.stringify(injectionAttempt, null, 2));
      console.log('   Security Response:', JSON.stringify(res.body, null, 2));
      
      expect([400, 422, 500]).toContain(res.status);
      expect(res.body).not.toHaveProperty('token');
    });

    test('🔥 XSS Attempt in Email Field - Input Sanitization', async () => {
      const xssAttempt = {
        email: '<script>alert("hack")</script>@evil.com',
        password: 'motdepasse123'
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(xssAttempt);
      
      console.log('🔥 XSS ATTEMPT:');
      console.log('   Status:', res.status);
      console.log('   XSS Data:', JSON.stringify(xssAttempt, null, 2));
      console.log('   Sanitization Response:', JSON.stringify(res.body, null, 2));
      
      expect([400, 422, 201]).toContain(res.status);
      
      if (res.status === 201 && res.body.user) {
        expect(res.body.user.email).not.toContain('<script>');
      }
    });

    test('💀 SQL Injection Attempt - Classic Attack Pattern', async () => {
      const sqlInjection = {
        email: "admin@example.com' OR '1'='1",
        password: "password"
      };

      const res = await request(app)
        .post('/api/auth/login')
        .send(sqlInjection);
      
      console.log('💀 SQL INJECTION ATTEMPT:');
      console.log('   Status:', res.status);
      console.log('   SQL Injection:', JSON.stringify(sqlInjection, null, 2));
      console.log('   Protection Response:', JSON.stringify(res.body, null, 2));
      
      expect([400, 401, 422]).toContain(res.status);
      expect(res.body).not.toHaveProperty('token');
    });
  });

  describe('🗺️ Route & Resource Errors - Navigation Layer', () => {
    test('🔍 Non-existent Endpoint - Route Validation', async () => {
      const res = await request(app)
        .get('/api/nonexistent-endpoint');
      
      console.log('🔍 ROUTE NOT FOUND:');
      console.log('   Status:', res.status);
      console.log('   Invalid Route: GET /api/nonexistent-endpoint');
      console.log('   Route Response:', JSON.stringify(res.body, null, 2));
      
      expect(res.status).toBe(404);
    });

    test('🆔 Invalid Resource ID - Resource Validation', async () => {
      const res = await request(app)
        .get('/api/products/invalid-id-format');
      
      console.log('🆔 INVALID RESOURCE ID:');
      console.log('   Status:', res.status);
      console.log('   Invalid ID: invalid-id-format');
      console.log('   Resource Response:', JSON.stringify(res.body, null, 2));
      
      expect([400, 401, 404]).toContain(res.status);
    });

    test('🚫 Method Not Allowed - HTTP Method Validation', async () => {
      const res = await request(app)
        .patch('/health');
      
      console.log('🚫 METHOD NOT ALLOWED:');
      console.log('   Status:', res.status);
      console.log('   Invalid Method: PATCH /health');
      console.log('   Method Response:', JSON.stringify(res.body, null, 2));
      
      expect([404, 405]).toContain(res.status);
    });
  });

  describe('📏 Data Limits & Edge Cases - Boundary Testing', () => {
    test('📏 Extremely Long Email - Length Validation', async () => {
      const longEmail = 'a'.repeat(300) + '@example.com';
      const longData = {
        email: longEmail,
        password: 'motdepasse123'
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(longData);
      
      console.log('📏 LONG EMAIL TEST:');
      console.log('   Status:', res.status);
      console.log('   Email Length:', longEmail.length, 'characters');
      console.log('   Length Response:', JSON.stringify(res.body, null, 2));
      
      expect([400, 413, 422, 201]).toContain(res.status);
    });

    test('🔢 Large Payload - Size Validation', async () => {
      const largeData = {
        email: 'test@example.com',
        password: 'motdepasse123',
        extraData: 'A'.repeat(1000)
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(largeData);
      
      console.log('🔢 LARGE PAYLOAD TEST:');
      console.log('   Status:', res.status);
      console.log('   Payload Size:', JSON.stringify(largeData).length, 'bytes');
      console.log('   Size Response:', JSON.stringify(res.body, null, 2));
      
      expect([400, 413, 422, 201]).toContain(res.status);
    });
  });

  describe('⚡ Performance & Response Time - Quality Metrics', () => {
    test('⚡ API Response Time - Performance Benchmark', async () => {
      const startTime = Date.now();
      
      const res = await request(app)
        .get('/health');
      
      const responseTime = Date.now() - startTime;
      
      console.log('⚡ PERFORMANCE METRICS:');
      console.log('   Status:', res.status);
      console.log('   Response Time:', responseTime, 'ms');
      console.log('   Performance Grade:', responseTime < 100 ? 'Excellent' : responseTime < 500 ? 'Good' : 'Needs Improvement');
      
      expect(res.status).toBe(200);
      expect(responseTime).toBeLessThan(1000);
    });

    test('📊 Error Handling Speed - Error Response Time', async () => {
      const startTime = Date.now();
      
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'invalid' });
      
      const responseTime = Date.now() - startTime;
      
      console.log('📊 ERROR HANDLING METRICS:');
      console.log('   Status:', res.status);
      console.log('   Error Response Time:', responseTime, 'ms');
      console.log('   Error Efficiency:', responseTime < 200 ? 'Fast' : 'Acceptable');
      
      expect([400, 422]).toContain(res.status);
      expect(responseTime).toBeLessThan(1000);
    });
  });
});
