const { registerUser, getUserData, logoutUser, loginUser, getProfileInfo, updateProfile, uploadProfile, sendRegistrationCode, myReferrals, confirmPasswordSettings, updateUserPassword, completeEmailUpdate, updateEmailAddress, updateAccountPassword, sendRegistrationLoginCode, allUsers, adminGetSingleUser, adminUpdateUserInfo, sendForgotPasswordEmail } = require('../controllers/userController')

const router = require('express').Router()

router.post('/register', registerUser)
router.get('/:id', getUserData);
router.post('/upload-profile/:id', uploadProfile);
router.post('/logoutuser/:id', logoutUser);
router.post('/login', loginUser)
router.get('/profile/:id', getProfileInfo)
router.post('/update-profile/:id', updateProfile)
router.get('/send-verification-code/:useremail', sendRegistrationCode)
router.get('/send-forgotpassword-email/:useremail', sendForgotPasswordEmail)
router.put('/send-verification-logincode/:useremail/:password', sendRegistrationLoginCode)
router.put('/update-account-password', updateAccountPassword)
router.get('/my-refs/:userid', myReferrals)
router.put('/confirm-password-settings/:userid', confirmPasswordSettings)
router.put('/update-password/:userid', updateUserPassword)
router.put('/update-email-address/:userid', updateEmailAddress)
router.put('/complete-email-update/:userid', completeEmailUpdate)
router.get('/all/admin-users', allUsers)
router.get('/single-user/admin/:id', adminGetSingleUser)
router.post('/admin-update-user-info/:id', adminUpdateUserInfo)

module.exports = router 