const router = require('express').Router();

router.use('/users', require('./users'));
router.use('/articles', require('./articles'));
router.use('/signout', require('../controllers/users').signout);
router.use('/*', require('./pageNotFound'));

module.exports = router;
