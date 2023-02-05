module.exports = (sequelize, DataTypes) => {
    const Deposit = sequelize.define('deposit', {
        user_id: {type: DataTypes.INTEGER},
        title: {type: DataTypes.STRING},
        message: {type: DataTypes.STRING},
        amount: {type: DataTypes.FLOAT},
        wallet: {type: DataTypes.INTEGER},
        image: {type: DataTypes.STRING},
        status: {type: DataTypes.STRING},
    })

    return Deposit
}