require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
// const cors = require('cors');
const limiter = require('./security_helpers/rateLimit');
const auth = require('./middlewares/auth');

const { BASE_URL_MONGODB } = process.env;

const { PORT = 6000 } = process.env;
const app = express();
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(limiter);
app.use(helmet());

mongoose.connect(`mongodb://${BASE_URL_MONGODB}/newsdb`, {
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
//       callback(new ForbiddenError('CORS не разрешает кросс-доменные запросы'));
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
app.use(require('./routes/index'));

app.use(require('./middlewares/logger').errorLogger); // подключаем логгер ошибок

// централизованный обработчик ошибок
app.use(require('./errors/centralizedErrorHandler'));

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
