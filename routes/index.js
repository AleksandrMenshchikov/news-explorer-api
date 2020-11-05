const router = require('express').Router();

router.use('/users', require('./users'));
router.use('/articles', require('./articles'));
router.use('/*', require('./pageNotFound'));

module.exports = router;
