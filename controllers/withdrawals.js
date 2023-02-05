const Withdrawal = require('../models').withdrawals
const Transaction = require('../models').transactions
const User = require('../models').users
const Wallet = require('../models').wallets
const Adminwallet = require('../models').adminwallets
const bcrypt = require('bcrypt')
const Bankdetail = require('../models').bank_details
const Deposit = require('../models').deposits
const Feecharge = require('../models').feecharges


exports.allWithdrawals = async (req, res) => {
    try {
        const {rows, count} = await Withdrawal.findAndCountAll({
            order: [[ 'createdAt', 'DESC' ]],
        })
        res.json({ status: 200, msg: rows, count })
    } catch (error) {
        return res.json({ status: 404, msg: `Error not found ${error}` })
    }
}

exports.singleWithdrawal = async (req, res) => {
    try {
        const data = await Withdrawal.findOne({
            include: [{model: User, as: 'user'}],
            where: {id: req.params.id}
        })
        res.json({ status: 200, msg: data })
    } catch (error) {
        return res.json({ status: 404, msg: `Error ${error}` })
    }
}

exports.declineWithdrawal = async (req, res) => {
    try {
        const withd = await Withdrawal.findByPk(req.params.id)
        const user = await User.findByPk(withd.user_id)
        const trans = await Transaction.findOne({where: { tag_id: withd.id, user_id: user.id }})
        const wallet = await Wallet.findByPk(withd.wallet)
        const admin = await Adminwallet.findByPk(wallet.adminwallet_id)

        // upon declined all money withdrawn should bounce back
        // lets debit the user wallet
        const caluserwallet = wallet.crypto / admin.current_price; //gets the dollar value
        const getcurrentwallet = caluserwallet + withd.amount; //minus the dollar value against the with amount
        wallet.crypto = getcurrentwallet * admin.current_price //sets the new crypto balance
        await wallet.save()
        // adding the withdrawal to user's total withdrawal
        user.total_with -= withd.amount;
        await user.save()

        withd.status = 'declined';
        // affecting the transaction attached to deposit 
        if(trans) {
            trans.tag = 'declined'
            await trans.save()
        }

        await withd.save()

        res.json({ status: 200, msg: `Withdrawal has been declined` })
    } catch (error) {
        return res.json({ status: 404, msg: `Error not found ${error}` })
    }
}

exports.confirmWithdrawal = async (req, res) => {
    try {
        const withd = await Withdrawal.findByPk(req.params.id)
        const user = await User.findByPk(withd.user_id)
        const trans = await Transaction.findOne({where: { tag_id: withd.id, user_id: user.id }})

        withd.status = 'confirmed';
        // affecting the transaction attached to deposit
        if(trans?.tag) {
            trans.tag = 'confirmed';
            await trans.save()
        }

        await withd.save()

        res.json({ status: 200, msg: `Withdrawal has been confirmed` })
    } catch (error) {
        return res.json({ status: 404, msg: `Error not found ${error}` })
    }
}

exports.saveBankdetails = async (req, res) => {
    const { bankname, account_number, account_holder, password } = req.body;
    try {
        const userid = req.params.userid;
        const user = await User.findByPk(userid)
        const checkpassword = await bcrypt.compare(password, user.password)
        if (!checkpassword) {
            return res.json({ status: 400, msg: 'Password not recognised, enter a correct password' })
        }
        // check if user already has details if yes then update else create new save
        const checkbank = await Bankdetail.findOne({where: { user_id: userid }})
        if (checkbank) {
            checkbank.aholder = account_holder
            checkbank.anumber = account_number
            checkbank.bankname = bankname
            await checkbank.save()
            return res.json({ status: 200, msg: `Bank details successfully updated` })
        }
        const newdetail ={ aholder: account_holder, anumber: account_number, bankname: bankname, user_id: userid }
        await Bankdetail.create(newdetail)
        res.json({ status: 200, msg: `Bank detail successfully saved` })
    } catch (error) {
        return res.json({ status: 400, msg: `Error ${error}` })
    }
}

