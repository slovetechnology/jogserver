const Vendor = require('../models').vendors
const User = require('../models').users
const Vendortransfer = require('../models').vendortransfers
const Adminwallet = require('../models').adminwallets
const moment = require('moment/moment')
const { Op } = require('sequelize')
const Vendorfeedback = require('../models').vendorfeedbacks
const Wallet = require('../models').wallets
const Deposit = require('../models').deposits
const Transaction = require('../models').transactions
const Withdrawal = require('../models').withdrawals
const Vendorhistory = require('../models').vendorhistories
const Feecharge = require('../models').feecharges

exports.addNewVendor = async (req, res) => {
    try {
        const { user, bank, rate } = req.body
        // check if usr has requested to be a vendor before
        const vuser = await User.findByPk(user)
        const checkVendor = await Vendor.findOne({ where: { user_id: user } })
        if (checkVendor) {
            if (checkVendor.status === 'pending') {
                return res.json({ status: 400, msg: `Seems like you have an awaiting approval pending...` })
            }
            if (checkVendor.status === 'declined') {
                return res.json({ status: 400, msg: `Looks like your proposal to become a vendor was declined..` })
            }
            if (checkVendor.status === 'verified') {
                return res.json({ status: 400, msg: `Your proposal to become a vendor was successfully verified..` })
            }
        } else {

            // vendor must have uploaded address from profile before making this request and also a profile photo
            if (vuser.address === null) {
                return res.json({ status: 400, msg: 'Unable to grant your request, you must attach a valid residential address to your profile!...' })
            }
            if (vuser.image === null) {
                return res.json({ status: 400, msg: 'Unable to grant your request, you must upload a profile photograph for your account!..' })
            }

            const date = new Date;
            const passportfile = req.files.passport;
            const newpass = `${date.getTime() * 3}.png`
            passportfile.mv(`./public/documents/${newpass}`, err => {
                if (err) return res.json({ status: 400, msg: `Error Uploading Passport` })
            })

            const idcardfile = req.files.idcard;
            const newidcard = `${date.getTime() * 5}.png`
            idcardfile.mv(`./public/documents/${newidcard}`, err => {
                if (err) return res.json({ status: 400, msg: `Error Uploading ID Card` })
            })

            const prooffile = req.files.proof
            const newproof = `${date.getTime() * 7}.png`
            prooffile.mv(`./public/documents/${newproof}`, err => {
                if (err) return res.json({ status: 400, msg: `Error Uploading Proof of Address` })
            })

            const newvendor = { idcard: newidcard, passport: newpass, poa: newproof, fee: 1.10, bank: bank, status: 'pending', user_id: user, rate: rate }
            await Vendor.create(newvendor)
            res.json({ status: 200, msg: `Request to become a vendor successfully submitted, awaiting approval at the moment.` })
        }
    } catch (error) {
        return res.json({ status: 400, msg: `Error Loading.. ${error}` });
    }
}

exports.getAllVendors = async (req, res) => {
    try {
        const users = await Vendor.findAll({
            include: [{ model: User, as: 'user' }],
            order: [['createdAt', 'DESC']]
        })

        res.json({ status: 200, msg: users })
    } catch (error) {
        return res.json({ status: 400, msg: error })
    }
}

exports.getSingleVendor = async (req, res) => {
    try {
        const user = await Vendor.findOne({
            include: [{ model: User, as: 'user' }],
            where: { id: req.params.id }
        })

        if (user) {
            const goodfeeds = await Vendorfeedback.findAll({where: {vendor: req.params.id, status: 'good'}})
            const badfeeds = await Vendorfeedback.findAll({where: {vendor: req.params.id, status: 'bad'}})
            return res.json({ status: 200, msg: user, goodfeeds, badfeeds })
        } else {
            return res.json({ status: 400 })
        }
    } catch (error) {
        return res.json({ status: 400, msg: error })
    }
}

exports.getSingleUserVendor = async (req, res) => {
    try {
        const user = await Vendor.findOne({
            include: [{ model: User, as: 'user' }],
            where: { user_id: req.params.userid }
        })

        if (user) {
            return res.json({ status: 200, msg: user })
        } else {
            return res.json({ status: 400 })
        }
    } catch (error) {
        return res.json({ status: 400, msg: error })
    }
}

exports.declineVendor = async (req, res) => {
    try {
        const user = await Vendor.findOne({
            include: [{ model: User, as: 'user' }],
            where: { id: req.params.id }
        })
        user.status = 'declined'
        await user.save()
        res.json({ status: 200, user, msg: 'Vendor proposal successfully declined' })
    } catch (error) {
        return res.json({ status: 400, msg: error })
    }
}

