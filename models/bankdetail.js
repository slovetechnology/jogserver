module.exports = (sequelize, DataTypes) => {
    const Bankdetail = sequelize.define('bankdetail', {
        user_id: {type: DataTypes.INTEGER},
        anumber: {type: DataTypes.STRING},
        aholder: {type: DataTypes.STRING},
        bankname: {type: DataTypes.STRING},
    })

    return Bankdetail
}