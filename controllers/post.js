const Sequelize = require("sequelize");
const {models} = require("../models");

// Autoload el post asociado a :postId
exports.load = async (req, res, next, postId) => {
    try {
        const post = await models.Post.findByPk(postId, {
            include: [
                {model: models.Attachment, as: 'attachment'}
            ]
        });
        if (post) {
            req.load = {...req.load, post};
            next();
        } else {
            throw new Error('No hay post con id=' + postId);
        }
    } catch (error) {
        next(error);
    }
};