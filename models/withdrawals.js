module.exports = (sequelize, DataTypes) => {
    const Withdrawal = sequelize.define('withdrawal', {
        user_id: {type: DataTypes.INTEGER},
        title: {type: DataTypes.STRING},
        message: {type: DataTypes.STRING},
        amount: {type: DataTypes.FLOAT},
        wallet: {type: DataTypes.INTEGER},
        status: {type: DataTypes.STRING},
    })

    return Withdrawal
}