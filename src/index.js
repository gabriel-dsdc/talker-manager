const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const { join } = require('path');
const crypto = require('crypto');

const app = express();
app.use(bodyParser.json());

const HTTP_OK_STATUS = 200;
const PORT = '3000';

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

const readJson = async () => {
  const jsonPath = join(__dirname, '/talker.json');
  const jsonFile = await fs.readFile(jsonPath, 'utf-8');
  return JSON.parse(jsonFile);
};

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
  const isEmailValid = () => email.includes('@') && email.includes('.com');
  const isPasswordValid = () => password.length >= 6;

  if (!email) {
    return res.status(400).json({ message: 'O campo "email" é obrigatório' });
  }
  if (!isEmailValid()) {
    return res.status(400).json({ message: 'O "email" deve ter o formato "email@email.com"' });
  }
  if (!password) {
    return res.status(400).json({ message: 'O campo "password" é obrigatório' });
  }
  if (!isPasswordValid()) {
    return res.status(400).json({ message: 'O "password" deve ter pelo menos 6 caracteres' });
  } 
    res.status(200).json({ token });
});

app.listen(PORT, () => {
  console.log(`Online at http://localhost:${PORT}`);
});