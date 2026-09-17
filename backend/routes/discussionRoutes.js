const express = require('express');
const router = express.Router();
const discussionController = require('../controllers/discussionController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.use(authenticateToken);

router.get('/', discussionController.getDiscussions);
router.post('/', discussionController.createMessage);

module.exports = router;
