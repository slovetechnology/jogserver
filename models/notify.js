module.exports = (sequelize, DataTypes) => {
    const Notify = sequelize.define('notify', {
        title: {type: DataTypes.STRING, allowNull: false},
        message: {type: DataTypes.STRING(1000), allowNull: false},
        duration: {type: DataTypes.DATE, allowNull: false},
    })

    return Notify
}