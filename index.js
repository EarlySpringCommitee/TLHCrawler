// 載入
const fs = require('fs'); //檔案系統
const jsonfile = require('jsonfile'); //讀 json 的咚咚
const request = require("request"); // HTTP 客戶端輔助工具
const cheerio = require("cheerio"); // Server 端的 jQuery 實作
const express = require('express'); // Node.js Web 架構
const bodyParser = require('body-parser'); // 讀入 post 請求
const session = require('express-session');
const iconv = require('iconv-lite'); // ㄐㄅ的編碼處理
const app = express()

app.set('views', __dirname + '/views');
app.set('view engine', 'pug')
app.use(bodyParser.urlencoded({
    extended: true
})); //拿餅乾
app.use(session({
    secret: 'ㄐㄐ讚',
    resave: false,
    saveUninitialized: false
})); //發餅乾
app.use('/js', express.static('js'))
app.use('/css', express.static('css'))
    //設定 /js 及 /css 目錄

app.get('/', function(req, res) {
    links = [{
        'header': '校園公告',
        'description': '好像很重要，又沒那麼重要',
        'link': '/tlhc/pages/40-1001-15-1.php'
    }, {
        'header': '榮譽榜',
        'description': '實際上沒人去看的東西，只會害你升旗站更久',
        'link': '/tlhc/pages/40-1001-38-1.php'
    }, {
        'header': '轉知資訊-政令宣導',
        'description': '一些比賽跟你完全不會想點進去看的東西',
        'link': '/tlhc/pages/40-1001-29-1.php'
    }, {
        'header': '圖書館公告',
        'description': '消失在學校網頁上ㄉ圖書館公告',
        'link': '/tlhc/pages/40-1001-21-1.php'
    }, {
        'header': '獎助學金公告',
        'description': '能拿錢的情報',
        'link': '/tlhc/pages/40-1001-30-1.php'
    }, {
        'header': '教務處公告',
        'description': '招生考試之類的',
        'link': '/tlhc/pages/40-1001-28-1.php'
    }]
    res.render('index', { title: 'ㄉㄌㄐㄕ - 公告', links: links })
})

// ㄉㄌㄐㄕ
app.get('/tlhc/pages/:id', function(req, res) {
    var originalURL = "http://web.tlhc.ylc.edu.tw/files/" + req.params.id
    request({
        url: originalURL,
        method: "GET"
    }, function(e, r, b) {
        /* e: 錯誤代碼 */
        /* b: 傳回的資料內容 */
        if (e || !b) {
            res.render('error', { title: '錯誤 - 404', message: '看來我們找不到您要的東西' })
            return;
        }
        var $ = cheerio.load(b);
        var tlhcData = [];
        var pageData = [];
        var tag = $("#Dyn_2_2 .md_middle table tbody tr td:nth-child(1)");
        var title = $("#Dyn_2_2 .md_middle table tbody tr td:nth-child(2)");
        var link = $("#Dyn_2_2 .md_middle table tbody tr td:nth-child(2) a");
        var date = $("#Dyn_2_2 .md_middle table tbody tr td:nth-child(3)");
        var pages = $(".navigator-inner a.pagenum");

        var pgid = req.params.id.split("-")[2]
        var pgTitle = 'ㄉㄌㄐㄕ'

        if (pgid == 15) { var pgTitle = pgTitle + " - 校園公告" }
        if (pgid == 29) { var pgTitle = pgTitle + " - 轉知資訊 / 政令宣導" }
        if (pgid == 30) { var pgTitle = pgTitle + " - 獎助學金公告" }
        if (pgid == 28) { var pgTitle = pgTitle + " - 教務處公告" }
        if (pgid == 38) { var pgTitle = pgTitle + " - 榮譽榜" }
        if (pgid == 21) { var pgTitle = pgTitle + " - 圖書館公告" }
        if (pgid == 66) { var pgTitle = pgTitle + " - 資處科公告" }
        if (pgid == 246) {
            // 這頁不知道為啥一直出錯 Orz
            // http://web.tlhc.ylc.edu.tw/files/11-1004-246-2.php
            res.status(404).render('error', { title: '錯誤 - 404', message: '看來我們找不到您要的東西' })
            return
        }

        for (var i = 0; i < pages.length; i++) {
            var preJoin = {
                'text': $(pages[i]).text(),
                'link': $(pages[i]).attr('href').split("/")[4],
            }
            pageData.push(preJoin);
        }

        for (var i = 0; i < tag.length; i++) {
            var preJoin = {
                'tag': $(tag[i]).text(),
                'title': $(title[i]).text(),
                'link': '/tlhc/post/' + $(link[i]).attr('href').split("/files/")[1],
                'date': $(date[i]).text()
            }
            tlhcData.push(preJoin);
        }
        res.render('tlhc', { title: pgTitle, tlhc: tlhcData, pages: pageData, originalURL: originalURL })
    });
});

