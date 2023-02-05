

module.exports = (sequelize, DataTypes) => {
    const Feecharge = sequelize.define('feecharge', {
        title: {type:  DataTypes.STRING, allowNull: false},
        amount: {type:  DataTypes.INTEGER, allowNull: false},
    })

    return Feecharge
}