const mongoose = require('mongoose');
const isEmail = require('validator/lib/isEmail');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: [true, '"email" требуется заполнить'],
    validate: {
      validator: (v) => isEmail(v),
      message: '"email" не соответствует требуемому шаблону email',
    },
  },
  password: {
    type: String,
    required: [true, '"пароль" требуется заполнить'],
    select: false,
  },
  name: {
    type: String,
    minlength: [2, '"Имя" должно быть не менее 2 символов'],
    maxlength: [30, '"Имя" должно быть не более 30 символов'],
    required: [true, '"Имя" требуется заполнить'],
  },
}, { versionKey: false });

module.exports = mongoose.model('user', userSchema);