app.get('/tlhc/post/:id', function(req, res) {
    //res.send('USER ' + req.params.id);
    var originalURL = "http://web.tlhc.ylc.edu.tw/files/" + req.params.id
    request({
        url: originalURL,
        method: "GET"
    }, function(e, r, b) {
        /* e: 錯誤代碼 */
        /* b: 傳回的資料內容 */
        if (e || !b) {
            res.render('error', { title: '錯誤 - 404', message: '看來我們找不到您要的東西' })
            return;
        }
        var $ = cheerio.load(b);
        var tlhcData = [];
        var title = $("#Dyn_2_2 .h4.item-title").text();
        var content = $("#Dyn_2_2 .ptcontent tr td:nth-child(2)").html();
        var view = $(".PtStatistic span").text();
        var files = $('.baseTB a');
        var fileData = [];
        for (var i = 0; i < files.length; i++) {
            if ($(files[i]).text() != "下載附件") {
                var preJoin = {
                    'name': $(files[i]).text(),
                    'file': 'http://web.tlhc.ylc.edu.tw' + $(files[i]).attr('href'),
                }
                fileData.push(preJoin);
            }
        }

        var tlhcData = [{
            'title': title,
            'content': content,
            'view': view,
        }]
        res.render('tlhc-view', { title: 'ㄉㄌㄐㄕ', tlhc: tlhcData, files: fileData, originalURL: originalURL })
    });
});

app.get('/tlhc/search/:id', function(req, res) {
    request.post({
        url: "http://www.tlhc.ylc.edu.tw/bin/ptsearch.php?" + req.params.id,
        form: {
            SchKey: req.params.id,
            search: 'search'
        }
    }, function(e, r, b) {
        /* e: 錯誤代碼 */
        /* b: 傳回的資料內容 */
        if (e || !b) { return; }
        var $ = cheerio.load(b);
        var tlhcData = [];
        var pageData = [];
        var table = $(".baseTB.list_TIDY");
        var header = $(".baseTB.list_TIDY tr>td.mc .h5 a");
        var content = $(".baseTB.list_TIDY tr>td.mc .message");
        var pages = $(".navigator-inner a.pagenum");
        if (content == undefined) {
            res.render('tlhc-search', { title: 'ㄉㄌㄐㄕ - 搜尋' })
            return
        }
        for (var i = 0; i < header.length; i++) {
            var preJoin = {
                'header': $(header[i]).text(),
                'content': $(content[i]).text(),
                'link': '/tlhc/post/' + $(header[i]).attr('href').split("/")[4]
            }
            tlhcData.push(preJoin);
        }
        for (var i = 0; i < pages.length; i++) {
            var preJoin = {
                'text': $(pages[i]).text(),
                'link': $(pages[i]).attr('href').split("?")[1],
            }
            pageData.push(preJoin);
        }
        res.render('tlhc-search', { title: 'ㄉㄌㄐㄕ - 搜尋', tlhc: tlhcData, pages: pageData })
    });
});
app.get('/tlhc/login/', function(req, res) {
    res.render('login', { title: 'ㄉㄌㄐㄕ - 登入', post: '/tlhc/login/' });
});
app.post('/tlhc/login/', function(req, res) {
    getCookie(req, res)
});
app.get('/tlhc/score/', function(req, res) {
    if (req.session.tlhc) {
        getScore(req.session.tlhc, res)
    } else {
        res.redirect("/tlhc/login/")
    }
});
app.get('/tlhc/day/', function(req, res) {
    if (req.session.tlhc) {
        getDay(req.session.tlhc, res)
    } else {
        res.redirect("/tlhc/login/")
    }
});

