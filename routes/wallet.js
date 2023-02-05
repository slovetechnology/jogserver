const { addWallet, getMyWallets, allMywallets, getSingleWallet, onWallet, offWallet } = require('../controllers/wallet');

const router = require('express').Router()

router.post('/add-wallet', addWallet)
router.get('/mywallets/:userid/:adminwalletid', getMyWallets)
router.get('/all/:userid', allMywallets)
router.get('/single/:id', getSingleWallet)
router.get('/off-wallet/:id', offWallet)
router.get('/on-wallet/:id', onWallet)

module.exports = router;