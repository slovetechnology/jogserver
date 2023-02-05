
module.exports = (sequelize, DataTypes) => {
    const Mine = sequelize.define('mine', {
        user_id: {type: DataTypes.INTEGER, allowNull: false},
        start_date: {type: DataTypes.DATE, allowNull: true},
        stop_date: {type: DataTypes.DATE, allowNull: true},
        current_date: {type: DataTypes.DATE, allowNull: true},
        fund_date: {type: DataTypes.FLOAT, allowNull: true},
        topup: {type: DataTypes.FLOAT, allowNull: true},
        wallet: {type: DataTypes.INTEGER, allowNull: true},
        balance: {type: DataTypes.FLOAT, allowNull: true},
        status: {type: DataTypes.STRING, allowNull: true},
        packid: {type: DataTypes.INTEGER, allowNull: true},
        minetimes: {type: DataTypes.FLOAT, allowNull: true},
    })

    return Mine
}