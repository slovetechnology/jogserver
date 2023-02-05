const Deposit = require('../models').deposits
const Transaction = require('../models').transactions
const User = require('../models').users
const Wallet = require('../models').wallets
const Adminwallet = require('../models').adminwallets
const fs = require('fs')



exports.allDeposits = async (req, res) => {
    try {
        const {rows, count} = await Deposit.findAndCountAll({
            order: [[ 'createdAt', 'DESC' ]],
        })
        res.json({ status: 200, msg: rows, count })
    } catch (error) {
        return res.json({ status: 404, msg: `Error not found ${error}` })
    }
}

exports.saveNewDeposit = async (req, res) => {
    const { amount, wallet } = req.body;
    try {
        const mywallet = await Wallet.findByPk(wallet)
        const admin = await Adminwallet.findByPk(mywallet.adminwallet_id)
        const file = req.files.image;
        if (!file.mimetype.startsWith('image/')) {
            return res.json({ status: 400, msg: 'Screenshot must be a valid image format' })
        }
        const d = new Date()
        const filename = `${d.getTime()}.png`
        file.mv(`./public/deposits/${filename}`, (err) => {
            if (err) {
                return res.json({ status: 400, msg: `Error upload screenshot` })
            }
        })
        const message = `Deposited $${amount} to fund ${admin.name} wallet`
        const newdept = { amount, wallet: mywallet.id, image: filename, title: 'deposit', user_id: req.params.userid, status: 'pending', message }
        const dept = await Deposit.create(newdept)


        const newtran = { amount, title: 'deposit', user_id: req.params.userid, tag: 'pending', message, tag_id: dept.id }
        await Transaction.create(newtran)
        res.json({ status: 200, msg: 'Deposit Successfully saved, awaiting approval' })
    } catch (error) {
        return res.json({ status: 400, msg: `Error ${error}` })
    }
}

exports.myTransactions = async (req, res) => {
    try {
        const {rows, count} = await Transaction.findAndCountAll({ 
            where: { user_id: req.params.userid }, 
            order: [['id', 'DESC']],
         })
        res.json({ status: 200, msg: rows, count })
    } catch (error) {
        return res.json({ status: 404, msg: `Not Found ${error}` })
    }
}

exports.singleDeposit = async (req, res) => {
    try {
        const data = await Deposit.findOne({
            include: [{ model: User, as: 'user' }],
            where: { id: req.params.id }
        })
        res.json({ status: 200, msg: data })
    } catch (error) {
        return res.json({ status: 404, msg: `Error ${error}` })
    }
}

exports.declineDeposit = async (req, res) => {
    try {
        const dept = await Deposit.findByPk(req.params.id)
        const user = await User.findByPk(dept.user_id)
        const trans = await Transaction.findOne({ where: { tag_id: dept.id, user_id: user.id } })

        dept.status = 'declined';
        const imgpath = `./public/deposits/${dept.image}`
        if (fs.existsSync(imgpath)) {
            fs.unlinkSync(imgpath)
        }

        // affecting the transaction attached to deposit
        trans.tag = 'declined';

        await dept.save()
        await trans.save()

        res.json({ status: 200, msg: `Deposit has been declined` })
    } catch (error) {
        return res.json({ status: 404, msg: `Error not found ${error}` })
    }
}

exports.confirmDeposit = async (req, res) => {
    try {
        const dept = await Deposit.findByPk(req.params.id)
        const user = await User.findByPk(dept.user_id)
        const trans = await Transaction.findOne({ where: { tag_id: dept.id, user_id: user.id } })
        const wallet = await Wallet.findByPk(dept.wallet)
        const admin = await Adminwallet.findByPk(wallet.adminwallet_id)

        if (dept.status === 'confirmed') {
            return res.json({ status: 400, msg: `Deposit has already been confirmed` })
        }

        dept.status = 'confirmed';
        const imgpath = `./public/deposits/${dept.image}`
        if (fs.existsSync(imgpath)) {
            fs.unlinkSync(imgpath)
        }
        // affecting the transaction attached to deposit
        trans.tag = 'confirmed';

        // updating the user total deposit
        user.total_dept += dept.amount

        // getting the wallet the user funded for and updating it
        const crypto = parseFloat(admin.current_price) * parseFloat(dept.amount)
        wallet.crypto += crypto

        await dept.save()
        await trans.save()
        await wallet.save()
        await user.save()

        res.json({ status: 200, msg: `Deposit Successfully Confirmed` })
    } catch (error) {
        return res.json({ staus: 404, msg: `Error not found ${error}` })
    }
}
exports.dashboardDeposit = async (req, res) => {
    try {
        const depts = await Deposit.findAll({ where: { user_id: req.params.userid }, limit: 1, order: [['id', 'DESC']] })
        // const depts = await Deposit.find({user_id: ObjectId(req.params.userid)}).limit(1).sort({createdAt: -1})
        res.json({ status: 200, msg: depts })
    } catch (error) {
        return res.json({ status: 404, msg: `Error ${error}` })
    }
}