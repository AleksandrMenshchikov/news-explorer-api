require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
// const cors = require('cors');
const limiter = require('./security_helpers/rateLimit');
const auth = require('./middlewares/auth');

const { PORT = 6000 } = process.env;
const app = express();
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(limiter);
app.use(helmet());

mongoose.connect('mongodb://localhost:27017/newsdb', {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

// настройка cors
// const whitelist = ['http://24news-explorer.ru', 'https://24news-explorer.ru'];
// const corsOptions = {
//   origin(origin, callback) {
//     if (whitelist.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   credentials: true,
// };
// app.use(cors(corsOptions));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use(require('./middlewares/logger').requestLogger); // подключаем логгер запросов

// роуты, не требующие авторизации
app.use('/signup',
  require('./middlewares/validationCelebrate').signup,
  require('./controllers/users').createUser);

app.use('/signin',
  require('./middlewares/validationCelebrate').signin,
  require('./controllers/users').login);

// авторизация
app.use(auth);

// роуты, которым авторизация нужна
app.use('/users', require('./routes/users'));
app.use('/articles', require('./routes/articles'));
app.use('/*', require('./routes/pageNotFound'));

app.use(require('./middlewares/logger').errorLogger); // подключаем логгер ошибок

// централизованный обработчик ошибок
app.use((err, req, res, next) => {
  // если у ошибки нет статуса, выставляем 500
  const { statusCode = 500, message } = err;

  if (err.message === 'Error: Not allowed by CORS') {
    res.status(500).send({ message: 'CORS не разрешает кросс-доменные запросы' });
  } else if (err.message === 'data and salt arguments required') {
    res.status(400).send({ message: 'Требуется передать данные' });
  } else if (err.name === 'ValidationError') {
    res.status(400).send({ message: err.message.split(': ')[2] });
  } else if (err.message === 'celebrate request validation failed') {
    res.status(400).send({
      message: err.details.get(Array.from(err.details.keys())[0]).details[0].message,
    });
  } else if (err.kind === 'ObjectId') {
    res.status(400).send({ message: 'Переданный аргумент должен быть одной строкой из 12 байтов или строкой из 24 шестнадцатеричных символов' });
  } else {
    res
      .status(statusCode)
      .send({
      // проверяем статус и выставляем сообщение в зависимости от него
        message: statusCode === 500
          ? 'На сервере произошла ошибка'
          : message,
      });
  }
  next();
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
