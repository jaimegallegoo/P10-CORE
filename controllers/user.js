const createError = require('http-errors');
const Sequelize = require("sequelize");
const {models} = require("../models");

// Autoload the user with id equals to :userId
exports.load = async (req, res, next, userId) => {

    try {
        const user = await models.User.findByPk(userId);
        if (user) {
            req.load = {...req.load, user};
            next();
        } else {
            console.log('Error: There is no user with id=' + userId + '.');
            throw createError(404,'No exist userId=' + userId);
        }
    } catch (error) {
        next(error);
    }
};


// GET /users
exports.index = async (req, res, next) => {

    try {
        const findOptions = {
            order: ['username']
        };

        const users = await models.User.findAll(findOptions);
        res.render('users/index', {users});
    } catch (error) {
        next(error);
    }
};

// GET /users/:userId
exports.show = (req, res, next) => {

    const {user} = req.load;

    res.render('users/show', {user});
};


// GET /users/new
exports.new = (req, res, next) => {

    const user = {
        username: "",
        password: "",
        email: ""
    };

    res.render('users/new', {user});
};


// POST /users
exports.create = async (req, res, next) => {

    const {username, password, email} = req.body;

    let user = models.User.build({
        username,
        password,
        email
    });

    // Password must not be empty.
    if (!password) {
        console.log('Error: Password must not be empty.');
        return res.render('users/new', {user});
    }

    try {
        // Save into the data base
        user = await user.save({fields: ["username", "password", "email", "salt"]});
        console.log('Success: User created successfully.');
        if (req.session.loginUser) {
            res.redirect('/users/' + user.id);
        } else {
            res.redirect('/login'); // Redirection to the login page
        }
    } catch (error) {
        if (error instanceof Sequelize.UniqueConstraintError) {
            console.log(`Error: User "${username}" already exists.`);
            res.render('users/new', {user});
        } else if (error instanceof Sequelize.ValidationError) {
            console.log('Error: There are errors in the form:');
            error.errors.forEach(({message}) => console.log('Error:', message));
            res.render('users/new', {user});
        } else {
            next(error);
        }
    }
};


// GET /users/:userId/edit
exports.edit = (req, res, next) => {

    const {user} = req.load;

    res.render('users/edit', {user});
};


// PUT /users/:userId
exports.update = async (req, res, next) => {

    const {body} = req;
    const {user} = req.load;

    user.email = body.email;
    // user.username  = body.username; // edition not allowed

    let fields_to_update = [];

    // ¿Cambio el password?
    if (body.password) {
        console.log('Updating password');
        user.password = body.password;
        fields_to_update.push('salt');
        fields_to_update.push('password');
    }

    try {
        await user.save({fields: fields_to_update});
        console.log('Success: User updated successfully.');
        res.redirect('/users/' + user.id);
    } catch (error) {
        if (error instanceof Sequelize.ValidationError) {
            console.log('Error: There are errors in the form:');
            error.errors.forEach(({message}) => console.log('Error:', message));
            res.render('users/edit', {user});
        } else {
            next(error);
        }
    }
};


// DELETE /users/:userId
exports.destroy = async (req, res, next) => {

    try {
        // Deleting logged user.
        if (req.session.loginUser?.id === req.load.user.id) {
            // Close the user session
            delete req.session.loginUser;
        }

        await req.load.user.destroy()
        console.log('Success: User deleted successfully.');
        res.redirect('/users');
    } catch (error) {
        next(error);
    }
};