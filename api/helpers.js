const fs = require('fs').promises;
const { join } = require('path');

const HTTP_BAD_REQUEST_STATUS = 400;
const HTTP_UNAUTHORIZED_STATUS = 401;

const readJson = async (path = '/talker.json') => {
  let jsonFile;
  try {
    jsonFile = await fs.readFile(`/tmp${path}`, 'utf-8');
  } catch (error) {
    jsonFile = await fs.readFile(join(__dirname, path), 'utf-8');
  }
  return JSON.parse(jsonFile);
};
const writeJson = async (data) => {
  let jsonPath = '';
  if (process.env.NODE_ENV === 'production') {
    jsonPath = ('/tmp/talker.json');
  } else {
    jsonPath = (join(__dirname, '/talker.json'));
  }
  await fs.writeFile(jsonPath, JSON.stringify(data, null, 2), 'utf-8');
};

const resetJsonData = async () => {
  const data = await readJson('/seed.json');
  await writeJson(data);
};

const isEmailValid = (email) => email.includes('@') && email.includes('.com');
const isPasswordValid = (password) => password.length >= 6;

const isTokenValid = (token) => {
  const response = {
    status: HTTP_UNAUTHORIZED_STATUS,
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
    status: HTTP_BAD_REQUEST_STATUS,
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
    status: HTTP_BAD_REQUEST_STATUS,
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
  if (!watchedAt) {
    return { status: HTTP_BAD_REQUEST_STATUS, message: 'O campo "watchedAt" é obrigatório' };
  }
  if (!isDateValid(watchedAt)) {
    return {
      status: HTTP_BAD_REQUEST_STATUS,
      message: 'O campo "watchedAt" deve ter o formato "dd/mm/aaaa"' };
  }
};

const isRateValid = (rate) => {
  if (rate === undefined) {
    return { status: HTTP_BAD_REQUEST_STATUS, message: 'O campo "rate" é obrigatório' };
  }
  if (!(rate >= 1 && rate <= 5)) {
    return { 
      status: HTTP_BAD_REQUEST_STATUS,
      message: 'O campo "rate" deve ser um inteiro de 1 à 5' };
  }
};

const isTalkValid = (talk) => {
  if (!talk) {
    return { status: HTTP_BAD_REQUEST_STATUS, message: 'O campo "talk" é obrigatório' };
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
  await writeJson(data);
  return data[data.length - 1];
};

const editTalker = async ({ id, name, age, talk }) => {
  const data = await readJson();
  const talkerFound = data.find((talker) => talker.id === Number(id));

  talkerFound.name = name;
  talkerFound.age = age;
  talkerFound.talk = talk;

  await writeJson(data);
  return talkerFound;
};

const deleteTalker = async ({ id }) => {
  const data = await readJson();
  const talkerRemoved = data.filter((talker) => talker.id !== Number(id));

  await writeJson(talkerRemoved);
};

const searchTalker = async (query) => {
  const data = await readJson();
  const talkersFound = data.filter((talker) => talker.name.includes(query));

  return talkersFound;
};

module.exports = {
  readJson,
  resetJsonData,
  createTalker,
  editTalker,
  deleteTalker,
  searchTalker,
  isEmailValid,
  isPasswordValid,
  isTokenValid,
  isNameValid,
  isAgeValid,
  isTalkValid,
};
