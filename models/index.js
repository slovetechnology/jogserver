const dbConfig = require('../config/dbConfig')

const {Sequelize, DataTypes} = require('sequelize')

const sequelize = new Sequelize(
    dbConfig.DB,
    dbConfig.USER,
    dbConfig.PASSWORD, {
        host: dbConfig.HOST,
        dialect: dbConfig.dialect,
        operatorsAliases: false,

        pool: {
            max: dbConfig.max,
            min: dbConfig.min,
            acquire: dbConfig.acquire,
            idle: dbConfig.idle
        }
    }
)

sequelize.authenticate()
.then(() => console.log(`Server Connected`))
.catch(err => console.log(`Error ${err}`))

const db = {}

db.Sequelize = Sequelize
db.sequelize = sequelize

db.users = require('./userModel')(sequelize, DataTypes)
db.mines = require('./mineModel')(sequelize, DataTypes)
db.adminwallets = require('./adminwalletModel')(sequelize, DataTypes)
db.packages = require('./packages')(sequelize, DataTypes)
db.wallets = require('./wallet')(sequelize, DataTypes)
db.airdrops = require('./airdrop')(sequelize, DataTypes)
db.withdrawals = require('./withdrawals')(sequelize, DataTypes)
db.deposits = require('./deposit')(sequelize, DataTypes)
db.transactions = require('./transactions')(sequelize, DataTypes)
db.bank_details = require('./bankdetail')(sequelize, DataTypes)
db.markets = require('./market')(sequelize, DataTypes)
db.packagemineds = require('./packagemined')(sequelize, DataTypes)
db.vendors = require('./vendor')(sequelize, DataTypes)
db.vendortransfers = require('./vendortransfer')(sequelize, DataTypes)
db.vendorfeedbacks = require('./vendorfeedback')(sequelize, DataTypes)
db.vendorhistories = require('./Vendorhistory')(sequelize, DataTypes)
db.news = require('./news')(sequelize, DataTypes)
db.feecharges = require('./feecharge')(sequelize, DataTypes)
db.notifies = require('./notify')(sequelize, DataTypes)
db.usernotifies = require('./usernotify')(sequelize, DataTypes)

db.sequelize.sync({force: false}).then(() => console.log(`re-sync done!..`)) 

db.users.hasMany(db.mines, { foreignKey: 'user_id', as: 'mine'})
db.users.hasMany(db.markets, { foreignKey: 'user_id', as: 'market'})
db.users.hasMany(db.packagemineds, { foreignKey: 'user_id', as: 'packagemined'})
db.packages.hasMany(db.packagemineds, { foreignKey: 'packid', as: 'packagemined'})
db.users.hasMany(db.deposits, { foreignKey: 'user_id', as: 'deposit'})
db.users.hasMany(db.withdrawals, { foreignKey: 'user_id', as: 'withdrawal'})
db.users.hasMany(db.wallets, { foreignKey: 'user_id', as: 'wallet'})
db.users.hasMany(db.vendors, { foreignKey: 'user_id', as: 'vendor'})
db.users.hasMany(db.vendortransfers, { foreignKey: 'user_id', as: 'vendortransfer'})
db.adminwallets.hasMany(db.wallets, { foreignKey: 'adminwallet_id', as: 'wallet'})
db.adminwallets.hasMany(db.airdrops, { foreignKey: 'adminwallet_id', as: 'airdrop'})
db.mines.hasMany(db.wallets, { foreignKey: 'mineid', as: 'mine'})
db.airdrops.hasMany(db.wallets, { foreignKey: 'airdrop_id', as: 'airdrop'}) 
db.packages.hasMany(db.mines, { foreignKey: 'packid', as: 'mine'}) 
db.users.hasMany(db.vendorfeedbacks, { foreignKey: 'user_id', as: 'vendorfeedback'}) 
db.users.hasMany(db.vendorhistories, { foreignKey: 'user_id', as: 'vendorhistory'}) 
db.notifies.hasMany(db.usernotifies, {foreignKey: 'notify_id', as: 'notify'})




db.markets.belongsTo(db.users, {foreignKey: 'user_id', as: 'user'})
db.packagemineds.belongsTo(db.users, {foreignKey: 'user_id', as: 'user'})
db.packagemineds.belongsTo(db.packages, {foreignKey: 'packid', as: 'package'})
db.mines.belongsTo(db.users, {foreignKey: 'user_id', as: 'user'})
db.mines.belongsTo(db.packages, {foreignKey: 'packid', as: 'package'})
db.wallets.belongsTo(db.users, {foreignKey: 'user_id', as: 'user'})
db.wallets.belongsTo(db.adminwallets, {foreignKey: 'adminwallet_id', as: 'adminwallet'})
db.wallets.belongsTo(db.mines, {foreignKey: 'mineid', as: 'mine'})
db.wallets.belongsTo(db.airdrops, {foreignKey: 'airdrop_id', as: 'airdrop'})
db.airdrops.belongsTo(db.adminwallets, {foreignKey: 'adminwallet_id', as: 'adminwallet'})
db.withdrawals.belongsTo(db.users, {foreignKey: 'user_id', as: 'user'})
db.deposits.belongsTo(db.users, {foreignKey: 'user_id', as: 'user'})
db.vendors.belongsTo(db.users, {foreignKey: 'user_id', as: 'user'})
db.vendortransfers.belongsTo(db.users, {foreignKey: 'user_id', as: 'user'})
db.vendorfeedbacks.belongsTo(db.users, {foreignKey: 'user_id', as: 'user'})
db.vendorhistories.belongsTo(db.users, {foreignKey: 'user_id', as: 'user'})
db.usernotifies.belongsTo(db.notifies, {foreignKey: 'notify_id', as: 'notify'})



module.exports = db