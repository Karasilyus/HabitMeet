require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const apiRoutes = require('./src/routes');
const { errorHandler } = require('./src/middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

const swaggerDocument = YAML.load(
  path.join(__dirname, 'src', 'swagger', 'openapi.yaml')
);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  })
);
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get('/api-docs.json', (req, res) => res.json(swaggerDocument));

app.use('/api', apiRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/', (req, res) => {
  res.status(200).json({
    name: 'HabitMeet API',
    status: 'running',
    message: 'Bu adres yalnızca API sunucusudur. Web arayüzü için frontend klasörünü ayrı çalıştırın.',
    links: {
      health: '/health',
      swagger: '/api-docs',
      api: '/api',
    },
    frontend: {
      hint: 'cd frontend && npx serve -p 5500',
      url: 'http://localhost:5500',
    },
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use(errorHandler);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`HabitMeet API running on http://localhost:${PORT}`);
    console.log(`Swagger UI: http://localhost:${PORT}/api-docs`);
  });
}

module.exports = app;
