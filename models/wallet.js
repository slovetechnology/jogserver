module.exports = (sequelize, DataTypes) => {
    const Wallet = sequelize.define('wallet', {
        user_id: {type: DataTypes.INTEGER},
        adminwallet_id: {type: DataTypes.INTEGER},
        balance: {type: DataTypes.FLOAT},
        crypto: {type: DataTypes.FLOAT},
        mineid: {type: DataTypes.INTEGER},
        status: {type: DataTypes.STRING},
        ads: {type: DataTypes.STRING},
        airdrop_id: {type: DataTypes.INTEGER},
        lockedbal: {type: DataTypes.FLOAT},
        airref: {type: DataTypes.STRING, defaultValue: 'false'},
    }, {
        paranoid: true
    })

    return Wallet
}