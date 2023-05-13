const Sequelize = require("sequelize");
const {models} = require("../models");
const url = require('url');


// This variable contains the maximum inactivity time allowed without 
// making requests.
// If the logged user does not make any new request during this time, 
// then the user's session will be closed.
// The value is in milliseconds.
// 5 minutes.
const maxIdleTime = 5*60*1000;


//
// Middleware used to destroy the user's session if the inactivity time
// has been exceeded.
//
exports.deleteExpiredUserSession = (req, res, next) => {

    if (req.session.loginUser ) { // There exista user's session
        if ( req.session.loginUser.expires < Date.now() ) { // Expired
            delete req.session.loginUser; // Logout
            delete res.locals.loginUser;  // Created in app.js
            console.log('Info: User session has expired.');
        } else { // Not expired. Reset value.
            req.session.loginUser.expires = Date.now() + maxIdleTime;
        }
    }
    // Continue with the request
    next();
};


/*
 * User authentication: Checks that the user is registered.
 *
 * Searches a user with the given username, and checks that
 * the password is correct.
 * If the authentication is correct, then returns the user object.
 * If the authentication fails, then returns null.
 */
const authenticate = async (username, password) => {

    const user = await models.User.findOne({where: {username: username}})

    return user?.verifyPassword(password) ? user : null;
};



// GET /login   -- Login form
exports.new = (req, res, next) => {

    res.render('session/new');
};


// POST /login   -- Create the session if the user authenticates successfully
exports.create = async (req, res, next) => {

    const username = req.body.username ?? "";
    const password = req.body.password ?? "";

    try {
        const user = await authenticate(username, password);
        if (user) {
            console.log('Info: Authentication successful.');

            // Create req.session.user and save id and username fields.
            // The existence of req.session.user indicates that the session exists.
            // I also save the moment when the session will expire due to inactivity.
            req.session.loginUser = {
                id: user.id,
                username: user.username,
                isAdmin: user.isAdmin,
                expires: Date.now() + maxIdleTime
            };

            res.redirect("/");
        } else {
            console.log('Error: Authentication has failed. Retry it again.');
            res.render('session/new');
        }
    } catch (error) {
        console.log('Error: An error has occurred: ' + error);
        next(error);
    }
};


// DELETE /login   --  Close the session
exports.destroy = (req, res, next) => {

    delete req.session.loginUser;

    res.redirect("/login"); // redirect to login gage
};

// Middleware: Login required.
//
// If the user is logged in previously then there will exists
// the req.session.loginUser object, so I continue with the others
// middlewares or routes.
// If req.session.loginUser does not exist, then nobody is logged,
// so I redirect to the login screen.
//
exports.loginRequired = function (req, res, next) {
    if (req.session.loginUser) {
        next();
    } else {
        console.log("Info: Login required: log in and retry.");
        res.redirect('/login');
    }
};

// MW that allows to pass only if the logged in user is:
// - admin
// - or is the user to be managed.
exports.adminOrMyselfRequired = (req, res, next) => {

    const isAdmin = !!req.session.loginUser?.isAdmin;
    const isMyself = req.load.user.id === req.session.loginUser?.id;

    if (isAdmin || isMyself) {
        next();
    } else {
        console.log('Prohibited route: it is not the logged in user, nor an administrator.');
        res.send(403);
    }
};

// MW that allows to pass only if the logged in user is:
// - admin.
exports.adminRequired = (req, res, next) => {

    const isAdmin = !!req.session.loginUser?.isAdmin;

    if (isAdmin) {
        next();
    } else {
        console.log('Prohibited route: it is not an administrator.');
        res.send(403);
    }
};

// MW that allows to pass only if the logged in user is:
// - admin
// - or is the author of the post.
exports.adminOrAuthorRequired = (req, res, next) => {

    const isAdmin = !!req.session.loginUser?.isAdmin;
    const isAuthor = req.load.post.authorId === req.session.loginUser?.id;

    if (isAdmin || isAuthor) {
        next();
    } else {
        console.log('Prohibited route: it is not the author of the post, nor an administrator.');
        res.send(403);
    }
};