exports.getBankdetails = async (req, res) => {
    try {
        const bank = await Bankdetail.findOne({where: { user_id: req.params.userid }})
        res.json({ status: 200, msg: bank })
    } catch (error) {
        return res.json({ status: 404, msg: `Not Found ${error}` })
    }
}

exports.saveNewWithdrawal = async (req, res) => {
    try {
        const { account_number, account_holder, bankname, amount } = req.body;
        const { userid, walletid } = req.params

        const wallet = await Wallet.findByPk(walletid)
        const admin = await Adminwallet.findByPk(wallet.adminwallet_id)
        const user = await User.findByPk(userid)
        // checking if the amount is less than the current min withdrawal of the wallet
        if (amount < admin.min_with) {
            return res.json({ status: 400, msg: `Withdrawal amount should be greater than $${admin.min_with}` })
        }
        // checking if the withdrawal is greater than tha balance
        const checkwith = amount
        const checkover = wallet.crypto / admin.current_price
        if (checkwith >= checkover) {
            return res.json({ status: 400, msg: `Insufficient Balance!...` })
        }
        // checking if the withdrawal amount is greater than the current max withdrawal percent of the wallet
        const calpercent = checkover * admin.max_with - checkover;
        const getpercent = amount - (amount / admin.max_with)
        if (amount >= calpercent) {
            return res.json({ status: 400, msg: `Cannot withdraw above ${admin.max_with * 100 - 100}% of available balance from your ${admin.name} wallet` })
        }

        // lets debit the user wallet
        const caluserwallet = wallet.crypto / admin.current_price; //gets the dollar value
        const getcurrentwallet = caluserwallet - amount; //minus the dollar value against the with amount
        wallet.crypto = getcurrentwallet * admin.current_price //sets the new crypto balance
        await wallet.save()
        // adding the withdrawal to user's total withdrawal
        user.total_with += parseFloat(amount);
        await user.save()

        // saving withdrawal for admin purpose
        const message = `Requested to withdraw $${amount / admin.withfee} from ${admin.name} wallet to credit bank account (account name: ${account_holder}, account number: ${account_number}, Bank: ${bankname})`
        const newwithdrawal = { user_id: userid, title: 'bank withdrawal', message, amount, status: 'pending', wallet: walletid }
        await Withdrawal.create(newwithdrawal)

        const newtran = { amount, title: 'bank withdrawal', user_id: userid, tag: 'pending', message, tag_id: newwithdrawal.id }

        await Transaction.create(newtran)
        
        // record fee
        const rec = amount - amount / admin.withfee
        const newrecord = {title: 'fee from bank withdrawal', amount: rec}
        await Feecharge.create(newrecord)
        res.json({ status: 200, msg: `Withdrawal Successfully submitted, awaiting approval` })
    } catch (error) {
        return res.json({ status: 400, msg: `Error ${error}` })
    }
}

