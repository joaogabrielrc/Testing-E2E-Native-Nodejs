import { describe, before, after, it } from 'node:test';
import { deepEqual, deepStrictEqual, ok, strictEqual } from 'node:assert';

const BASE_URL = 'http://localhost:8080';

describe('API Workflow', () => {
  let _server = {};
  let _globalToken = '';

  before(async () => {
    _server = (await import('./api.js')).app;
    await new Promise(resolve => _server.once('listening', resolve));
  });

  describe('API Authentication test suite', () => {
    it('should receive not authorized given wrong user and password', async () => {
      const input = {
        user: 'joao',
        password: ''
      };

      const response = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        body: JSON.stringify(input)
      });
      strictEqual(response.status, 401);

      const data = await response.json();
      deepStrictEqual(data, { error: 'Invalid user' });
    });

    it('should login successfully given user and password', async () => {
      const input = {
        user: 'joao',
        password: 'pass123'
      };

      const response = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        body: JSON.stringify(input)
      });
      strictEqual(response.status, 201);

      const data = await response.json();
      ok(data.token, 'token should be prensent');
      _globalToken = data.token;
    });

    it('should not be allowed to access private data without authorization', async () => {
      const response = await fetch(`${BASE_URL}/`, {
        method: 'GET',
        headers: {
          authorization: ''
        }
      });
      strictEqual(response.status, 401);

      const data = await response.json();
      deepStrictEqual(data.result, 'Invalid access token');
    });

    it('should be allowed to access private data with a valid token', async () => {
      const response = await fetch(`${BASE_URL}/`, {
        method: 'GET',
        headers: {
          authorization: `Bearer ${_globalToken}`
        }
      });
      strictEqual(response.status, 200);

      const data = await response.json();
      deepStrictEqual(data.message, 'protected data');
    });

    it('should return route not found', async () => {
      const response = await fetch(`${BASE_URL}/abc`, {
        method: 'GET',
        headers: {
          authorization: `Bearer ${_globalToken}`
        }
      });
      strictEqual(response.status, 404);

      const data = await response.json();
      deepStrictEqual(data.message, 'Route Not Found');
    });
  });

  describe('API Products test suite', () => {
    it('should create a basic product', async () => {
      const input = {
        description: 'rubber',
        price: 49.99
      };

      const response = await fetch(`${BASE_URL}/products`, {
        method: 'POST',
        body: JSON.stringify(input),
        headers: {
          authorization: _globalToken
        }
      });
      deepEqual(response.status, 201);

      const data = await response.json();
      deepStrictEqual(data, {
        description: 'rubber',
        category: 'basic'
      });
    });

    it('should create a regular product', async () => {
      const input = {
        description: 'usb cable',
        price: 99.99
      };

      const response = await fetch(`${BASE_URL}/products`, {
        method: 'POST',
        body: JSON.stringify(input),
        headers: {
          authorization: _globalToken
        }
      });
      deepEqual(response.status, 201);

      const data = await response.json();
      deepStrictEqual(data, {
        description: 'usb cable',
        category: 'regular'
      });
    });

    it('should create a premium product', async () => {
      const input = {
        description: 'keyboard',
        price: 100
      };

      const response = await fetch(`${BASE_URL}/products`, {
        method: 'POST',
        body: JSON.stringify(input),
        headers: {
          authorization: _globalToken
        }
      });
      deepEqual(response.status, 201);

      const data = await response.json();
      deepStrictEqual(data, {
        description: 'keyboard',
        category: 'premium'
      });
    });
  });

  after(done => _server.close(done));
});
