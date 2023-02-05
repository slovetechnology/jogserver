module.exports = (sequelize, DataTypes) => {
    const Adminwallet = sequelize.define('adminwallet', {
        name: {type: DataTypes.STRING, allowNull: false, unique: true},
        short: {type: DataTypes.STRING, allowNull: false},
        price: {type: DataTypes.FLOAT, allowNull: false},
        image: {type: DataTypes.STRING, allowNull: false},
        qrcode: {type: DataTypes.STRING, allowNull: false},
        min_with: {type: DataTypes.FLOAT, allowNull: false},
        max_with: {type: DataTypes.FLOAT, allowNull: false},
        percent: {type: DataTypes.FLOAT, allowNull: false},
        swapfee: {type: DataTypes.FLOAT, allowNull: false},
        bonusfee: {type: DataTypes.FLOAT, allowNull: false},
        withfee: {type: DataTypes.FLOAT, allowNull: false},
        p2pfee: {type: DataTypes.FLOAT, allowNull: false},
        current_price: {type: DataTypes.FLOAT, allowNull: false},
        ads: {type: DataTypes.STRING, allowNull: false},
    }, {
        paranoid: true,
    })

    return Adminwallet
}