exports.saveCryptoWithdrawal = async (req, res) => {
    try {
        const { amount, address, password } = req.body;
        const { userid, walletid } = req.params

        const wallet = await Wallet.findByPk(walletid)
        const admin = await Adminwallet.findByPk(wallet.adminwallet_id)
        const user = await User.findByPk(userid)

        // verifying the password
        const checkpswd = await bcrypt.compare(password, user.password);
        if (!checkpswd) {
            return res.json({ status: 400, msg: `Password validation failed, provide a correct password` })
        }
        if (!address) {
            return res.json({ status: 404, msg: `Wallet Address not specified` })
        }
        // checking if the amount is less than the current min withdrawal of the wallet
        if (amount < parseFloat(admin.min_with)) {
            return res.json({ status: 400, msg: `Withdrawal amount should be greater than $${admin.min_with}` })
        }
        // checking if the withdrawal is greater than tha balance
        const checkwith = amount
        const checkover = wallet.crypto / admin.current_price
        if (checkwith >= checkover) {
            return res.json({ status: 400, msg: `Insufficient Balance!...` })
        }
        // checking if the withdrawal amount is greater than the current max withdrawal percent of the wallet
        const calpercent = checkover * admin.max_with - checkover;
        const getpercent = amount - (amount / admin.max_with)
        if (amount >= calpercent) {
            return res.json({ status: 400, msg: `Cannot withdraw above ${admin.max_with * 100 - 100}% of available balance from your ${admin.name} wallet` })
        }

        // lets debit the user wallet
        const caluserwallet = wallet.crypto / admin.current_price; //gets the dollar value
        const getcurrentwallet = caluserwallet - amount; //minus the dollar value against the with amount
        wallet.crypto = getcurrentwallet * admin.current_price //sets the new crypto balance
        await wallet.save()
        // adding the withdrawal to user's total withdrawal
        user.total_with += parseFloat(amount);
        await user.save()

        // saving withdrawal for admin purpose
        const message = `Requested to withdraw $${amount / admin.withfee} from ${admin.name} wallet to credit external wallet (${address})`
        const newwithdrawal = { user_id: userid, title: 'crypto withdrawal', message, amount, status: 'pending', wallet: walletid }
        await Withdrawal.create(newwithdrawal)

        const newtran = { amount, title: 'crypto withdrawal', user_id: userid, tag: 'pending', message, tag_id: newwithdrawal.id }

        await Transaction.create(newtran)
        
        // record fee
        const rec = amount - amount / admin.withfee
        const newrecord = {title: 'fee from crypto withdrawal', amount: rec}
        await Feecharge.create(newrecord)
        res.json({ status: 200, msg: `Withdrawal Successfully submitted, awaiting approval` })
    } catch (error) {
        return res.json({ status: 400, msg: `Error ${error}` })
    }
}

exports.dashboardWtihdrawal = async (req, res) => {
    try {
        const withs = await Withdrawal.findAll({where: { user_id: req.params.userid }, limit: 1, order: [[ 'id', 'DESC' ]]})
        res.json({ status: 200, msg: withs })
    } catch (error) {
        return res.json({ status: 404, msg: `Error ${error}` })
    }
}
exports.coinSwap = async (req, res) => {
    try {
        const { wallet_to, wallet_from, amount } = req.body;
        const user = await User.findByPk(req.params.userid)
        const walletTo = await Wallet.findOne({
            include: [{model: Adminwallet, as: 'adminwallet'}],
            where: {id: wallet_to}
        })
        const walletFrom = await Wallet.findOne({
            include: [{model: Adminwallet, as: 'adminwallet'}],
            where: {id: wallet_from}
        })
        const adminFrom = await Adminwallet.findByPk(walletFrom.adminwallet.id)
        const adminTo = await Adminwallet.findByPk(walletTo.adminwallet.id)

        // check if the amount exceeds the balance
        const minuscash = walletFrom.crypto / adminFrom.current_price;
        if(amount >= minuscash) {
            return res.json({status: 400, msg: `Insufficient Balance`});
        }
        const checkout = minuscash - amount;
        walletFrom.crypto = checkout * adminFrom.current_price

        const calcpercent = amount - (amount / adminFrom.swapfee)
        const addcash = walletTo.crypto / adminTo.current_price;
        const checkin = addcash + amount - calcpercent
        walletTo.crypto = checkin * adminTo.current_price

        const message = `Withdrew the sum of $${amount / walletFrom.adminwallet.withfee} from my ${walletFrom.adminwallet.name} wallet to fund my ${walletTo.adminwallet.name} wallet`

        const newwithdrawal = { user_id: user.id, title: 'Withdrawal', message, amount, status: 'Coin Swap', wallet: walletFrom.id }
        await Withdrawal.create(newwithdrawal)

        const newtran = { amount, title: 'Withdrawal', user_id: user.id, tag: 'Coin Swap', message, tag_id: newwithdrawal.id }

        user.total_with += amount;

        await walletTo.save()
        await walletFrom.save()
        await Transaction.create(newtran)
        await user.save()
        
        // record fee
        const rec = calcpercent
        const newrecord = {title: 'fee from coin swap', amount: rec}
        await Feecharge.create(newrecord)
        res.json({status: 200, msg: `Coin Swapped successfully`})
    } catch (error) {
        return res.json({ status: 400, msg: `Error ${error}` })
    }
}

