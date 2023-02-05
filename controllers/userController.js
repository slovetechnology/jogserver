const User = require('../models').users 
const Mine = require('../models').mines
const Wallet = require('../models').wallets
const Adminwallet = require('../models').adminwallets
const fs = require('fs')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const moment = require('moment/moment')


exports.registerUser = async (req, res) => {
    try {
        const { firstname, lastname, contact, email, password, country, state, confirm_password, upline } = req.body
        if (confirm_password !== password) {
            return res.json({ status: 400, msg: 'Passwords mismatch' })
        }
        const salt = await bcrypt.genSalt(10)
        const newpswd = await bcrypt.hash(password, salt);
        const checkemail = await User.findOne({ where: {email: email} });
        if (checkemail) {
            return res.json({ status: 400, msg: 'Email Address Already exists!..' })
        }
        const checkcontact = await User.findOne({ where: {contact: contact} });
        if (checkcontact) { 
            return res.json({ status: 400, msg: 'Mobile number Already exists!..' })
        } 
        const d = new Date()
        const castref = d.getTime() * d.getMilliseconds()

        const newUser = { fname: firstname, lname: lastname, contact, email, country, state, password: newpswd, balance: 0.00, total_with: 0.00, total_dept: 0.00, bonus: 0.00, total_bonus: 0.00, role: 'user', status: 'online', external_ref: upline, myref_id: `jog_${castref}_ref` }
        const user = await User.create(newUser);

        // creating mining data
        const mine = {user_id: user.id, status: 'pending'}
        await Mine.create(mine)
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '0.5d' })
        return res.json({ status: 200, msg: 'User Account Created', token: token })
    } catch (error) {
        return res.json({ status: 400, msg: `form error ${error}` })
    }
}

exports.getUserData = async (req, res) => {
    try {
        const token = req.headers['x-access-token']
        const verifytoken = jwt.verify(token, process.env.JWT_SECRET)
        if (!verifytoken) {
            return res.json({ status: 400, msg: `Unauthorized User Access` })
        }
        const user = await User.findOne({where: {id: req.params.id}})
        if(!user) {
            return res.json({status: 400, msg: `No user found`})
        }
        res.json({status: 200, msg: user})
    } catch (error) {
        return res.json({status: 400, msg: `Error Occured: ${error}`})
    }
}

exports.uploadProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id)
        // before updating the profile delete any previous photo in case the user already has uploaded before
        const checkphoto = `./public/profiles/${user.image}`
        if(fs.existsSync(checkphoto)) {
            fs.unlinkSync(checkphoto)
        }
        const file = req.files.image;
        const date = new Date
        const filename = `user_${date.getTime()}.png`
        file.mv(`./public/profiles/${filename}`, err => {
            if(err) return res.json({status: 200, msg: `Error Uploading Profile photograph`})
        })

        user.image = filename 
        await user.save()
         res.json({status: 200, user, msg: `Profile Photograph successfully uploaded!...`})
    } catch (error) {
        return res.json({status: 400, msg: error})
    }
}

exports.logoutUser = async (req, res) => {
    try {
        const user = await User.findOne({where: {id: req.params.id}})
        const token = jwt.sign({id: user.id}, process.env.JWT_SECRET, {expiresIn: 0})
        user.status = 'offline'
        await user.save()
        res.json({status: 200, token: token, msg: 'logged out'})
    } catch (error) {
        return res.json({status: 404, msg: `ErroNot found ${error}`})
    }
}

exports.loginUser = async (req, res) => {
    const {email, password} = req.body;
    try {
        const checkemail = await User.findOne({where: { email: email }})
        if(!checkemail) return res.json({status: 404, msg: 'Email Address does not exists'})

        const checkpswd = await bcrypt.compare(password, checkemail.password);
        if(!checkpswd) return res.json({status: 400, msg: 'Invalid Account Password'})

        const token = jwt.sign({ id: checkemail.id }, process.env.JWT_SECRET, { expiresIn: '0.5d' })
        checkemail.status = 'online'
        await checkemail.save()
        return res.json({ status: 200, msg: 'User Account Logged in', token: token })
    } catch (error) {
        return res.json({status: 400, msg: `Error login ${error}`})
    }
}

exports.getProfileInfo = async (req, res) => {
    try {
        const user = await User.findOne({where: {id: req.params.id}})
        
        res.json({status: 200, msg: user})
    } catch (error) {
        return res.json({status: 404, msg: `Not Found ${error}`})
    }
}

exports.updateProfile = async (req, res) => {
    try {
        const {firstname, lastname, contact, country, state, address} = req.body
        const user = await User.findOne({where: {id: req.params.id }})
        user.fname = firstname;
        user.lname = lastname;
        user.contact = contact;
        user.country = country;
        user.state = state;
        user.address = address;
        await user.save();
        res.json({status: 200, msg: `User Profile Successfully updated`, user: user})
    } catch (error) {
        return res.json({status: 400, msg: `Error Updating ${error}`})
    }
}

exports.sendRegistrationCode = async (req, res) => {
    try {
        const {useremail} = req.params
        const user = await User.findOne({where: {email: useremail}})
        if(user) {
            return res.json({status: 400, msg: `Email Address already exists!...`})
        }
        const date = new Date 
        const code = date.getTime()
        res.json({status: 200, msg: String(code).slice(-5)})
    } catch (error) {
        res.json({status: 400, msg: `Error ${error}`})
    }
}

exports.sendForgotPasswordEmail = async (req, res) => {
    try {
        const {useremail} = req.params
        const user = await User.findOne({where: {email: useremail}})
        if(!user) {
            return res.json({status: 404, msg: `seems like ${useremail} does not exists`})
        }
        const date = new Date 
        const code = date.getTime()
        res.json({status: 200, msg: String(code).slice(-5)})
    } catch (error) {
        res.json({status: 400, msg: error})
    }
}

