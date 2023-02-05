const { saveBankdetails, getBankdetails, saveNewWithdrawal, saveCryptoWithdrawal, dashboardWtihdrawal, allWithdrawals, singleWithdrawal, declineWithdrawal, confirmWithdrawal, peerTransfer, coinSwap } = require('../controllers/withdrawals')

const router = require('express').Router()

router.post('/bank-details/:userid', saveBankdetails)
router.get('/mybank/:userid', getBankdetails)
router.post('/save-withdrawal/:userid/:walletid', saveNewWithdrawal)
router.post('/save-crypto-withdrawal/:userid/:walletid', saveCryptoWithdrawal)
router.get('/dashboard-withdrawal/:userid', dashboardWtihdrawal)
router.get('/all', allWithdrawals)
router.get('/single/:id', singleWithdrawal)
router.post('/decline-withdrawal/:id', declineWithdrawal)
router.post('/confirm-withdrawal/:id', confirmWithdrawal)
router.post('/peer-transfer/:userid', peerTransfer)
router.post('/swapcoin/:userid', coinSwap)

module.exports = router