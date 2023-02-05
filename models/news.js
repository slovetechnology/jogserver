module.exports = (sequelize, Datatypes) => {
    const News = sequelize.define('news', {
        title: {type: Datatypes.STRING,  trim: true},
        message: {type: Datatypes.STRING(1000)}, 
        media: {type: Datatypes.STRING},
        quality: {type: Datatypes.STRING},
    }, {
        paranoid: true
    })
    return News
}