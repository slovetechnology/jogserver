module.exports = (sequelize, DataTypes) => {
    const Vendorfeedback = sequelize.define('vendorfeedback', {
        user_id: {type: DataTypes.INTEGER},
        vendor: {type: DataTypes.INTEGER},
        text: {type: DataTypes.STRING(1000)},
        status: {type: DataTypes.STRING},
    }, {
        paranoid: true
    })

    return Vendorfeedback
}