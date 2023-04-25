import { describe, before, after, it } from 'node:test';
import { deepStrictEqual, strictEqual } from 'node:assert';

const BASE_URL = 'http://localhost:8080';

describe('API Workflow', () => {
  let _server = {};

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

  after(done => _server.close(done));
});
