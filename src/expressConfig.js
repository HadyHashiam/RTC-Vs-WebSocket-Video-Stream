const express = require('express');
const http = require('http');

function setupExpress() {
  const app = express();
  const server = http.createServer(app);

  // Serve static files from the 'public' directory
  app.use(express.static('../public'));

  // Handle favicon.ico requests
  app.get('/favicon.ico', (req, res) => res.status(204).end());

  return { app, server };
}

module.exports = { setupExpress };