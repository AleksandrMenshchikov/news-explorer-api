require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { celebrate, Joi, Segments } = require('celebrate');
// const cors = require('cors');
const rateLimit = require('express-rate-limit');
const auth = require('./middlewares/auth');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
});

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
app.use('/signup', celebrate({
  [Segments.BODY]: Joi.object().keys({
    email: Joi.string().trim().required().email()
      .messages({
        'string.email': '"Email" должен быть валидным',
        'string.empty': '"Email" не может быть пустым',
        'any.required': '"Email" требуется заполнить',
      }),
    password: Joi.string().trim().required().min(3)
      .messages({
        'string.empty': '"Пароль" не может быть пустым',
        'string.min': '"Пароль" должен быть не менее 3 символов',
        'any.required': '"Пароль" требуется заполнить',
      }),
    name: Joi.string().trim().min(2).max(30)
      .required()
      .messages({
        'string.empty': '"Имя" не может быть пустым',
        'string.min': '"Имя" должно быть не менее 2 символов',
        'string.max': '"Имя" должно быть не более 30 символов',
        'any.required': '"Имя" требуется заполнить',
      }),
  }),
}), require('./controllers/users').createUser);
app.use('/signin', celebrate({
  [Segments.BODY]: Joi.object().keys({
    email: Joi.string().trim().required().email()
      .messages({
        'string.email': '"Email" должен быть валидным',
        'string.empty': '"Email" не может быть пустым',
        'any.required': '"Email" требуется заполнить',
      }),
    password: Joi.string().trim().required().min(3)
      .messages({
        'string.empty': '"Пароль" не может быть пустым',
        'string.min': '"Пароль" должен быть не менее 3 символов',
        'any.required': '"Пароль" требуется заполнить',
      }),
  }),
}), require('./controllers/users').login);

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
  } else if (err.name === 'MongoError' && err.code === 11000) {
    res.status(409).send({ message: 'Пользователь с таким email уже существует', error: err.message });
  } else if (err.message === 'data and salt arguments required') {
    res.status(400).send({ message: 'Требуется передать данные' });
  } else if (err.name === 'ValidationError') {
    res.status(400).send({ message: 'Указанные данные не прошли валидацию', error: err.message });
  } else if (err.message === 'celebrate request validation failed') {
    res.status(400).send({ message: 'Указанные данные не прошли валидацию', error: err.details.get(Array.from(err.details.keys())[0]) });
  } else if (err.kind === 'ObjectId') {
    res.status(400).send({ message: 'Указанный id не соответсвует формату ObjectId MongoDB', error: err });
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
