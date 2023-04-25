import { once } from 'node:events';
import { createServer } from 'node:http';
import jwt from 'jsonwebtoken';

const VALID_USER = {
  user: 'joao',
  password: 'pass123'
};
const JWT_KEY = 'secret-key';

async function loginRoute(request, response) {
  const { user, password } = JSON.parse(await once(request, 'data'));

  if (user !== VALID_USER.user || password !== VALID_USER.password) {
    response.writeHead(401);
    response.end(JSON.stringify({ error: 'Invalid user' }));
    return;
  }

  const token = jwt.sign({ user }, JWT_KEY);

  response.writeHead(201);
  response.end(JSON.stringify({ token }));
}

function isHeadersValid(headers) {
  try {
    const token = headers.authorization.replace(/bearer\s/gi, '');
    jwt.verify(token, JWT_KEY);
    return true;
  } catch (error) {
    return false;
  }
}

function handler(request, response) {
  if (request.url === '/login' && request.method === 'POST') {
    loginRoute(request, response);
    return;
  }

  if (!isHeadersValid(request.headers)) {
    response.writeHead(401);
    response.end(JSON.stringify({ result: 'Invalid access token' }));
    return;
  }

  response.end(JSON.stringify({ message: 'protected data' }));
}

const hostname = '127.0.0.1';
const port = 8080;

const app = createServer(handler).listen(port, hostname, () =>
  console.log(`Server running at http://${hostname}:${port}/`)
);

export { app };