exports.sendRegistrationLoginCode = async (req, res) => {
    try {
        const user = await User.findOne({where: {email: req.params.useremail}})
        if(!user) {
            return res.json({status: 400, msg: `Email Address does not exists!...`})
        }

        const verifypswd = await bcrypt.compare(req.params.password, user.password)
        if(!verifypswd) {
            return res.json({status: 400, msg: `Invalid Account Password`})
        }
        // check if user is temporaryly blocked
        if(user.block === 'true') {
            if(moment().isBefore(user.blockduration)) {
                return res.json({status: 400, msg: `Looks like your account has been temporarily suspended, and will be accessible ${moment(user.blockduration).fromNow()}`})
            }
            return res.json({status: 400, msg: `Looks like your account has been temporarily suspended, kindly contact support@jogglecryp.com for more information`})
        }else {

            if(user.permanent === 'true') {
                return res.json({status: 400, msg: `Your account has been marked with suspicious activities and as such effectively locked and no longer accessible`})
            }else {
                const date = new Date 
                const code = date.getTime()
                res.json({status: 200, msg: String(code).slice(-5)})
            }
        }
    } catch (error) {
        res.json({status: 400, msg: `Error ${error}`})
    }
}

exports.myReferrals = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.userid)
        const users = await User.findAll({
            where: {external_ref: user.myref_id},
            include: [{model: Mine, as: 'mine'}]
        })

        res.json({status: 200, msg: users})
    } catch (error) {
        res.json({status: 400, msg: `Error ${error}`})
    }
}

exports.confirmPasswordSettings = async (req, res) => {
    try {
        const {password} = req.body 
        const user = await User.findOne({where: {id: req.params.userid}})
        const verify = await bcrypt.compare(password, user.password)
        if(!verify) {
            return res.json({status: 400, msg: 'Incorrect Password detected'})
        }

        res.json({status: 200, msg: 'Password confirmed'})
    } catch (error) {
        res.json({status: 400, msg: `Error ${error}`})
    }
}

exports.updateUserPassword = async (req, res) => {
    try {
        const {password} = req.body 
        const user = await User.findOne({where: {id: req.params.userid}})
        const getsalt = await bcrypt.genSalt(15)
        const pswd = await bcrypt.hash(password, getsalt)
        user.password = pswd 
        await user.save()

        res.json({status: 200, msg: `Account Password Successfully Updated!....`})
    } catch (error) {
        res.json({status: 400, msg: `Error ${error}`})
    }
}

exports.updateEmailAddress = async (req, res) => {
    try {
        const {email} = req.body 
        const user = await User.findByPk(req.params.userid)
        // check if another user has the new email
        const checkemail = await User.findOne({where: {email: email}})
        if(checkemail) {
            return res.json({status: 400, msg: `Email Address already taken by another user`})
        }

        // send verification to the email address
        const date = new Date 
        const code = date.getTime()
        const coded = String(code).slice(-5)
        user.resetcode = coded
        await user.save()
        res.json({status: 200, msg: coded})

    } catch (error) {
        res.json({status: 400, msg: `Error ${error}`})
    }
}

exports.completeEmailUpdate =async (req, res) => {
    try {
        const {code, email} = req.body 
        const user = await User.findOne({where: {id: req.params.userid}})

        if(code !== user.resetcode) {
            return res.json({status: 400, msg: `Invalid verification code detected`})
        }

        user.email = email;
        await user.save()

        res.json({status: 200, msg: `Email Addres Successfully Updated`})
    } catch (error) {
        res.json({status: 400, msg: `Error ${error}`})
    }
}
exports.updateAccountPassword = async (req, res) => {
    try {
        const {password, cpassword, email} = req.body 
        const user = await User.findOne({where: {email: email}})
        if(cpassword !== password) {
            return res.json({status: 400, msg: `Password(s) mismatched`})
        }
        const getsalt = await bcrypt.genSalt(15)
        const newpswd = await bcrypt.hash(password, getsalt)

        user.password = newpswd
        await user.save()

        res.json({status: 200, msg: 'Password Updated Successfully!...'})
    } catch (error) {
        res.json({status: 400, msg: `Error ${error}`})
    }
}

exports.allUsers = async (req, res) => {
    try {
        const {rows, count} = await User.findAndCountAll({
            where: {role: 'user'},
            order: [['createdAt', 'DESC']],
        })
        res.json({status: 200, msg: rows, count});
    } catch (error) {
        res.json({status: 400, msg: error})
    }
}

exports.adminGetSingleUser = async (req, res) => {
    try {
        const user = await User.findOne({where: {id: req.params.id}})
        const wallets = await Wallet.findAll({
            where: {user_id: user.id},
            include: [{model: Adminwallet, as: 'adminwallet'}]
        })

        res.json({status: 200, msg: user, wallets})
    } catch (error) {
        res.json({status: 400, msg: `Error ${error}`})
    }
}

exports.adminUpdateUserInfo = async (req, res) => {
    try {
        const {fname, lname, contact, block, permanent, blockduration, bonus} = req.body
        const user = await User.findByPk(req.params.id)

        user.fname = fname
        user.lname = lname 
        user.contact = contact
        user.block = block 
        user.permanent = permanent 
        user.blockduration = moment().add(blockduration, 'days')
        user.bonus = bonus 

        const addup = user.total_bonus - bonus 
        user.total_bonus += addup
        await user.save()

        res.json({status: 200, msg: `${fname}'s account successfully modified`})
    } catch (error) {
        res.json({status: 400, msg: `Error detected ${error}`})
    }
}