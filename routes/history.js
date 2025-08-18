const express = require('express');
const router = express.Router();
const {isAuthenticated , restrictToAuthenticated} = require('../middleware/auth');
const {saveHistory,getHistory,shareHistory ,deleteAllHistory, deleteHistory} = require('../controller/history');


// History routes (all protected by authMiddleware)
router.post('/save',isAuthenticated, restrictToAuthenticated , saveHistory);
router.get('/get',isAuthenticated,restrictToAuthenticated, getHistory,); // Get user's manual history
router.delete('/:id', isAuthenticated, restrictToAuthenticated,   deleteHistory);//if use params then herre deleteaaanitem/:id
router.delete('/',isAuthenticated , restrictToAuthenticated,  deleteAllHistory); // Delete all history for user
router.post('/share',isAuthenticated, restrictToAuthenticated,  shareHistory); // Share history

module.exports = router;


