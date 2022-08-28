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
} = require('./helpers');

const app = express();
app.use(bodyParser.json());

const HTTP_OK_STATUS = 200;
const PORT = '3000';

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.get('/talker', async (_req, res) => {
  res.status(200).json(await readJson());
});

app.get('/talker/:id', async (req, res) => {
  const { id } = req.params;
  const data = await readJson();
  const talker = data.find((person) => person.id === Number(id));
  if (talker) {
    res.status(200).json(talker);
  } else {
    res.status(404).json({ message: 'Pessoa palestrante não encontrada' });
  }
});

const generateToken = () => crypto.randomBytes(8).toString('hex');

app.post('/login', (req, res) => {
  const token = generateToken();
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'O campo "email" é obrigatório' });
  }
  if (!isEmailValid(email)) {
    return res.status(400).json({ message: 'O "email" deve ter o formato "email@email.com"' });
  }
  if (!password) {
    return res.status(400).json({ message: 'O campo "password" é obrigatório' });
  }
  if (!isPasswordValid(password)) {
    return res.status(400).json({ message: 'O "password" deve ter pelo menos 6 caracteres' });
  } 
    res.status(200).json({ token });
});

app.post('/talker', async (req, res) => {
  const token = req.header('authorization');
  const { name, age, talk } = req.body;

  const error = isTokenValid(token) || isNameValid(name) || isAgeValid(age) || isTalkValid(talk);

  if (error) {
    return res.status(error.status).json({ message: error.message });
  }

  return res.status(201).json(await createTalker({ name, age, talk }));
});

app.listen(PORT, () => {
  console.log(`Online at http://localhost:${PORT}`);
});