exports.verifyVendor = async (req, res) => {
    try {
        const user = await Vendor.findOne({
            where: { id: req.params.id },
            include: [{ model: User, as: 'user' }]
        })
        user.status = 'verified'
        await user.save()
        res.json({ status: 200, user, msg: 'Vendor proposal successfully verified' })
    } catch (error) {
        return res.json({ status: 400, msg: `Error ${error}` })
    }
}

exports.getAllVendsNotMe = async (req, res) => {
    try {
        const users = await Vendor.findAll({
            where: { status: 'verified' },
            include: [{ model: User, as: 'user' }]
            // where: {user_id: {[Op.not]: req.params.userid}}
        })

        res.json({ status: 200, msg: users })
    } catch (error) {
        return res.json({ status: 400, msg: error })
    }
}

exports.getVendorProperty = async (req, res) => {
    try {
        const goodfeeds = await Vendorfeedback.findAll({where: {vendor: req.params.vendorid, status: 'good'}})
        const badfeeds = await Vendorfeedback.findAll({where: {vendor: req.params.vendorid, status: 'bad'}})
        const hist = await Vendorhistory.findAll({where: {vendor: req.params.vendorid}})
        const chist = await Vendorhistory.findAll({where: {vendor: req.params.vendorid, status: 'completed'}})

        let bal = 0
        hist.map((item) => (
            bal += item.amount
        ))

        res.json({status: 200, msg: 'okay', goodfeeds, badfeeds, hist, bal, chist})
    } catch (error) {
        res.json({status: 400, msg: `Error ${error}`})
    }
}
exports.VendorfindMe = async (req, res) => {
    try {
        const user = await Vendor.findOne({
            include: [{ model: User, as: 'user' }],
            where: { user_id: req.params.userid }
        })
        if (user) {
            res.json({ status: 200, msg: 'true', user })
        } else {
            res.json({ status: 200, msg: 'false', user })
        }
    } catch (error) {
        return res.json({ status: 400, msg: `Error ${error}` })
    }
}

exports.chooseAVendor = async (req, res) => {
    try {
        const { user_wallet, user_id, amount, vendor } = req.body
        const checkvend = await Vendortransfer.findOne({ 
            where: { user_id: user_id, vendor: vendor } })
        if (checkvend) {
            return res.json({ status: 400, msg: `You already have an open transfer with this vendor` })
        }
        const newvend = { user_wallet, user_id, vendor, amount, status: 'pending', fee: 1.10 }
        await Vendortransfer.create(newvend)

        res.json({ status: 200, msg: 'Transfer initiated, await vendor\'s response...' })
    } catch (error) {
        return res.json({ status: 400, msg: error })
    }
}

{/* now user has opened a proposal lets verify if its pending, accepted, payed, approved, confirmed */ }

exports.findMyVendor = async (req, res) => {
    try {
        const vends = await Vendortransfer.findOne({ 
            where: { user_id: req.params.userid, vendor: req.params.vendorid }
        })
        if (vends) {
            return res.json({ status: 200, msg: 'true', transfer: vends })
        }
        return res.json({ status: 200, msg: 'false' })
    } catch (error) {
        return res.json({ status: 400, msg: error })
    }
}

exports.VendorProposals = async (req, res) => {
    try {
        const vend = await Vendor.findOne({where: {user_id: req.params.userid}})
        const user = await Vendortransfer.findAll({
            where: { vendor: vend.id },
            include: [{model: User, as: 'user'}],
            order: [['createdAt', 'DESC']]
        })
        res.json({ status: 200, msg: user })
    } catch (error) {
        res.json({ status: 400, msg: `Error ${error}` })
    }
}

exports.SingleTransfer = async (req, res) => {
    try {
        const transfer = await Vendortransfer.findOne({
            where: { id: req.params.id },
            include: [{model: User, as: 'user'}]
        })

        const wallet = await Wallet.findOne({
            where: {id: transfer.user_wallet},
            include: [{model: Adminwallet, as: 'adminwallet'}]
        })

        res.json({status: 200, msg: transfer, wallet})
    } catch (error) {
        res.json({status: 400, msg: `Error ${error}`})
    }
}

exports.adminGetSingleTransfer = async (req, res) => {
    try {
        const transfer = await Vendortransfer.findOne({
            where: { id: req.params.id },
            include: [{model: User, as: 'user'}]
        })

        const vendor = await Vendor.findOne({
            where: {id: transfer.vendor},
            include: [{model: User, as: 'user'}],
        })

        const wallet = await Wallet.findOne({
            where: {id: transfer.user_wallet},
            include: [{model: Adminwallet, as: 'adminwallet'}]
        })

        res.json({status: 200, msg: transfer, wallet, vendor})
    } catch (error) {
        res.json({status: 400, msg: error})
    }
}

