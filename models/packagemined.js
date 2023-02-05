module.exports = (sequelize, DataTypes) => {
    const Packagemined = sequelize.define('packagemined', {
        user_id: {type: DataTypes.INTEGER},
        start_date: {type: DataTypes.DATE, allowNull: true},
        stop_date: {type: DataTypes.DATE, allowNull: true},
        fund_date: {type: DataTypes.FLOAT, allowNull: true},
        topup: {type: DataTypes.FLOAT, allowNull: true},
        wallet: {type: DataTypes.INTEGER, allowNull: true},
        balance: {type: DataTypes.FLOAT, allowNull: true},
        status: {type: DataTypes.STRING, allowNull: true},
        packid: {type: DataTypes.INTEGER, allowNull: true}
    })

    return Packagemined
}

