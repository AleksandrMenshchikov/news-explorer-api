const Article = require('../models/article');
const NotFoundError = require('../errors/not-found-error');
const ForbiddenError = require('../errors/forbidden-error');
const BadRequestError = require('../errors/bad-request-error');

module.exports.getArticles = (req, res, next) => {
  Article.find({})
    .select('+owner')
    .populate('owner')
    .then((articles) => res.json(articles))
    .catch((err) => next(err));
};

module.exports.createArticle = (req, res, next) => {
  const {
    keyword, title, text, date, source, link, image,
  } = req.body;

  Article.create({
    keyword, title, text, date, source, link, image, owner: req.user._id,
  })
    .then((article) => {
      Article.findById(article._id).select('+owner').populate('owner').then((result) => res.json(result))
        .catch((err) => next(err));
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError(Object.values(err.errors).map((item) => item.message).join(', ')));
      } else {
        next(err);
      }
    });
};

module.exports.deleteArticle = (req, res, next) => {
  Article.findById(req.params.articleId).select('+owner').populate('owner')
    .then((article) => {
      if (!article) {
        throw new NotFoundError('Статьи с данным id нет в базе данных');
      }

      if (req.user._id.toString() === article.owner._id.toString()) {
        Article.findByIdAndRemove(req.params.articleId)
          .then((result) => {
            res.json(result);
          })
          .catch((err) => next(err));
      } else {
        throw new ForbiddenError('Попытка удалить чужую статью');
      }
    })
    .catch((err) => {
      if (err.kind === 'ObjectId') {
        next(new BadRequestError('ID статьи должен быть строкой из 24 шестнадцатеричных символов'));
      } else {
        next(err);
      }
    });
};
