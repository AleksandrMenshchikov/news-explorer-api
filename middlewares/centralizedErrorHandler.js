const { isCelebrateError } = require('celebrate');

module.exports = (err, req, res, next) => {
  // если у ошибки нет статуса, выставляем 500
  const { statusCode = 500, message } = err;

  if (isCelebrateError(err)) {
    res.status(400).send({
      message: err.details.get(Array.from(err.details.keys())[0]).details.map((item) => item.message).join(', '),
    });
  } else {
    res.status(statusCode).send({
      // проверяем статус и выставляем сообщение в зависимости от него
      message: statusCode === 500 ? 'На сервере произошла ошибка' : message,
    });
  }
  next();
};
