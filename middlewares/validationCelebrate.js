const { celebrate, Joi, Segments } = require('celebrate');

module.exports.signup = celebrate({
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
});

module.exports.signin = celebrate({
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
});

module.exports.postArticle = celebrate({
  [Segments.BODY]: Joi.object().keys({
    keyword: Joi.string().required().messages({
      'any.required': '"keyword" требуется заполнить',
      'string.empty': '"keyword" не может быть пустым',
    }),
    title: Joi.string().required().messages({
      'any.required': '"title" требуется заполнить',
      'string.empty': '"title" не может быть пустым',
    }),
    text: Joi.string().required().messages({
      'any.required': '"text" требуется заполнить',
      'string.empty': '"text" не может быть пустым',
    }),
    date: Joi.string().required().messages({
      'any.required': '"date" требуется заполнить',
      'string.empty': '"date" не может быть пустым',
    }),
    source: Joi.string().required().messages({
      'any.required': '"source" требуется заполнить',
      'string.empty': '"source" не может быть пустым',
    }),
    link: Joi.string().required().pattern(/^https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,}$/).messages({
      'any.required': '"link" требуется заполнить',
      'string.empty': '"link" не может быть пустым',
      'string.pattern.base': '"link" не соответствует требуемому шаблону URL',
    }),
    image: Joi.string().required().pattern(/^https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,}$/).messages({
      'any.required': '"image" требуется заполнить',
      'string.empty': '"image" не может быть пустым',
      'string.pattern.base': '"image" не соответствует требуемому шаблону URL',
    }),
  }),
});

module.exports.deleteArticle = celebrate({
  [Segments.PARAMS]: Joi.object().keys({
    articleId: Joi.string().hex().length(24).required()
      .messages({
        'string.hex': '"articleId" должен содержать только шестнадцатеричные символы',
        'string.empty': '"articleId" не может быть пустым',
        'any.required': '"articleId" требуется заполнить',
        'string.length': '"articleId" длина должна быть 24 символа',
      }),
  }),
});
