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

module.exports = router;