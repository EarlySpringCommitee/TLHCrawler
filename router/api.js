const express = require('express');
const router = express.Router();
const cors = require('cors');
const tlhcRequest = require('../TLHCrequest.js'); //請求模組

router.get('/', (req, res) => {
    res.render('api', {
        title: 'ㄉㄌㄐㄕ - API'
    })
});
router.get('/page', cors(), async (req, res) => {
    res.json(await tlhcRequest.getPage("http://web.tlhc.ylc.edu.tw/files/40-1001-15-1.php"))
});
router.get('/page/:id', cors(), async (req, res) => {
    let url = Base64.decode(req.params.id)
    if (url.match(/[0-9]*-[0-9]*-[0-9]*-[0-9]*\.php/)) {
        res.json(await tlhcRequest.getPage("http://web.tlhc.ylc.edu.tw/files/" + url))
    } else {
        res.status(404).send('error')
    }
});

router.get('/post/:id', cors(), async (req, res) => {
    let url = Base64.decode(req.params.id)
    if (url.match(/[0-9]*-[0-9]*-[0-9]*.+\.php/)) {
        res.json(await tlhcRequest.getPost("http://web.tlhc.ylc.edu.tw/files/" + url))
    } else {
        res.status(404).send('error')
    }
});
router.get('/search/', cors(), async (req, res) => {
    let page = req.query.page ? req.query.page : 1
    res.json(await tlhcRequest.searchPosts(req.query.keyword, page))
});

module.exports = router;