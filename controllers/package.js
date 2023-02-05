const Adminwallet = require('../models').adminwallets
const Package = require('../models').packages
const Wallet = require('../models').wallets
const User = require('../models').users
const Mine = require('../models').mines
const Withdrawal = require('../models').withdrawals
const Transaction = require('../models').transactions
const moment = require('moment')
const Market = require('../models').markets
const Packagemined = require('../models').packagemineds
const Airdrop = require('../models').airdrops




exports.addPackage = async (req, res) => {
    const { name, amount, bonus, duration, topup, commission } = req.body;
    try {
        const newpack = { name, amount, bonus, duration, topup, refcom: commission };
        await Package.create(newpack);
        res.json({ status: 200, msg: `Package Created Successfully` })
    } catch (error) {
        return res.json({ status: 400, msg: `Error Occured ${error}` })
    }
}
exports.getpackages = async (req, res) => {
    try {
        const items = await Package.findAll({});
        res.json({ status: 200, msg: items })
    } catch (error) {
        return res.json({ status: 404, msg: `Error ${error}` })
    }
}

exports.getPackage = async (req, res) => {
    try {
        const item = await Package.findByPk(req.params.id)
        res.json({ status: 200, msg: item })
    } catch (error) {
        return res.json({ status: 404, msg: `Error ${error}` })
    }
}
exports.updatePackage = async (req, res) => {
    try {
        const findpack = await Package.findByPk(req.params.id)
        findpack.name = req.body.name
        findpack.amount = req.body.amount
        findpack.bonus = req.body.bonus
        findpack.duration = req.body.duration
        findpack.topup = req.body.topup
        findpack.refcom = req.body.commission
        await findpack.save()
        res.json({ status: 200, msg: `Package Updated Successfully` })
    } catch (error) {
        return res.json({ status: 400, msg: `Error ${error}` })
    }
}

exports.deletePackage = async (req, res) => {
    try {
        await Package.destroy({ where: { id: req.params.id } })
        res.json({ status: 200, msg: `Package Deleted Successfully` })
    } catch (error) {
        return res.json({ status: 404, msg: `Error ${error}` })
    }
}

