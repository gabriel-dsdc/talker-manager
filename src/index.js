const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const {
  readJson,
  createTalker,
  isEmailValid,
  isPasswordValid,
  isTokenValid,
  isNameValid,
  isAgeValid,
  isTalkValid,
  editTalker,
  deleteTalker,
} = require('./helpers');

const app = express();
app.use(bodyParser.json());

const HTTP_OK_STATUS = 200;
const HTTP_CREATED_STATUS = 201;
const HTTP_NO_CONTENT_STATUS = 204;
const HTTP_BAD_REQUEST_STATUS = 400;
const HTTP_NOT_FOUND_STATUS = 404;
const PORT = '3000';

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.get('/talker', async (_req, res) => {
  res.status(HTTP_OK_STATUS).json(await readJson());
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
