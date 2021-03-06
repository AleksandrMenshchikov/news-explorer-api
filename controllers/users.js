const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const NotFoundError = require('../errors/not-found-error');
const BadRequestError = require('../errors/bad-request-error');
const ConflictError = require('../errors/conflict-error');
const UnauthorizedError = require('../errors/unauthorized-error');
const User = require('../models/user');
const { JWT_SECRET } = require('../config');

module.exports.getUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь не найден с данным id');
      } else {
        res.status(200).json(user);
      }
    })
    .catch((err) => {
      if (err.kind === 'ObjectId') {
        next(new BadRequestError('Пользователь с данным id должен быть строкой из 24 шестнадцатеричных символов'));
      } else {
        next(err);
      }
    });
};

module.exports.createUser = (req, res, next) => {
  const {
    email,
    password,
    name,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => {
      User.create({ email, password: hash, name })
        .then((user) => {
          res.status(201).json({
            _id: user._id,
            email: user.email,
            name: user.name,
          });
        }).catch((err) => {
          if (err.name === 'MongoError' && err.code === 11000) {
            next(new ConflictError('Пользователь с таким email уже существует'));
          } else if (err.name === 'ValidationError') {
            next(new BadRequestError(Object.values(err.errors).map((item) => item.message).join(', ')));
          } else {
            next(err);
          }
        });
    }).catch((err) => {
      if (err.name === 'Error') {
        next(new BadRequestError('"пароль" требуется заполнить'));
      } else {
        next(err);
      }
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  let userMatched;

  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        throw new UnauthorizedError('Пользователь с таким email не зарегистрирован');
      }
      userMatched = user;
      return bcrypt.compare(password, user.password);
    })
    .then((matched) => {
      if (!matched) {
        throw new BadRequestError('Неправильно указан пароль');
      }
      // аутентификация успешна
      const token = jwt.sign({ _id: userMatched._id }, JWT_SECRET);

      res
        .cookie('jwt', token, {
          maxAge: 3600000 * 24 * 7,
          httpOnly: true,
          sameSite: true,
        })
        .status(201)
        .json({
          jwtCreated: 'JWT успешно создан и сохранен в Cookie',
          userId: userMatched._id,
        });
    })
    .catch((err) => next(err));
};

module.exports.signout = (req, res) => {
  res.clearCookie('jwt').status(200).send({ jwtDeleted: 'Успешный выход из системы' });
};