exports.peerTransfer = async (req, res) => {
    try {
        const { address, wallet, amount, password } = req.body;
        const sender = await User.findByPk(req.params.userid);
        const walletFrom = await Wallet.findByPk(wallet)
        const adminFrom = await Adminwallet.findByPk(walletFrom.adminwallet_id)
        const walletTo = await Wallet.findOne({where: { ads: address }})
        const adminTo = await Adminwallet.findByPk(walletTo.adminwallet_id)
        const reciever = await User.findByPk(walletTo.user_id)
        const checkpswd = await bcrypt.compare(password, sender.password)

        // check if the password is correct
        if (!checkpswd) {
            return res.json({ status: 400, msg: 'Password Incorrect!..' });
        }

        // check if the tranfer is above the balance in the wallet
        const checkover = walletFrom.crypto / adminFrom.current_price;
        if (amount >= checkover) {
            return res.json({ status: 400, msg: `Insufficient Balance` })
        }

        // user must have up to min amount
        const calswap = amount - (amount / adminFrom.p2pfee);
        if (amount <= calswap) {
            return res.json({ status: 400, msg: `Transfer must be above $${calswap} to process your request` })
        }

        // working on the sender reduction
        minuscrypto = checkover - amount;
        walletFrom.crypto = minuscrypto * adminFrom.current_price

        sender.total_with += amount;

        // saving withdrawal for admin purpose for the sender
        const message = `Withdrew the sum of $${amount / adminFrom.withfee} from my ${adminFrom.name} wallet to fund the ${adminTo.name} wallet of ${reciever.fname} ${reciever.lname}`

        const newwithdrawal = { user_id: sender.id, title: 'Withdrawal', message, amount, status: 'P2P Transfer', wallet: wallet }
        await Withdrawal.create(newwithdrawal)

        const newtran = { amount, title: 'Withdrawal', user_id: sender.id, tag: 'P2P Transfer', message, tag_id: newwithdrawal.id }

        // crediting the reciever's side
        const recieverpercent = amount - (amount / adminTo.p2pfee)
        const checkout = amount - recieverpercent
        const calccredit = walletTo.crypto / adminTo.current_price;
        const addcredit = calccredit + checkout;
        walletTo.crypto = addcredit * adminTo.current_price;

        reciever.total_dept += checkout
        // saving withdrawal for admin purpose for the reciever
        const message2 = `Credited by ${sender.fname} ${sender.lname} the sum of $${amount / adminTo.withfee} to my ${adminTo.name} wallet`

        const newwithdrawal2 = { user_id: reciever.id, image: 'Not Available', title: 'deposit', message: message2, amount: checkout, status: 'P2P Transfer', wallet: wallet }
        await Deposit.create(newwithdrawal2)

        const newtran2 = { amount: checkout, title: 'deposit', user_id: reciever.id, tag: 'P2P Transfer', message: message2, tag_id: newwithdrawal2.id }

        await Transaction.create(newtran)
        await Transaction.create(newtran2)
        await reciever.save()
        await walletTo.save()
        await sender.save()
        await walletFrom.save()

        // record fee
        const rec = calswap
        const newrecord = {title: 'fee from peer 2 peer transfer', amount: rec}
        await Feecharge.create(newrecord)

        res.json({ status: 200, msg: `Transfer successfully sent to ${reciever.fname}'s ${adminTo.name} wallet` })
    } catch (error) {
        return res.json({ status: 400, msg: `Error ${error}` })
    }
}

