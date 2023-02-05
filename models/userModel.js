module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('user', {
        fname: { type: DataTypes.STRING, allowNull: false },
        lname: { type: DataTypes.STRING, allowNull: false },
        email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: {
            isEmail: true
        } },
        role: { type: DataTypes.STRING },
        contact: { type: DataTypes.STRING, allowNull: false, unique: true },
        resetcode: { type: DataTypes.STRING },
        balance: { type: DataTypes.FLOAT },
        total_dept: { type: DataTypes.FLOAT },
        total_with: { type: DataTypes.FLOAT },
        status: { type: DataTypes.STRING },
        image: { type: DataTypes.STRING },
        birthday: { type: DataTypes.STRING },
        blockdate: { type: DataTypes.STRING },
        blockduration: { type: DataTypes.DATE },
        permanent: { type: DataTypes.STRING },
        bonus: { type: DataTypes.FLOAT },
        myref_id: { type: DataTypes.STRING },
        external_ref: { type: DataTypes.STRING },
        state: { type: DataTypes.STRING, allowNull: false },
        auto_renew: { type: DataTypes.STRING },
        total_bonus: { type: DataTypes.FLOAT },
        country: { type: DataTypes.STRING, allowNull: false },
        address: { type: DataTypes.STRING },
        total_ref: { type: DataTypes.FLOAT },
        total_wallet: { type: DataTypes.FLOAT },
        notify: { type: DataTypes.FLOAT },
        block: { type: DataTypes.STRING },
        email_verified_at: { type: DataTypes.STRING },
        password: { type: DataTypes.STRING },
    }, {
        paranold: true
    })

    return User
}