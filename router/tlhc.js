const express = require('express');
const router = express.Router();
const tlhcRequest = require('../TLHCrequest.js'); //請求模組

router.get('/pages/:id', (req, res) => {
    let url = Base64.decode(req.params.id)
    if (url.match(/[0-9]*-[0-9]*-[0-9]*-[0-9]*\.php/)) {
        var originalURL = "http://web.tlhc.ylc.edu.tw/files/" + url
        tlhcRequest.sendPage(originalURL, Base64.decode(req.params.id), res)
    } else {
        res.status(404).render('error', {
            title: '錯誤 - 404',
            message: '看來我們找不到您要的東西'
        })
    }
});

router.get('/post/:id', (req, res) => {
    let url = Base64.decode(req.params.id)
    if (url.match(/[0-9]*-[0-9]*-[0-9]*.+\.php/)) {
        var originalURL = "http://web.tlhc.ylc.edu.tw/files/" + url
        tlhcRequest.sendPost(originalURL, Base64.decode(req.params.id), res)
    } else {
        res.status(404).render('error', {
            title: '錯誤 - 404',
            message: '看來我們找不到您要的東西'
        })
    }
});

router.get('/search/', (req, res) => {
    res.render('tlhc-search', {
        title: 'ㄉㄌㄐㄕ - 搜尋'
    })
});
router.get('/search/:id/:page', (req, res) => {
    tlhcRequest.sendSearch(req.params.id, res, req.params.page)
});

module.exports = router;