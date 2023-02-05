const { myTransactions } = require('../controllers/deposit');

const router = require('express').Router()

router.get('/all/:userid', myTransactions)

module.exports = router;