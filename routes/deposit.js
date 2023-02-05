const { saveNewDeposit, allDeposits, singleDeposit, confirmDeposit, declineDeposit, dashboardDeposit } = require('../controllers/deposit')

const router = require('express').Router()

router.post('/save-deposit/:userid', saveNewDeposit)
router.get('/all', allDeposits)
router.get('/single/:id', singleDeposit)
router.post('/confirm-deposit/:id', confirmDeposit)
router.post('/decline-deposit/:id', declineDeposit)
router.get('/dashboard-deposit/:userid', dashboardDeposit)

module.exports = router