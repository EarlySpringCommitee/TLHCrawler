const express = require('express');
const router = express.Router();
const tlhcScore = require('../TLHCScore.js'); //成績系統模組
// 登入
router
    .get('/login/', (req, res) => {
        req.session.tlhc ?
            res.redirect("/system/score/") :
            res.render('s-login', {
                title: 'ㄉㄌㄐㄕ - 登入',
                post: '/tlhc/login/',
                system: true
            })
    })
    .post('/login/', (req, res) => tlhcScore.getCookie(req, res));
// 登出
router.get('/logout', (req, res) => {
    req.session.destroy()
    res.redirect("/system/login/")
});
//------- 測試頁面
router.get('/test/', (req, res) => tlhcScore.getTestPage(req.session.tlhc, res, req));
// 有登入嗎
router.use((req, res, next) => {
    req.session.tlhc || req.path.split("/")[1] != "system" ? next() : res.redirect("/system/login/")
});
//------- 基本資料
router.get('/info/', (req, res) => tlhcScore.getInfoPage(req.session.tlhc, res, req));
//------- 成績
router.get('/score/', (req, res) => tlhcScore.getScorePage(req.session.tlhc, res, req));
//------- 出勤
router.get('/attendance/', (req, res) => tlhcScore.getAttendance(req.session.tlhc, res, req));
//------- 獎懲
router.get('/rewards/', (req, res) => tlhcScore.getRewardsPage(req.session.tlhc, res, req));
//------- 社團及幹部
router.get('/group/', (req, res) => tlhcScore.getGroupPage(req.session.tlhc, res, req));
//------- 瀏覽匯出資料
router.get('/csv/', (req, res) => tlhcScore.getCSV(req.session.tlhc, res, req));

module.exports = router;