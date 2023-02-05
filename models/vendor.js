module.exports = (sequelize, DataTypes) => {
    const Vendor = sequelize.define('vendor', {
        user_id: {type: DataTypes.INTEGER},
        idcard: {type: DataTypes.STRING},
        passport: {type: DataTypes.STRING},
        fee: {type: DataTypes.FLOAT},
        rate: {type: DataTypes.FLOAT},
        poa: {type: DataTypes.STRING},
        bank: {type: DataTypes.TEXT('long')},
        // bank: {type: DataTypes.STRING(1000)},
        status: {type: DataTypes.STRING},
    }, {
        paranoid: true
    })

    return Vendor
}