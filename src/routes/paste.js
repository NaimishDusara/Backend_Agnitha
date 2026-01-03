const express = require('express');
const router = express.Router();
const pasteController = require('../controllers/paste');

router.get('/api/healthz', pasteController.healthCheck);

router.post('/api/pastes', pasteController.createPaste);

router.get('/api/pastes/:id', pasteController.getPaste);

router.get('/p/:id', pasteController.viewPaste);

module.exports = router;