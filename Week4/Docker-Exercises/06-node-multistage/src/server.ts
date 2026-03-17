import http from 'node:http';

const port = 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Hello from multi-stage Node.js Docker build!');
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});
