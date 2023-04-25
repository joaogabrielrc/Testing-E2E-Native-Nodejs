import { createServer } from 'node:http';

function handler(request, response) {
  response.end('Hello, World');
}

const hostname = '127.0.0.1';
const port = 8080;

const app = createServer(handler).listen(port, hostname, () =>
  console.log(`Server running at http://${hostname}:${port}/`)
);

export { app };
