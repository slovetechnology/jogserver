const { saveWallet, getAdminwallet, getSingleWallet, updateWallet, addAirdrop, getAllAirdrop, getSingleAirdrop, updateAirdrop, deleteAirdrop } = require('../controllers/adminwallet')

const router = require('express').Router()

router.post(`/add-wallet`, saveWallet)
router.get('/', getAdminwallet)
router.get('/:id', getSingleWallet)
router.put('/update-wallet/:id', updateWallet)
router.post('/add-airdrop', addAirdrop) 
router.get('/airdrop/all', getAllAirdrop)
router.get('/get-airdrop/:id', getSingleAirdrop)
router.put('/update-airdrop/:id', updateAirdrop)
router.delete('/delete-airdrop/:id', deleteAirdrop)

module.exports = router