exports.vendorAcceptTransfer = async (req, res) => {
    try {
        const {vwall_id, transact_id} = req.params
        const vendorWallet = await Wallet.findOne({
            where: {id: vwall_id},
            include: [{model: Adminwallet, as: 'adminwallet'}]
        })
        const trans = await Vendortransfer.findByPk(transact_id)
        trans.suspend = trans.amount
        trans.vendor_wallet = vendorWallet.id
        await trans.save()

        const minuscryp = vendorWallet.crypto / vendorWallet.adminwallet.current_price
        if(trans.amount > minuscryp) {
            return res.json({status: 400, msg: 'Cannot accept transaction: Insufficient Balance!...'})
        }

        const minusbal = minuscryp - trans.amount
        const getbal = minusbal * vendorWallet.adminwallet.current_price
        vendorWallet.crypto = getbal 
        await vendorWallet.save()

        trans.status = 'accepted'
        await trans.save()

        res.json({status: 200, msg: 'Proposal Successfully Accepted'})
    } catch (error) {
        res.json({status: 400, msg: `Error ${error}`})
    }
}

exports.declineProposalByVendor = async (req, res) => {
    try {
        const {transact_id} = req.params
        const transfer = await Vendortransfer.findByPk(transact_id)
        
        const newhistory = {user_id: transfer.user_id, vendor: transfer.vendor, amount: transfer.amount, fee: transfer.fee, user_wallet: transfer.user_wallet, status: 'declined by vendor'}
        await Vendorhistory.create(newhistory)

        await Vendortransfer.destroy({where: {id: transact_id}, force: true})


        res.json({status: 200, msg: 'transaction terminated: proposal successfully declined!...'})
    } catch (error) {
        res.json({status: 400, msg: `Error ${error}`})
    }
}

exports.proposalPaidByUser = async (req, res) => {
    try {
        const {paid, name, trans, method} = req.body 
        const file = req.files.image

        const transfer = await Vendortransfer.findByPk(trans)
        const date = new Date
        const filename = `${date.getTime()}.png`
        file.mv(`./public/proposals/${filename}`, err => {
            if(err) return res.json({status: 400, msg: `Error Uploading payment proof`})
        })

        transfer.payer_name = name 
        transfer.pay_method = method 
        transfer.paid = paid
        transfer.proof = filename
        transfer.status = 'paid'
        transfer.timelimit = moment().add(24, 'hours')
        await transfer.save()

        res.json({status: 200, msg: `Payment proof successfully submitted, awaiting vendor's approval`})
    } catch (error) {
        res.json({status: 400, msg: `Error ${error}`})
    }
}

exports.verifiedProposalByVendor = async (req, res) => {
    try {
        const {transact_id} = req.params
        const trans = await Vendortransfer.findByPk(transact_id)

        // get the vendor details
        const uservendor = await Vendor.findByPk(trans.vendor)
        const vendor = await User.findByPk(uservendor.user_id)
        const vendorwallet = await Wallet.findOne({where: {id: trans.vendor_wallet}})
        const vendoradmin = await Adminwallet.findByPk(vendorwallet.adminwallet_id)
        // 556 to pay 500
        // lets pay the user 
        const user = await User.findByPk(trans.user_id)
        const userwallet = await Wallet.findOne({where: {id: trans.user_wallet}})
        const useradmin = await Adminwallet.findByPk(userwallet.adminwallet_id)

        // add to user wallet
        const topay = parseInt(trans.amount - (trans.amount * trans.fee - trans.amount))
        const addtowallet = topay * useradmin.current_price
        userwallet.crypto += addtowallet
        await userwallet.save()

        // record fee
        const rec = trans.amount * trans.fee - trans.amount
        const newrecord = {title: 'fee from vendor transaction', amount: rec}
        await Feecharge.create(newrecord)

        // add to total deposits and make a transaction and deposit notification
        const message = `Credited the sum of $${topay} into my ${useradmin.name} wallet by vendor ${vendor.lname}`
        
        const newdept = { user_id: user.id, image: 'Not Available', title: 'deposit', message: message, amount: topay, status: 'Vendor Transfer', wallet: userwallet.id }
        await Deposit.create(newdept)

        const newtran = { amount: topay, title: 'deposit', user_id: user.id, tag: 'Vendor Transfer', message: message, tag_id: newdept.id }
        await Transaction.create(newtran)

        user.total_dept += topay
        await user.save()

        // work on the vendor part as total withdraws make eithdraw andtransaction notification
        const calctoget = (trans.amount * trans.fee - trans.amount).toFixed(2)
        const toget = (calctoget * 1.60 - calctoget).toFixed(2)
        const topupvendor = toget * vendoradmin.current_price
        vendorwallet.crypto += topupvendor
        await vendorwallet.save()
        
        const message2 = `Withdrew the sum of $${topay} from my ${vendoradmin.name} wallet to fund the ${useradmin.name} wallet of ${user.fname} ${user.lname}`

        const newwith = { user_id: vendor.id, title: 'Withdrawal', message: message2, amount: topay, status: 'Vendor Transfer', wallet: vendorwallet.id }
        await Withdrawal.create(newwith)

        const withtran = { amount: topay, title: 'Withdrawal', user_id: vendor.id, tag: 'Vendor Transfer', message: message2, tag_id: newwith.id }
        await Transaction.create(withtran)

        vendor.total_with += trans.amount 
        vendor.total_bonus += toget
        vendor.bonus += toget
        await vendor.save()

        trans.status = 'approved'
        await trans.save()


        res.json({status: 200, msg: `Transaction successfully verified, $${topay} sent to ${user.fname}'s ${useradmin.name} wallet`})
    } catch (error) {
        res.json({status: 400, msg: `Error ${error}`})
    }
}

