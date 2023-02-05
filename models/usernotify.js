module.exports = (sequelize, DataTypes) => {
    const Usernotify = sequelize.define('usernotify', {
        user_id: {type: DataTypes.INTEGER, allowNull: false},
        notify_id: {type: DataTypes.INTEGER},
        status: {type: DataTypes.STRING}
    }, {
        paranoid: true
    })

    return Usernotify
}