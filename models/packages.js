module.exports = (sequelize, DataTypes) => {
    const Package = sequelize.define('package', {
        name: {type: DataTypes.STRING},
        amount: {type: DataTypes.FLOAT},
        bonus: {type: DataTypes.FLOAT},
        duration: {type: DataTypes.FLOAT},
        topup: {type: DataTypes.FLOAT},
        refcom: {type: DataTypes.FLOAT},
    })

    return Package
}