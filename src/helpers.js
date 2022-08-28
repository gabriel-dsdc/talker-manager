const fs = require('fs').promises;
const { join } = require('path');

const jsonPath = join(__dirname, '/talker.json');
const readJson = async () => {
  const jsonFile = await fs.readFile(jsonPath, 'utf-8');
  return JSON.parse(jsonFile);
};

const isEmailValid = (email) => email.includes('@') && email.includes('.com');
const isPasswordValid = (password) => password.length >= 6;

const isTokenValid = (token) => {
  const response = {
    status: 401,
    message: undefined,
  };

  if (!token) {
    response.message = 'Token não encontrado';
  } else if (token.length < 16) {
    response.message = 'Token inválido';
  }
  return response.message ? response : false;
};

const isNameValid = (name) => {
  const response = {
    status: 400,
    message: undefined,
  };
  if (!name) {
    response.message = 'O campo "name" é obrigatório';
  } else if (name.length < 3) {
    response.message = 'O "name" deve ter pelo menos 3 caracteres';
  }
  return response.message ? response : false;
};

const isAgeValid = (age) => {
  const response = {
    status: 400,
    message: undefined,
  };

  if (!age) {
    response.message = 'O campo "age" é obrigatório';
  } else if (age < 18) {
    response.message = 'A pessoa palestrante deve ser maior de idade';
  }
  return response.message ? response : false;
};

const isDateValid = (watchedAt) => {
  const date = watchedAt.split('/');

  const day = date[0] >= 1 && date[0] <= 31;
  const month = date[1] >= 1 && date[1] <= 12;
  const year = `${date[2]}`.length === 4;

  return day && month && year;
};

const isWatchAtValid = (watchedAt) => {
  if (!watchedAt) return { status: 400, message: 'O campo "watchedAt" é obrigatório' };
  if (!isDateValid(watchedAt)) {
    return { status: 400, message: 'O campo "watchedAt" deve ter o formato "dd/mm/aaaa"' };
  }
};

const isRateValid = (rate) => {
  if (rate === undefined) return { status: 400, message: 'O campo "rate" é obrigatório' };
  if (!(rate >= 1 && rate <= 5)) {
    return { status: 400, message: 'O campo "rate" deve ser um inteiro de 1 à 5' };
  }
};

const isTalkValid = (talk) => {
  if (!talk) {
    return { status: 400, message: 'O campo "talk" é obrigatório' };
  }
  return isWatchAtValid(talk.watchedAt) || isRateValid(talk.rate);
};

const createTalker = async ({ name, age, talk }) => {
  const data = await readJson();
  data.push({
    id: data[data.length - 1].id + 1,
    name,
    age,
    talk,
  });
  await fs.writeFile(jsonPath, JSON.stringify(data), 'utf-8');
  return data[data.length - 1];
};

module.exports = {
  readJson,
  createTalker,
  isEmailValid,
  isPasswordValid,
  isTokenValid,
  isNameValid,
  isAgeValid,
  isTalkValid,
};
