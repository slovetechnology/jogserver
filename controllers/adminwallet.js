const Adminwallet = require('../models').adminwallets
const Airdrop = require('../models').airdrops
const fs = require('fs')

exports.saveWallet = async (req, res) => {
    try {
        const { name, short, price, current_price, min_with, max_with, percent, swapfee, bonusfee, withfee, p2pfee, address } = req.body;
        const checkwall = await Adminwallet.findOne({ where: { name: name } })
        if (checkwall) {
            return res.json({ status: 400, msg: `Wallet Already exists!..` })
        }

        var imgcont, qrcont;
        if (req.files.image) {
            const img = req.files.image;
            const imgname = `${name}.png`;
            imgcont = imgname
            img.mv(`./public/wallets/${imgname}`, (err) => {
                if (!err) {
                }
            })
        }
        if (req.files.qrcode) {
            const img = req.files.qrcode;
            const imgname = `${name}.png`;
            qrcont = imgname
            img.mv(`./public/qrcodes/${imgname}`, (err) => {
                if (!err) {
                }
            })
        }
        const newwallet = { name, short, image: imgcont, qrcode: qrcont, min_with, max_with, percent, swapfee, bonusfee, withfee, current_price, ads: address, p2pfee, price }
        await Adminwallet.create(newwallet);
        res.json({ status: 200, msg: `Wallet Successfully saved` })
    } catch (error) {
        return res.json({ status: 400, msg: `Error ${error}` })
    }
}
exports.updateWallet = async (req, res) => {
    try {
        const { name, short, price, current_price, min_with, max_with, percent, swapfee, bonusfee, withfee, p2pfee, address } = req.body;

        const wallet = await Adminwallet.findOne({ where: { id: req.params.id } })

        const imagefile = req?.files?.image && req.files.image

        const imgname = `${name}.png`;
        const imgpath = `./public/wallets/${wallet.image}`
        const newimgpath = `./public/wallets/${imgname}`

        if (imagefile) {
            const imgpath = `./public/wallets/${wallet.image}`
            if (fs.existsSync(imgpath)) {
                fs.unlinkSync(imgpath);
            }
            imagefile.mv(`./public/wallets/${imgname}`, (err) => {
                if (err) {
                    return res.json({ status: 400, msg: `Error ${err}` })
                }
            })
        } else {
            fs.renameSync(imgpath, newimgpath)
        }

        const qrfile = req?.files?.qrcode && req.files.qrcode

        const qrpath = `./public/qrcodes/${wallet.qrcode}`
        const newqrpath = `./public/qrcodes/${imgname}`
        if (qrfile) {
            const imgpath = `./public/qrcodes/${wallet.qrcode}`
            if (fs.existsSync(imgpath)) {
                fs.unlinkSync(imgpath)
            }
            qrfile.mv(`./public/qrcodes/${imgname}`, (err) => {
                if (err) {
                    return res.json({ status: 400, msg: `Error ${err}` })
                }
            })
        } else {
            fs.renameSync(qrpath, newqrpath)
        }

        wallet.name = name;
        wallet.short = short;
        wallet.image = imgname;
        wallet.qrcode = imgname;
        wallet.min_with = min_with;
        wallet.max_with = max_with;
        wallet.percent = percent;
        wallet.swapfee = swapfee;
        wallet.bonusfee = bonusfee;
        wallet.withfee = withfee;
        wallet.current_price = current_price;
        wallet.ads = address;
        wallet.p2pfee = p2pfee;
        wallet.price = price;
        await wallet.save();
        res.json({ status: 200, msg: `Wallet Successfully updated` })
    } catch (error) {
        return res.json({ status: 400, msg: `Error ${error}` })
    }
}
exports.getAdminwallet = async (req, res) => {
    try {
        const wallets = await Adminwallet.findAll({});
        res.json({ status: 200, msg: wallets })
    } catch (error) {
        return res.json({ status: 404, msg: `Wallet Not found` })
    }
}

exports.getSingleWallet = async (req, res) => {
    try {
        const data = await Adminwallet.findByPk(req.params.id)
        res.json({ status: 200, msg: data })
    } catch (error) {
        return res.json({ status: 404, msg: `Wallet Not Found` })
    }
}

exports.addAirdrop = async (req, res) => {
    try {
        const { stop_date, start_date, percent, wallet, refcom } = req.body
        const admin = await Adminwallet.findByPk(wallet)
        const findairdrop = await Airdrop.findOne({ where: { adminwallet_id: wallet } })
        if (findairdrop) {
            return res.json({ status: 400, msg: `An Airdrop has already been attached to this wallet` })
        }

        const newairdrop = { stopd: stop_date, startd: start_date, percent, adminwallet_id: wallet, refcom }
        await Airdrop.create(newairdrop)
        res.json({ status: 200, msg: `Airdrop successfullu attached to ${admin.name} wallet` })
    } catch (error) {
        return res.json({ status: 400, msg: error })
    }
}

exports.getAllAirdrop = async (req, res) => {
    try {
        const items = await Airdrop.findAll({
            include: [{ model: Adminwallet, as: 'adminwallet' }],
            order: [['createdAt', 'DESC']]
        })
        res.json({ status: 200, msg: items })
    } catch (error) {
        return res.json({ status: 400, msg: error })
    }
}

exports.getSingleAirdrop = async (req, res) => {
    try {
        const item = await Airdrop.findOne({
            include: [{ model: Adminwallet, as: 'adminwallet' }],
            where: { id: req.params.id }
        })
        res.json({ status: 200, msg: item })
    } catch (error) {
        return res.json({ status: 400, msg: error })
    }
}

exports.updateAirdrop = async (req, res) => {
    try {
        const { stop_date, start_date, percent, refcom } = req.body
        const item = await Airdrop.findByPk(req.params.id)
        item.stopd = stop_date
        item.startd = start_date
        item.percent = percent
        item.refcom = refcom

        await item.save()
        res.json({ status: 200, msg: `Airdrop updated Successfully!..` })
    } catch (error) {
        return res.json({ status: 400, msg: error })
    }
}

exports.deleteAirdrop = async (req, res) => {
    try {
        const item = await Airdrop.findOne({ where: { id: req.params.id } })
        await item.destroy()
        res.json({ status: 200, msg: 'Airdrop Successfully terminated!...' })
    } catch (error) {
        return res.json({ status: 400, msg: error })
    }
}