
module.exports = (sequelize, DataTypes) => {
    const Market = sequelize.define('market', {
        user_id: {type: DataTypes.INTEGER},
        amount: {type: DataTypes.FLOAT},
        title: {type: DataTypes.STRING},
    })

    return Market
}