exports.verifiedProposalByAdmin = async (req, res) => {
    try {
        const {transact_id} = req.params
        const trans = await Vendortransfer.findByPk(transact_id)

        // get the vendor details
        const uservendor = await Vendor.findByPk(trans.vendor)
        const vendor = await User.findByPk(uservendor.user_id)
        const vendorwallet = await Wallet.findOne({where: {id: trans.vendor_wallet}})
        const vendoradmin = await Adminwallet.findByPk(vendorwallet.adminwallet_id)
        // 556 to pay 500
        // lets pay the user 
        const user = await User.findByPk(trans.user_id)
        const userwallet = await Wallet.findOne({where: {id: trans.user_wallet}})
        const useradmin = await Adminwallet.findByPk(userwallet.adminwallet_id)

        // add to user wallet
        const topay = parseInt(trans.amount - (trans.amount * trans.fee - trans.amount))
        const addtowallet = topay * useradmin.current_price
        userwallet.crypto += addtowallet
        await userwallet.save()

        // record fee
        const rec = trans.amount * trans.fee - trans.amount
        const newrecord = {title: 'fee from vendor transaction', amount: rec}
        await Feecharge.create(newrecord)

        // add to total deposits and make a transaction and deposit notification
        const message = `Credited the sum of $${topay} into my ${useradmin.name} wallet by jogglecryp administrative`
        
        const newdept = { user_id: user.id, image: 'Not Available', title: 'deposit', message: message, amount: topay, status: 'Admin Transfer', wallet: userwallet.id }
        await Deposit.create(newdept)

        const newtran = { amount: topay, title: 'deposit', user_id: user.id, tag: 'Admin Transfer', message: message, tag_id: newdept.id }
        await Transaction.create(newtran)

        user.total_dept += topay
        await user.save()

        // work on the vendor part as total withdraws make withdraw andtransaction notification
        const calctoget = (trans.amount * trans.fee - trans.amount).toFixed(2)
        const topupvendor = calctoget * vendoradmin.current_price
        vendorwallet.crypto -= topupvendor
        await vendorwallet.save()
        
        const message2 = `Withdrew the sum of $${topay} from my ${vendoradmin.name} wallet to fund the ${useradmin.name} wallet of ${user.fname} ${user.lname} by Jogglecryp Administratives`

        const newwith = { user_id: vendor.id, title: 'Withdrawal', message: message2, amount: topay, status: 'Admin Withdrawal', wallet: vendorwallet.id }
        await Withdrawal.create(newwith)

        const withtran = { amount: topay, title: 'Withdrawal', user_id: vendor.id, tag: 'Admin Withdrawal', message: message2, tag_id: newwith.id }
        await Transaction.create(withtran)

        vendor.total_with += trans.amount 
        await vendor.save()

        trans.status = 'administrative'
        await trans.save()


        res.json({status: 200, msg: `Transaction successfully interceeded, $${topay} sent to ${user.fname}'s ${useradmin.name} wallet`})
    } catch (error) {
        res.json({status: 400, msg: `Error ${error}`})
    }
}

