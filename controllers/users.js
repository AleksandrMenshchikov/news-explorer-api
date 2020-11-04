const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const NotFoundError = require('../errors/not-found-error');
const BadRequestError = require('../errors/bad-request-error');
const User = require('../models/user');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports.getUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь не найден с данным id');
      }
      res.status(200).json(user);
    })
    .catch((err) => next(err));
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
        }).catch((err) => next(err));
    }).catch((err) => next(err));
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  let userMatched;

  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        throw new BadRequestError('Неправильно указан email или пароль');
      }
      userMatched = user;
      return bcrypt.compare(password, user.password);
    })
    .then((matched) => {
      // аутентификация успешна
      if (matched) {
        const token = jwt.sign({ _id: userMatched._id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret');

        res.cookie('jwt', token, {
          maxAge: 3600000 * 24 * 7,
          httpOnly: true,
          sameSite: true,
        }).status(201).json({ message: 'JWT успешно создан и сохранен в Cookie', userId: userMatched._id });
      }
      throw new BadRequestError('Неправильно указан email или пароль');
    })
    .catch((err) => next(err));
};