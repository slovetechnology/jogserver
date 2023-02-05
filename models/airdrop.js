module.exports = (sequelize, DataTypes) => {
    const Airdrop = sequelize.define('airdrop', {
        adminwallet_id: {type: DataTypes.INTEGER},
        percent: {type: DataTypes.FLOAT},
        startd: {type: DataTypes.DATE},
        stopd: {type: DataTypes.DATE},
        refcom: {type: DataTypes.FLOAT},
    })

    return Airdrop
}