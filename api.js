import { once } from 'node:events';
import { createServer } from 'node:http';

const VALID_USER = {
  user: 'joao',
  password: 'joao123'
};

async function loginRoute(request, response) {
  const { user, password } = JSON.parse(await once(request, 'data'));

  if (user !== VALID_USER.user || password !== VALID_USER.password) {
    response.writeHead(401);
    response.end(JSON.stringify({ error: 'Invalid user' }));
    return;
  }

  request.end('ok');
}

function handler(request, response) {
  if (request.url === '/login' && request.method === 'POST') {
    loginRoute(request, response);
    return;
  }

  response.end('Hello, World');
}

const hostname = '127.0.0.1';
const port = 8080;

const app = createServer(handler).listen(port, hostname, () =>
  console.log(`Server running at http://${hostname}:${port}/`)
);

export { app };
