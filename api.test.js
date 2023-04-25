import { describe, before, after, it } from 'node:test';
import { deepStrictEqual, ok, strictEqual } from 'node:assert';

const BASE_URL = 'http://localhost:8080';

describe('API Workflow', () => {
  let _server = {};
  let _globalToken = '';

  before(async () => {
    _server = (await import('./api.js')).app;
    await new Promise(resolve => _server.once('listening', resolve));
  });

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

  after(done => _server.close(done));
});
