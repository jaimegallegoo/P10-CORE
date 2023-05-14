var express = require('express');
var router = express.Router();

const postController = require('../controllers/post');
const userController = require('../controllers/user');
const sessionController = require('../controllers/session');

const multer = require('multer');
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {fileSize: 20 * 1024 * 1024}
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

/* GET author page. */
router.get('/author', (req, res, next) => {
  res.render('author');
});

/* Load post. */
router.param('postId', postController.load);

/* GET /posts/:postID/attachment */
router.get('/posts/:postId(\\d+)/attachment', postController.attachment);

/* GET /posts */
router.get('/posts', postController.index);

/* GET /posts/:postId */
router.get('/posts/:postId(\\d+)', postController.show);

/* GET /posts/new */
router.get('/posts/new', sessionController.loginRequired, postController.new);

/* POST /posts */
router.post('/posts', upload.single('image'), postController.create);

/* GET /posts/:postId/edit */
router.get('/posts/:postId(\\d+)/edit', sessionController.adminOrAuthorRequired, postController.edit);

/* GET /posts/:postId/update */
router.put('/posts/:postId(\\d+)', upload.single('image'), postController.update);

/* DELETE /posts/:postId */
router.delete('/posts/:postId(\\d+)', sessionController.adminOrAuthorRequired, postController.destroy);

// Autoload
router.param('userId', userController.load);

// Routes for the resource /users
router.get('/users', sessionController.adminRequired, userController.index);
router.get('/users/:userId(\\d+)', sessionController.adminOrMyselfRequired, userController.show);
router.get('/users/new', sessionController.adminRequired, userController.new);
router.post('/users', sessionController.adminRequired, userController.create);
router.get('/users/:userId(\\d+)/edit', sessionController.adminOrMyselfRequired, userController.edit);
router.put('/users/:userId(\\d+)', sessionController.adminOrMyselfRequired, userController.update);
router.delete('/users/:userId(\\d+)', sessionController.adminOrMyselfRequired, userController.destroy);

// Autologout
router.all('*',sessionController.deleteExpiredUserSession);

// Routes for the resource /session
router.get('/login',    sessionController.new);     // login form
router.post('/login',   sessionController.create);  // create sesion
router.delete('/login', sessionController.destroy); // close sesion

module.exports = router;