function getCookie(req, res) {
    var userID = req.body['userID']
    var userPASS = req.body['userPASS']
    request.post({
        url: "http://register.tlhc.ylc.edu.tw/hcode/login.asp",
        form: {
            txtID: userID,
            txtPWD: userPASS,
            'login_r7_c5.x': 0,
            'login_r7_c5.y': 0,
            Chk: 'Y'
        }
    }, function(e, r, b) {
        // 錯誤代碼 
        // 傳回的資料內容 
        if (e || !b) { return; }
        req.session.tlhc = r.headers['set-cookie'];
        request({
            url: "http://register.tlhc.ylc.edu.tw/hcode/STD_SCORE.asp",
            method: "GET",
            encoding: null,
            headers: {
                //some header
                'Cookie': r.headers['set-cookie'],
                //some header
            }
        }, function(e, r, b) {
            /* e: 錯誤代碼 */
            /* b: 傳回的資料內容 */
            var b = iconv.decode(b, 'Big5');
            if (e || !b) { return; }
            if (b == '無權使用 請登入') {
                res.render('login', { title: 'ㄉㄌㄐㄕ - 登入', post: '/tlhc/login/', message: '請檢查輸入的學號及身分證字號是否正確' });
                return
            } else {
                res.render('login-sucess', { title: 'ㄉㄌㄐㄕ - 登入成功' });
            }
        });
        //一開始用帳密跟學校換餅乾
        //然後餅乾存在 session 裡面
    });

}

function getScore(cookie, res) {
    request({
        url: "http://register.tlhc.ylc.edu.tw/hcode/STD_SCORE.asp",
        method: "GET",
        encoding: null,
        headers: {
            //some header
            'Cookie': cookie,
            //some header
        }
    }, function(e, r, b) {
        /* e: 錯誤代碼 */
        /* b: 傳回的資料內容 */
        var b = iconv.decode(b, 'Big5');
        if (e || !b) { return; }
        if (b == '無權使用 請登入') {
            res.redirect("/tlhc/login/")
            return
        }
        var $ = cheerio.load(b);
        var user = {
            id: $("form[action=\"STD_SCORE.asp\"] table .DataTD:nth-child(2) .DataFONT").text(),
            name: $("form[action=\"STD_SCORE.asp\"] table .DataTD:nth-child(4) .DataFONT").text(),
            class: $("form[action=\"STD_SCORE.asp\"] table .DataTD:nth-child(6) .DataFONT").text(),
            num: $("form[action=\"STD_SCORE.asp\"] table .DataTD:nth-child(8) .DataFONT").text(),
        }

        var score = $("body>center>table:nth-child(3) td>table>tbody")
        var total = $("body>center>table:nth-child(4) td>table>tbody")
        res.render('score-view', { title: 'ㄉㄌㄐㄕ - 成績', user: user, score: score.html(), total: total.html() });
    });
}

function getDay(cookie, res) {
    request({
        url: "http://register.tlhc.ylc.edu.tw/hcode/STD_DAY.asp",
        method: "GET",
        encoding: null,
        headers: {
            //some header
            'Cookie': cookie,
            //some header
        }
    }, function(e, r, b) {
        /* e: 錯誤代碼 */
        /* b: 傳回的資料內容 */
        var b = iconv.decode(b, 'Big5');
        if (e || !b) { return; }
        if (b == '無權使用 請登入') {
            res.redirect("/tlhc/login/")
            return
        }
        var $ = cheerio.load(b);
        var user = {
            id: $("form[action=\"STD_DAY.asp\"] table .DataTD:nth-child(2) .DataFONT").text(),
            name: $("form[action=\"STD_DAY.asp\"] table .DataTD:nth-child(4) .DataFONT").text(),
            class: $("form[action=\"STD_DAY.asp\"] table .DataTD:nth-child(6) .DataFONT").text(),
            num: $("form[action=\"STD_DAY.asp\"] table .DataTD:nth-child(8) .DataFONT").text(),
        }
        var day = $("body>center>table:nth-child(3)>tbody>tr>td>table>tbody")
        res.render('day-view', { title: 'ㄉㄌㄐㄕ - 出勤', user: user, day: day.html() });
    });
}

app.get('/tlhc/score/logout', function(req, res) {
    req.session.destroy()
    res.redirect("/tlhc/score/")
}); // 登出

app.use(function(req, res, next) {
    res.status(404).render('error', { title: '錯誤 - 404', message: '看來我們找不到您要的東西' })
});
app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500).render('error', { title: '錯誤 - 500', message: '看來工程師不小心打翻了香菇雞湯' })
}); // error

app.listen(3000, () => console.log("working on http://localhost:3000"))