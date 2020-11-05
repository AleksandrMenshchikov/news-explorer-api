const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  keyword: {
    type: String,
    required: [true, '"keyword" требуется заполнить'],
  },
  title: {
    type: String,
    required: [true, '"title" требуется заполнить'],
  },
  text: {
    type: String,
    required: [true, '"text" требуется заполнить'],
  },
  date: {
    type: String,
    required: [true, '"date" требуется заполнить'],
  },
  source: {
    type: String,
    required: [true, '"source" требуется заполнить'],
  },
  link: {
    type: String,
    required: [true, '"link" требуется заполнить'],
    validate: {
      validator: (v) => /^https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,}$/.test(v),
      message: '"link" не соответствует требуемому шаблону URL',
    },
  },
  image: {
    type: String,
    required: [true, '"image" требуется заполнить'],
    validate: {
      validator: (v) => /^https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,}$/.test(v),
      message: '"image" не соответствует требуемому шаблону URL',
    },
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: [true, '"owner" требуется заполнить'],
    select: false,
  },
}, { versionKey: false });

module.exports = mongoose.model('article', articleSchema);
