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
router.get('/posts/new', postController.new);

/* POST /posts */
router.post('/posts', upload.single('image'), postController.create);

/* GET /posts/:postId/edit */
router.get('/posts/:postId(\\d+)/edit', postController.edit);

/* GET /posts/:postId/update */
router.put('/posts/:postId(\\d+)', upload.single('image'), postController.update);

/* DELETE /posts/:postId */
router.delete('/posts/:postId(\\d+)', postController.destroy);

// Autoload
router.param('userId', userController.load);

// Routes for the resource /users
router.get('/',                    userController.index);
router.get('/:userId(\\d+)',      userController.show);
router.get('/new',                userController.new);
router.post('/',                   userController.create);
router.get('/:userId(\\d+)/edit', userController.edit);
router.put('/:userId(\\d+)',      userController.update);
router.delete('/:userId(\\d+)',   userController.destroy);

// autologout
router.all('*',sessionController.deleteExpiredUserSession);

// Routes for the resource /session
router.get('/login',    sessionController.new);     // login form
router.post('/login',   sessionController.create);  // create sesion
router.delete('/login', sessionController.destroy); // close sesion

module.exports = router;