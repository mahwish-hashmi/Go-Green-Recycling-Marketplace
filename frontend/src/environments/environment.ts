export const environment = {
  production: false,
  // Backend runs on port 8080 with context-path /api
  // So base URL for login/register = http://localhost:8080/api/login
  // For APIController endpoints = http://localhost:8080/api/api/products
  // We use http://localhost:8080/api as base and append paths manually
  API_URL: 'http://localhost:8080/api'
};
