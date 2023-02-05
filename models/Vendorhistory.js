
module.exports = (sequelize, DataTypes) => {
    const Vendorhistory = sequelize.define('vendorhistory', {
        user_id: {type: DataTypes.INTEGER},
        vendor: {type: DataTypes.INTEGER},
        amount: {type: DataTypes.FLOAT},
        fee: {type: DataTypes.FLOAT},
        suspend: {type: DataTypes.FLOAT, allowNull: true},
        proof: {type: DataTypes.STRING, allowNull: true},
        payer_name: {type: DataTypes.STRING, allowNull: true},
        pay_method: {type: DataTypes.STRING, allowNull: true},
        paid: {type: DataTypes.FLOAT, allowNull: true},
        user_wallet: {type: DataTypes.INTEGER, allowNull: true},
        vendor_wallet: {type: DataTypes.INTEGER, allowNull: true},
        status: {type: DataTypes.STRING},
        reason: {type: DataTypes.STRING(1000)}
    }, {
        paranoid: true,
    })

    return Vendorhistory
}