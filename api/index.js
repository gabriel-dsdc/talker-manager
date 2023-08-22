const crypto = require('crypto');
const express = require('express');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./openapi.json');
const {
  readJson,
  restoreJsonData,
  createTalker,
  isEmailValid,
  isPasswordValid,
  isTokenValid,
  isNameValid,
  isAgeValid,
  isTalkValid,
  editTalker,
  deleteTalker,
  searchTalker,
} = require('./helpers');

const app = express();
app.use(bodyParser.json());
app.get('/docs/openapi.json', (_req, res) => res.type('json')
  .send(JSON.stringify(swaggerDocument, null, 2)));
app.use('/docs', (req, _res, next) => {
  swaggerDocument.servers = [
    process.env.VERCEL_URL ? { url: process.env.VERCEL_URL, description: 'Production server' }
    : { url: `http://${req.get('host')}`, description: 'Development server' },
  ];
  next();
}, swaggerUi.serve, swaggerUi.setup(null, {
  customSiteTitle: 'Talker Manager - Swagger UI',
  customCss: '.swagger-ui .topbar { display: none }',
  customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.4.2/swagger-ui.min.css',
  customJs: ['https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.4.2/swagger-ui-bundle.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.4.2/swagger-ui-standalone-preset.min.js'],
  swaggerOptions: {
    url: 'openapi.json',
    persistAuthorization: true,
    operationsSorter: (a, b) => {
      const customOrder = ['get-/talker', 'get-/talker/{id}', 'post-/login',
      'post-/talker', 'put-/talker/{id}', 'delete-/talker/{id}', 'get-/talker/search'];
      const indexA = customOrder.indexOf(`${a.get('method')}-${a.get('path')}`);
      const indexB = customOrder.indexOf(`${b.get('method')}-${b.get('path')}`);
      
      return indexA - indexB;
    },
    // eslint-disable-next-line no-undef
    onComplete: async () => fetch('/'),
  },
}));

const HTTP_OK_STATUS = 200;
const HTTP_CREATED_STATUS = 201;
const HTTP_NO_CONTENT_STATUS = 204;
const HTTP_BAD_REQUEST_STATUS = 400;
const HTTP_NOT_FOUND_STATUS = 404;
const PORT = process.env.PORT || 3000;

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', async (_request, response) => {
  await restoreJsonData();
  response.redirect(307, '/docs/');
});

app.get('/talker', async (_req, res) => {
  res.status(HTTP_OK_STATUS).json(await readJson());
});

app.get('/talker/search', async (req, res) => {
  const { q: query } = req.query;
  const token = req.header('authorization');
  const error = isTokenValid(token);

  if (error) {
    return res.status(error.status).json({ message: error.message });
  }

  if (query) {
    res.status(HTTP_OK_STATUS).json(await searchTalker(query));
  } else {
    res.status(HTTP_OK_STATUS).json(await readJson());
  }
});

app.get('/talker/:id', async (req, res) => {
  const { id } = req.params;
  const data = await readJson();
  const talker = data.find((person) => person.id === Number(id));
  if (talker) {
    res.status(HTTP_OK_STATUS).json(talker);
  } else {
    res.status(HTTP_NOT_FOUND_STATUS).json({ message: 'Pessoa palestrante não encontrada' });
  }
});

const generateToken = () => crypto.randomBytes(8).toString('hex');

app.post('/login', (req, res) => {
  const token = generateToken();
  const { email, password } = req.body;
  if (!email) {
    return res.status(HTTP_BAD_REQUEST_STATUS)
    .json({ message: 'O campo "email" é obrigatório' });
  }
  if (!isEmailValid(email)) {
    return res.status(HTTP_BAD_REQUEST_STATUS)
    .json({ message: 'O "email" deve ter o formato "email@email.com"' });
  }
  if (!password) {
    return res.status(HTTP_BAD_REQUEST_STATUS)
    .json({ message: 'O campo "password" é obrigatório' });
  }
  if (!isPasswordValid(password)) {
    return res.status(HTTP_BAD_REQUEST_STATUS)
    .json({ message: 'O "password" deve ter pelo menos 6 caracteres' });
  } res.status(HTTP_OK_STATUS).json({ token });
});

app.post('/talker', async (req, res) => {
  const token = req.header('authorization');
  const { name, age, talk } = req.body;

  const error = isTokenValid(token) || isNameValid(name) || isAgeValid(age) || isTalkValid(talk);

  if (error) {
    return res.status(error.status).json({ message: error.message });
  }

  return res.status(HTTP_CREATED_STATUS).json(await createTalker({ name, age, talk }));
});

app.put('/talker/:id', async (req, res) => {
  const token = req.header('authorization');
  const { id } = req.params;
  const { name, age, talk } = req.body;

  const error = isTokenValid(token) || isNameValid(name) || isAgeValid(age) || isTalkValid(talk);

  if (error) {
    return res.status(error.status).json({ message: error.message });
  }

  return res.status(HTTP_OK_STATUS).json(await editTalker({ id, name, age, talk }));
});

app.delete('/talker/:id', async (req, res) => {
  const token = req.header('authorization');
  const { id } = req.params;

  const error = isTokenValid(token);

  if (error) {
    return res.status(error.status).json({ message: error.message });
  }

  await deleteTalker({ id });
  return res.status(HTTP_NO_CONTENT_STATUS).end();
});

app.listen(PORT, () => {
  console.log(`Online at http://localhost:${PORT}`);
});

module.exports = app;
