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

// GET /posts/:postId/attachment
exports.attachment = (req, res, next) => {
    const { post } = req.load;
    const { attachment } = post;

    if (!attachment) {
        res.redirect("/images/none.png");
    }
    else if (attachment.image) {
        res.type(attachment.mime);
        res.send(Buffer.from(attachment.image.toString(), 'base64'));
    }
    else if (attachment.url) {
        res.redirect(attachment.url);
    }
    else {
        res.redirect("/images/none.png");
    }
};

// GET /posts
exports.index = async (req, res, next) => {
    try {
        const findOptions = {
            include: [
                {model: models.Attachment, as: 'attachment'}
            ]
        };

        const posts = await models.Post.findAll(findOptions);
        res.render('posts/index.ejs', {posts});
    } catch (error) {
        next(error);
    }
};