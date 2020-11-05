const router = require('express').Router();
const { getArticles, createArticle, deleteArticle } = require('../controllers/articles');

router.get('/', getArticles);

router.post('/',
  require('../middlewares/validationCelebrate').postArticle,
  createArticle);

router.delete('/:articleId',
  require('../middlewares/validationCelebrate').deleteArticle,
  deleteArticle);

module.exports = router;
