var express = require('express');
var router = express.Router();

const postController = require('../controllers/post');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

/* GET author page. */
router.get('/author', (req, res, next) => {
  res.render('author');
});

/* P7 - Tarea 4: load */
router.param('postId', postController.load);

/* P7 - Tarea 5: GET /posts/:postID/attachment */
router.get('/posts/:postId(\\d+)/attachment', postController.attachment);

/* P7 - Tarea 6: GET /posts */
router.get('/posts', postController.index);

/* P7 - Tarea 7: GET /posts/:postId */
router.get('/posts/:postId(\\d+)', postController.show);

/* P7 - Tarea 8.1: GET /posts/new */
router.get('/posts/new', postController.new);

/* P6 - Tarea 8.2: POST /posts */
router.post('/posts', upload.single('image'), postController.create);

/* P6 - Tarea 8.3: GET /posts/:postId/edit */
router.get('/posts/:postId(\\d+)/edit', postController.edit);

/* P6 - Tarea 8.4: GET /posts/:postId/update */
router.put('/posts/:postId(\\d+)', upload.single('image'), postController.update);

/* P6 - Tarea 8.5: DELETE /posts/:postId */
router.delete('/posts/:postId(\\d+)', postController.destroy);

module.exports = router;