exports.checkoutPackage = async (req, res) => {
    try {
        const { walletid, packid } = req.params;
        const wallet = await Wallet.findByPk(walletid)
        const admin = await Adminwallet.findByPk(wallet.adminwallet_id)
        const pack = await Package.findByPk(packid)
        const user = await User.findByPk(wallet.user_id)
        const mine = await Mine.findOne({ where: { user_id: user.id } })

        // lets prevent user from purchasing a package twice in a row
        const { rows } = await Packagemined.findAndCountAll({
            where: { user_id: user.id },
            order: [['createdAt', 'DESC']],
            limit: 2
        })
        let output = [], valoutput
        // check if the last three packages mined by the user are the same packages
        rows.map((item) => (
            output = [...output, item.packid]
        ))
        // function allequals(array) {
        //     const result = array.every(ele => {
        //         if(ele === array[0]) {
        //             return true
        //         }
        //     })
        //     return result;
        // }
        // valoutput = allequals(output)
        if (output[0] === parseInt(pack.id) && output[1] === parseInt(pack.id)) {
            return res.json({ status: 400, msg: `Cannot purchase ${pack.name} twice in a roll, kinldy purchase another package.` })
        }

        // verify if user balance can purchase a package
        const checkover = wallet.crypto / admin.current_price;
        if (pack.amount > checkover) {
            return res.json({ status: 400, msg: `Error purchasing package: insufficient balance` })
        }

        if (mine.status !== 'pending') {
            return res.json({ status: 400, msg: `You have an active mining in progress!...` })
        }
        //debitting the user wallet
        const calcspend = checkover - pack.amount
        const calremains = calcspend * admin.current_price;
        wallet.crypto = calremains;
        await wallet.save()

        // if the diff in hour or day is greater then the fund date i.e when to topup
        // const stopdate = moment().add(pack.duration, 'minutes')
        const stopdate = moment().add(pack.duration, 'days')

        const date = new Date
        const currentdate = date
        mine.start_date = date
        mine.stop_date = stopdate
        mine.current_date = currentdate
        mine.topup = pack.bonus
        mine.wallet = wallet.id
        mine.balance = pack.bonus;
        mine.fund_date = pack.topup
        mine.status = 'active'
        mine.packid = pack.id
        mine.minetimes += 1
        await mine.save()

        // add up the first topup bonus once package is purchased
        const addup = (wallet.crypto / admin.current_price) + pack.bonus
        const convs = addup * admin.current_price

        wallet.crypto = convs
        await wallet.save()
        // saving withdrawal for admin purpose
        const message = `Withdrew the sum of $${pack.amount} to purchase ${pack.name}`
        const newwithdrawal = { user_id: user.id, title: 'withdrawal', message, amount: pack.amount, status: 'funded package', wallet: wallet.id }
        await Withdrawal.create(newwithdrawal)

        const newtran = { amount: pack.amount, title: 'withdrawal', user_id: user.id, tag: 'funded package', message, tag_id: newwithdrawal.id }

        await Transaction.create(newtran)

        const newmark = { user_id: user.id, amount: mine.topup, title: 'Earned from mining' }
        await Market.create(newmark)

        // adding the total withdrawal of the user
        user.total_with += pack.amount
        await user.save()

        // adding the mining id to the wallet
        wallet.mineid = mine.id
        await wallet.save()

        // check if there is an airdrop
        const airdrop = await Airdrop.findOne({ where: { adminwallet_id: admin.id } })
        // if(airdrop) {
        //     wallet.lockedbal -= addper
        //     const addtocryp = addper * admin.current_price 
        //     wallet.crypto += addtocryp
        //     await wallet.save()

        //     const newmark2 = { user_id: user.id, amount: addper, title: 'Earned from Airdrop' }
        //     await Market.create(newmark2)
        // }

        // checking if user has an upliner
        if (user.external_ref !== '') {
            const upline = await User.findOne({ where: { myref_id: user.external_ref } })
            // add airdrop bonus to the person that referred me if he/she has added the airdrop wallet
            if (airdrop && moment() <= airdrop.stopd) {
                const refairdropwallet = await Wallet.findOne({ where: { user_id: upline.id, airdrop_id: airdrop.id } })
                const getpercent = pack.amount * airdrop.percent - pack.amount
                if (refairdropwallet) {
                    // checking if the lockedbal is greater than the prcentage to recieve
                    if(refairdropwallet.lockedbal >= getpercent) {
                        const newbal = refairdropwallet.lockedbal - getpercent
                        // minus from the lockedbal
                        refairdropwallet.lockedbal = newbal 
                        // add to the aval bal
                        const addupfund = getpercent * admin.current_price
                        refairdropwallet.crypto += addupfund
                        await refairdropwallet.save()
                    }else {
                        refairdropwallet.lockedbal = 0
                        const calbal = getpercent * admin.current_price
                        refairdropwallet.crypto += calbal 
                        await refairdropwallet.save()
                    }
                }
            }
            if(!airdrop) {
                const addref = pack.amount * pack.refcom - pack.amount
                upline.bonus += addref
                upline.total_bonus += addref
                await upline.save()
    
                const uplinemarket = { user_id: upline.id, amount: addref, title: 'Earned from referral' }
                await Market.create(uplinemarket)    
            }
        }

        // checking if all the users i referred are currently mining if yes then add the airdrop bonus

        res.json({ status: 200, msg: `Congratulations!, Package Sucessfully purchased!...` })
    } catch (error) {
        return res.json({ status: 400, msg: `Error ${error}` })
    }
}

exports.getMiningDetails = async (req, res) => {
    try {
        const mine = await Mine.findOne({
            include: [{ model: Package, as: 'package' }],
            where: { user_id: req.params.userid }
        })
        // const mine = await Mine.findOne({user_id: req.params.userid}).populate('packid')
        if (mine.status === 'pending') {
            return res.json({ status: 200, msg: mine })
        }
        const wallet = await Wallet.findOne({
            include: [{ model: Adminwallet, as: 'adminwallet' }],
            where: { id: mine.wallet }
        })
        // const wallet = await Wallet.findByPk({_id: mine.wallet}).populate('adminwallet_id')
        res.json({ status: 200, msg: mine, wallet })
    } catch (error) {
        return res.json({ status: 400, msg: `Error ${error}` })
    }
}

