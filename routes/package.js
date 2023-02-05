const { addPackage, getpackages, getPackage, updatePackage, deletePackage, checkoutPackage, getMiningDetails, addFunds, getUserMining, allMinedPlans, allUserEarnings } = require('../controllers/package')

const router = require('express').Router()

router.post('/add-package', addPackage)
router.get('/', getpackages)
router.get('/:id', getPackage)
router.post('/update-package/:id', updatePackage)
router.delete('/delete-package/:id', deletePackage)
router.post('/checkout/:walletid/:packid', checkoutPackage)
router.get('/get-mining/:userid', getMiningDetails)
router.get('/add-funds/:userid', addFunds)
router.get('/my-mined/:userid', allMinedPlans)
router.get('/user-earnings/:userid', allUserEarnings)

module.exports = router