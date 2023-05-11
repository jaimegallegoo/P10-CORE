const Sequelize = require("sequelize");
const {models} = require("../models");
const createError = require('http-errors');

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
            throw createError(404, 'There is no post with id=' + postId);
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

// GET /posts/:postId
exports.show = (req, res, next) => {

    const {post} = req.load;

    res.render('posts/show', {post});
};

// GET /posts/new
exports.new = (req, res, next) => {

    const post = {
        title: "",
        body: ""
    };

    res.render('posts/new', {post});
};

// POST /posts/create
exports.create = async (req, res, next) => {
    const {title, body} = req.body;

    const authorId = req.session.loginUser?.id;

    let post;
    try {
        post = models.Post.build({
            title,
            body,
            authorId
        });

        post = await post.save({fields: ["title", "body", "authorId"]});
        console.log('Success: Post created successfully.');

        try {
            if (!req.file) {
                console.log('Info: Post without attachment.');
                return;
            }

            // Create the post attachment
            await createPostAttachment(req, post);
        } catch (error) {
            console.log('Error: Failed to create attachment: ' + error.message);
        } finally {
            res.redirect('/posts/' + post.id);
        }
    } catch (error) {
        if (error instanceof (Sequelize.ValidationError)) {
            console.log('There are errors in the form:');
            error.errors.forEach(({message}) => console.log(message));
            res.render('posts/new', {post});
        } else {
            next(error);
        }
    }
};

// Aux function to upload req.file to cloudinary, create an attachment with it, and
// associate it with the gien post.
// This function is called from the create an update middleware. DRY.
const createPostAttachment = async (req, post) => {
    const image = req.file.buffer.toString('base64');
    const url = `${req.protocol}://${req.get('host')}/posts/${post.id}/attachment`;

    // Create the new attachment into the data base.
    const attachment = await models.Attachment.create({
        mime: req.file.mimetype,
        image,
        url
    });
    await post.setAttachment(attachment);
    console.log('Success: Attachment saved successfully.');
};

// GET /posts/:postId/edit
exports.edit = (req, res, next) => {

    const {post} = req.load;

    res.render('posts/edit', {post});
};

// PUT /posts/:postId
exports.update = async (req, res, next) => {

    const {post} = req.load;

    post.title = req.body.title;
    post.body = req.body.body;

    try {
        await post.save({fields: ["title", "body"]});
        console.log('Success: Post edited successfully.');

        try {
            if (!req.file) {
                console.log('Info: Post attachment not changed.');
                return;
            }

            // Delete old attachment.
            if (post.attachment) {
                await post.attachment.destroy();
                await post.setAttachment();
            }
            
            // Create the post attachment
            await createPostAttachment(req, post);
        } catch (error) {
            console.log('Error: Failed saving the new attachment: ' + error.message);
        } finally {
            res.redirect('/posts/' + post.id);
        }
    } catch (error) {
        if (error instanceof (Sequelize.ValidationError)) {
            console.log('There are errors in the form:');
            error.errors.forEach(({message}) => console.log(message));
            res.render('posts/edit', {post});
        } else {
            next(error);
        }
    }
};

// DELETE /posts/:postId
exports.destroy = async (req, res, next) => {

    const attachment = req.load.post.attachment;

    try {
        await req.load.post.destroy();
        attachment && await attachment.destroy();
        console.log('Success: Post deleted successfully.');
        res.redirect('/posts');
    } catch (error) {
        console.log('Error: Error deleting the Post: ' + error.message);

        next(error);
    }
};