exports.addFunds = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.userid)
        const mine = await Mine.findOne({ where: { user_id: req.params.userid } })
        const wallet = await Wallet.findByPk(mine.wallet)
        const admin = await Adminwallet.findByPk(wallet.adminwallet_id)
        const pack = await Package.findByPk(mine.packid)
        const { rows, count } = await Packagemined.findAndCountAll({
            where: { user_id: user.id },
            order: [['createdAt', 'DESC']],
            limit: 2
        })

        var starter = 'mining in progress!...'
        var exact = '', nextpack = ''
        // if the diff in hour or day is greater then the fund date i.e when to topup
        var diffInTime;
        diffInTime = moment.duration(moment().diff(moment(mine.current_date))).asHours()
        // diffInTime = moment.duration(moment().diff(moment(mine.current_date))).asSeconds()
        let output = [], valoutput
        rows.map((item) => (
            output = [...output, item.pack_id]
        ))
        function allequals(array) {
            const result = array.every(ele => {
                if (ele === array[0]) {
                    return true
                }
            })
            return result;
        }
        valoutput = allequals(output)

        // what if the mining has exceeded stop date
        if (moment() > mine.stop_date) {

            const stopdate = moment().add(pack.duration, 'minutes')
            const date = new Date
            const packmined = { user_id: user.id, start_date: date, stop_date: stopdate, topup: pack.bonus, wallet: wallet.id, balance: mine.balance, fund_date: pack.topup, status: 'completed', packid: pack.id }
            const minedchecked = await Packagemined.create(packmined)

            // const stopdate = moment().add(pack.duration, 'days')
            if (minedchecked) {
                mine.start_date = null
                mine.stop_date = null
                mine.current_date = null
                mine.topup = null
                mine.wallet = null
                mine.balance = null
                mine.fund_date = null
                mine.status = 'pending'
                mine.packid = null
                mine.minetimes += 1
                await mine.save()
            }

        } else {
            if (diffInTime > mine.fund_date) {
                //========================= add topup to mine balance
                // const addbal = mine.balance + mine.topup
                mine.balance += mine.topup;
                mine.current_date = new Date
                await mine.save()
                exact = 'date started again'
                // after mining add the mining balance to the user wallet
                const addup = mine.topup * admin.current_price
                const sum = parseFloat(wallet.crypto) + addup
                wallet.crypto = sum
                await wallet.save()

                const newmark = { user_id: user.id, amount: mine.topup, title: 'Earned from mining' }
                await Market.create(newmark)
            } else {
                exact = 'date is lesser'
                nextpack = mine.fund_date - diffInTime;
            }
        }

        var minestat;
        if (mine.status === 'active') {
            minestat = nextpack
        } else {
            minestat = ''
        }

        const diffInDays = moment.duration(moment().diff(moment(mine.current_date))).hours()
        // const diffInDays = moment.duration(moment().diff(moment(mine.current_date))).minutes()
        const details = {
            diff: diffInTime,
            current: mine.current_date,
            status: mine.status,
            stopdate: mine.stop_date,
            stopdater: diffInDays,
            checks: mine.fund_date,
            checers: diffInTime > mine.fund_date,
            exact,
            addfund: mine.balance,
            starter,
            remaining_time: minestat,
            user_wallet_balance: wallet.crypto / admin.current_price,
            crypto: wallet.crypto,
            wallet: admin.name,
            short: admin.short
        }

        res.json({ status: 200, msg: details, outs: output.length, count })
    } catch (error) {
        return res.json({ status: 400, msg: `Error ${error}` })
    }
}

exports.allMinedPlans = async (req, res) => {
    try {
        const { rows, count } = await Packagemined.findAndCountAll({
            where: { user_id: req.params.userid },
            include: [{ model: Package, as: 'package' }],
            order: [['createdAt', 'DESC']]
        })

        res.json({ status: 200, msg: rows, count })
    } catch (error) {
        res.json({ status: 400, msg: `Error ${error}` })
    }
}

exports.allUserEarnings = async (req, res) => {
    try {
        const {rows, count} = await Market.findAndCountAll({
            where: {user_id: req.params.userid},
            order: [['createdAt', 'DESC']]
        })
        const wallets = await Wallet.findAll({
            where: {user_id: req.params.userid},
            include: [{model: Adminwallet, as: 'adminwallet'}]
        })
        let output = 0;
        rows.map((item) => (
            output += item.amount
        ))

        let outs = 0;
        wallets.map((item) => (
            outs += item.crypto / item.adminwallet.current_price
        ))
        res.json({status: 200, msg: rows, count, output, outs})
    } catch (error) {
        res.json({status: 400, msg: `Error ${error}`})
    }
}