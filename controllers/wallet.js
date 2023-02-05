const Wallet = require('../models').wallets
const bcrypt = require('bcrypt');
const Adminwallet = require('../models').adminwallets
const Airdrop = require('../models').airdrops
const User = require('../models').users
const moment = require('moment')

exports.addWallet = async (req, res) => {
    try {
        const { user_id, adminwallet } = req.body;
        const checkwallet = await Wallet.findOne({ where: { user_id: user_id, adminwallet_id: adminwallet } })
        if (checkwallet) {
            return res.json({ status: 400, msg: `Wallet Already exists` })
        }
        const admin = await Adminwallet.findByPk(adminwallet)
        const gensalt = await bcrypt.genSalt(15)
        const secads = await bcrypt.hash(admin.name, gensalt)

        // check for airdrop
        const airs = await Airdrop.findOne({ where: { adminwallet_id: admin.id } })
        const user = await User.findByPk(user_id)

        const newwallet = { user_id, adminwallet_id: adminwallet, status: 'active', balance: '0.00', crypto: '0', ads: secads}
        const walletnew = await Wallet.create(newwallet);

        if (airs && moment() <= airs.stopd) {
            walletnew.airdrop_id = airs.id 
            walletnew.lockedbal = airs.refcom 
            await walletnew.save()

            // lets add locked balance to the user's upliner if there is
            const myreferal = await User.findOne({ where: { myref_id: user.external_ref } })
            if (myreferal) {
                const refwallet = await Wallet.findOne({ where: { user_id: myreferal.id, adminwallet_id: adminwallet } })
                if (refwallet) {
                    refwallet.lockedbal += airs.refcom
                    await refwallet.save()

                    walletnew.airref = 'true' 
                    await walletnew.save()

                }
            }

            // let add locked bal if user has an downliner(s)

            const { rows, count } = await User.findAndCountAll({ where: { external_ref: user.myref_id } })
            if(rows) {
                if (count > 0) {
                    rows.map(async(item) => {
                        const fetchwalls = await Wallet.findOne({where: {user_id: item.id, adminwallet_id: airs.adminwallet_id, airref: 'false'}})
                        if(fetchwalls) {
                            walletnew.lockedbal += airs.refcom
                            await walletnew.save()
                        }
                    })

                    rows.map(async(item) => {
                        const fetched = await Wallet.findOne({where: {user_id: item.id, adminwallet_id: airs.adminwallet_id, airref: 'false'}})
                        if(fetched) {
                            fetched.airref = 'true' 
                            await fetched.save()
                        }
                    })

                }
            }
        }
        res.json({ status: 200, msg: `Wallet Successfully Added` })
    } catch (error) {
        return res.json({ status: 400, msg: `Error ${error}` })
    }
}

exports.getMyWallets = async (req, res) => {
    const wallets = await Wallet.findOne({ where: { user_id: req.params.userid, adminwallet_id: req.params.adminwalletid } })
    let isthere;
    if (wallets) {
        isthere = 'yes'
    } else {
        isthere = 'no'
    }
    res.json({ status: 200, msg: isthere })
}

exports.allMywallets = async (req, res) => {
    try {
        // const wallet = await Wallet.findOne({where: {user_id: req.params.userid}})
        const wallet = await Wallet.findAll({
            include: [{ model: Adminwallet, as: 'adminwallet' }],
            where: { user_id: req.params.userid }
        })
        res.json({ status: 200, msg: wallet })
    } catch (error) {
        return res.json({ status: 404, msg: `Error ${error}` })
    }
}

exports.getSingleWallet = async (req, res) => {
    try {
        // const wallet = await Wallet.findById(req.params.id).populate('adminwallet_id')
        const wallet = await Wallet.findOne({
            include: [{ model: Adminwallet, as: 'adminwallet' }],
            where: { id: req.params.id }
        })
        res.json({ status: 200, msg: wallet })
    } catch (error) {
        return res.json({ status: 404, msg: `Not Found ${error}` })
    }
}

exports.offWallet = async (req, res) => {
    try {
        const wallet = await Wallet.findByPk(req.params.id)
        wallet.status = 'freeze'
        await wallet.save()

        res.json({ status: 200, msg: wallet })
    } catch (error) {
        res.json({ status: 400, msg: `Error ${error}` })
    }
}
exports.onWallet = async (req, res) => {
    try {
        const wallet = await Wallet.findByPk(req.params.id)
        wallet.status = 'active'
        await wallet.save()

        res.json({ status: 200, msg: wallet })
    } catch (error) {
        res.json({ status: 400, msg: `Error ${error}` })
    }
}