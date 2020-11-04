const router = require('express').Router();
const { celebrate, Joi, Segments } = require('celebrate');
const { getUser } = require('../controllers/users');

router.get('/me', getUser);

module.exports = router;
