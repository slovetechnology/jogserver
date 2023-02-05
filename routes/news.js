const { addNews, allNews, getSingleNews, updateNews, deleteNews, addNotification, getAllNotifications, getSingleNotify, addUserNotesStatus, getUserNotes } = require('../controllers/news');

const router = require('express').Router();

router.post('/save-news', addNews)
router.get('/all-news', allNews)
router.get('/single/:id', getSingleNews)
router.post('/update-news/:id', updateNews)
router.delete('/delete-news/:id', deleteNews)
router.post('/add-notification', addNotification)
router.get('/all-notifies', getAllNotifications)
router.get('/single-notify/:id', getSingleNotify)
router.post('/add-usernotes/:noteid/:userid', addUserNotesStatus)
router.get('/get-usernotes/:userid', getUserNotes)

module.exports = router