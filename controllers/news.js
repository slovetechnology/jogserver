const News = require('../models').news
const fs = require('fs')
const Usernotify = require('../models').usernotifies
const Notify = require('../models').notifies

exports.allNews = async (req, res) => {
    try {
        const news = await News.findAll({
            order: [['createdAt', 'DESC']],
        })
        res.json({ status: 200, msg: news })
    } catch (error) {
        res.json({ status: 400, msg: error })
    }
}

exports.addNews = async (req, res) => {
    try {
        const { title, message, status } = req.body
        const file = !req?.files?.image ? null : req.files.image

        let myimg = null
        if (file) {
            const date = new Date()
            myimg = `news_${date.getTime()}.png`

            file.mv(`./public/news/${myimg}`, err => {
                if (err) return res.json({ status: 400, msg: err })
            })
        }

        const feeds = { title, message, media: myimg, quality: status }
        await News.create(feeds)

        res.json({ status: 200, msg: `News published successfully` })
    } catch (error) {
        res.json({ status: 400, msg: `error ${error}` })
    }
}

exports.getSingleNews = async (req, res) => {
    try {
        const news = await News.findOne({ where: { id: req.params.id } })
        res.json({ status: 200, msg: news })
    } catch (error) {
        res.json({ status: 400, msg: error })
    }
}

exports.updateNews = async (req, res) => {
    try {
        const { title, message, status } = req.body
        const file = !req?.files?.image ? null : req.files.image

        const news = await News.findOne({ where: { id: req.params.id } })

        let myimg = news.media
        if (file) {
            const filepath = `./public/news/${news.media}`
            if (fs.existsSync(filepath)) {
                fs.unlinkSync(filepath);
            }
            const date = new Date()
            myimg = `news_${date.getTime()}.png`

            file.mv(`./public/news/${myimg}`, err => {
                if (err) return res.json({ status: 400, msg: err })
            })
        }

        news.title = title 
        news.message = message 
        news.quality = status 
        news.media = myimg 
        await news.save()

        res.json({ status: 200, msg: `News successfully updated`, news })
    } catch (error) {
        res.json({ status: 400, msg: `error ${error}` })
    }
}

exports.deleteNews = async (req, res) => {
    try {
        const news = await News.findOne({where: {id: req.params.id}})
        if(news.media) {
            const filepath = `./public/news/${news.media}`
            if(fs.existsSync(filepath)) {
                fs.unlinkSync(filepath);
            }
        }
        await news.destroy()

        res.json({status: 200, msg: `News Deleted Successfully`})
    } catch (error) {
        res.json({status: 400, msg: error})
    }
}

exports.addNotification = async(req, res) => {
    try {
        const {title, message, duration} = req.body
        const newnotify = {title, message, duration}
        await Notify.create(newnotify)

        res.json({status: 200, msg: 'Notification Successfully Added'}) 
    } catch (error) {
        res.json({status: 400, msg: error})
    }
}

exports.getAllNotifications = async (req, res) => {
    try {
        const {rows, count} = await Notify.findAndCountAll({order: [['createdAt', 'DESC']]})
        res.json({status: 200, msg: rows, count})
    } catch (error) {
        res.json({status: 400, msg: error})
    }
}

exports.getSingleNotify = async (req, res) => {
    try {
        const item = await Notify.findOne({
            where: {id: req.params.id}
        })

        res.json({status: 200, msg: item})
    } catch (error) {
        res.json({status: 400, msg: error})
    }
}

exports.addUserNotesStatus = async (req, res) => {
    try {
        const checknote = await Usernotify.findOne({
            where: {user_id: req.params.userid, notify_id: req.params.noteid, status: 'viewed'}
        })
        if(!checknote) {
            const newusernotes = {user_id: req.params.userid, notify_id: req.params.noteid, status: 'viewed'}
            await Usernotify.create(newusernotes)
        }
        
        const allnotify = await Notify.findAll({
            order: [['createdAt', 'DESC']]
        })
        const usernotes = await Usernotify.findAll({
            where: {user_id: req.params.userid}
        })
        
        return res.json({status: 200, notify: allnotify, usernotify: checknote})
    } catch (error) {
        res.json({status: 400, msg: error})
    }
}

exports.getUserNotes = async (req, res) => {
    try {
        const allnotify = await Notify.findAll({
            order: [['createdAt', 'DESC']]
        })
        const checknote = await Usernotify.findAll({
            where: {user_id: req.params.userid}
        })

        return res.json({status: 200, notify: allnotify, usernotify: checknote})
    } catch (error) {
        res.json({status: 400, msg: error})
    }
}