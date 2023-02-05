module.exports = (sequelize, DataTypes) => {
    const Transaction = sequelize.define('transaction', {
        user_id: {type: DataTypes.INTEGER},
        tag_id: {type: DataTypes.INTEGER},
        title: {type: DataTypes.STRING},
        message: {type: DataTypes.STRING},
        amount: {type: DataTypes.FLOAT},
        tag: {type: DataTypes.STRING},
    })

    return Transaction
}