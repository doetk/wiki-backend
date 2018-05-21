var express = require('express');
var router = express.Router();
var db = require('../queries');


router.get('/api/v1/pages', db.getAllPages);
router.get('/api/v1/pages/:id', db.getSinglePage);
router.get('/api/v1/pages/:id/current', db.getCurrentPage);
router.get('/api/v1/pages/:pageid/revisions/:revid', db.getRevisionPage);

//router.put('/api/v1/pages/:id', db.updatePage);
// application -------------------------------------------------------------
router.get('/', function (req, res) {
   // res.send('Yay!! Its working')
   res.render('index', {title: 'Pages Server is Up and Running'}); // load the single view file (angular will handle the page changes on the front-end)
});

module.exports = router;