exports.saveVendorFeedBack = async (req, res) => {
    try {
        const {status, userid, vendor, text, trans} = req.body
        const feeds = {user_id: userid, vendor, text, status}
        await Vendorfeedback.create(feeds)

        const transfer = await Vendortransfer.findByPk(trans)

        const newhistory = {user_id: transfer.user_id, vendor: transfer.vendor, amount: transfer.amount, fee: transfer.fee, suspend: transfer.suspend, proof: transfer.proof, payer_name: transfer.payer_name, pay_method: transfer.pay_method, paid: transfer.paid, user_wallet: transfer.user_wallet, vendor_wallet: transfer.vendor_wallet, status: 'completed'}
        await Vendorhistory.create(newhistory)

        await Vendortransfer.destroy({
            where: { user_id: userid, vendor: vendor }, force: true
        })

        res.json({status: 200, msg: `Feedback Successfully saved, thank you for your feedback`})
    } catch (error) {
        res.json({status: 400, msg: `Error ${error}`});
    }
}

exports.allVendorsFeedbacks = async (req, res) => {
    try {
        const {rows, count} = await Vendorfeedback.findAndCountAll({
            where: {vendor: req.params.vendor},
            include: [{model: User, as: 'user'}],
            order: [['createdAt', 'DESC']]
        })
        const good = await Vendorfeedback.findAll({
            where: {vendor: req.params.vendor, status: 'good'}
        })
        const bad = await Vendorfeedback.findAll({
            where: {vendor: req.params.vendor, status: 'bad'}
        })

        res.json({status: 200, msg: rows, count, good: good.length, bad: bad.length})
    } catch (error) {
        res.json({status: 400, msg: `Error ${error}`})
    }
}

exports.userDeclinesProposalAccepted = async (req, res) => {
    try {
        const {transact_id} = req.params
        const transfer = await Vendortransfer.findOne({where: {id: transact_id}})
        const vendor = await Vendor.findByPk(transfer.vendor)
        const vendorwallet = await Wallet.findOne({where: {user_id: vendor.user_id}})
        const vendoradmin = await Adminwallet.findByPk(vendorwallet.adminwallet_id)

        const topup = transfer.suspend * vendoradmin.current_price
        vendorwallet.crypto += topup
        await vendorwallet.save()
        
        const newhistory = {user_id: transfer.user_id, vendor: transfer.vendor, amount: transfer.amount, fee: transfer.fee, user_wallet: transfer.user_wallet, status: 'declined by client'}
        await Vendorhistory.create(newhistory)

        await Vendortransfer.destroy({where: {id: transact_id}, force: true})
        res.json({status: 200, msg: `Transaction withdrawn successfully!...`})
    } catch (error) {
        res.json({status: 400, msg: `Error ${error}`})
    }
}

exports.vendorRejectsPayment = async (req, res) => {
    try {
        const {reason} = req.body
        const transfer = await Vendortransfer.findByPk(req.params.transact_id)
        transfer.status = 'under review'
        transfer.reason = reason
        await transfer.save()

        res.json({status: 200, msg: `request submitted, awaiting response`})
    } catch (error) {
        res.json({status: 400, msg: `Error ${error}`})
    }
}

exports.userReportingTransaction = async (req, res) => {
    try {
        const {reason} = req.body
        const transfer = await Vendortransfer.findByPk(req.params.transact_id)
        transfer.status = 'under review'
        transfer.reason = reason
        await transfer.save()

        res.json({status: 200, msg: `report submitted, awaiting response`})
    } catch (error) {
        res.json({status: 400, msg: `Error ${error}`})
    }
}

exports.getAllVendorTransactions = async (req, res) => {
    try {
        const {userid} = req.params 
        const vendor = await Vendor.findOne({where: {user_id: userid}})
        const items = await Vendorhistory.findAll({
            where: {vendor: vendor.id},
            include: [{model: User, as: 'user'}],
            order: [['createdAt', 'DESC']]
        })
        const feeds = await Vendorfeedback.findAll({
            where: {vendor: vendor.id},
            include: [{model: User, as: 'user'}],
            order: [['createdAt', 'DESC']]
        })
        
        res.json({status: 200, msg: items, feeds})
    } catch (error) {
        res.json({status: 400, msg: `Error ${error}`})
    }
}

exports.adminAllProposals = async (req, res) => {
    try {
        const items = await Vendortransfer.findAll({
            include: [{model: User, as: 'user'}],
            order: [['createdAt', 'DESC']]
        })

        res.json({status: 200, msg: items})
    } catch (error) {
        res.json({status: 400, msg: error})
    }
}