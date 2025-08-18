const express = require('express');
const swaggerUi = require('swagger-ui-express');

const swaggerDocument = {
  openapi: '3.0.0',
  info: { title: 'MedScan API', version: '1.0.0', description: 'API for MedScan app' },
  paths: {
    '/auth/login': {
      post: {
        summary: 'User login',
        requestBody: {
          content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' }, password: { type: 'string' } } } } }
        },
        responses: { '200': { description: 'Login successful' } }
      }
    },
    '/medicine/search': {
      post: {
        summary: 'Search medicine',
        requestBody: {
          content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, barcode: { type: 'string' } } } } }
        },
        responses: { '200': { description: 'Medicine details' } }
      }
    }
    // Add more endpoints as needed
  }
};

const router = express.Router();
router.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

module.exports = router;