const express = require('express')
const cors = require('cors')
const fileUpload = require('express-fileupload')

require('dotenv').config()


const app = express()
const port = process.env.PORT || 5000

app.use(cors({
    origin: ['http://localhost:3000', 'http://reactfrontend.jogglecryp.com', 'https://reactfrontend.jogglecryp.com']
}))
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(express.static('public'))
app.use(fileUpload())
app.use('/api/user', require('./routes/user'))
app.use('/api/adminwallet', require('./routes/adminwallet'))
app.use('/api/package', require('./routes/package'))
app.use('/api/wallet', require('./routes/wallet'))
app.use('/api/withdraw', require('./routes/withdrawals'))
app.use('/api/deposit', require('./routes/deposit'))
app.use('/api/trans', require('./routes/transactions'))
app.use('/api/vendor', require('./routes/vendor'))
app.use('/api/news', require('./routes/news'))

app.listen(port, () => { console.log(`Server running on port:${port}`) })
