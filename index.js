// 載入
var fs = require('fs'); //檔案系統
var jsonfile = require('jsonfile'); //讀 json 的咚咚
var request = require("request"); // HTTP 客戶端輔助工具
var cheerio = require("cheerio"); // Server 端的 jQuery 實作
var express = require('express'); // Node.js Web 架構

var app = express()
app.set('views', __dirname + '/views');
app.set('view engine', 'pug')

app.get('/', function(req, res) {
    links = {
        '校園公告': 'tlhc/pages/40-1001-15-1.php',
    }
    res.render('index', { title: '這是首頁', links: links })
})

// ㄉㄌㄐㄕ
app.get('/tlhc/pages/:id', function(req, res) {
    request({
        url: "http://web.tlhc.ylc.edu.tw/files/" + req.params.id,
        method: "GET"
    }, function(e, r, b) {
        /* e: 錯誤代碼 */
        /* b: 傳回的資料內容 */
        if (e || !b) { return; }
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
                'link': '/tlhc/post/' + $(link[i]).attr('href').split("/")[4],
                'date': $(date[i]).text()
            }
            tlhcData.push(preJoin);
        }
        res.render('tlhc', { title: pgTitle, tlhc: tlhcData, pages: pageData })
    });
});

app.get('/tlhc/post/:id', function(req, res) {
    //res.send('USER ' + req.params.id);
    request({
        url: "http://web.tlhc.ylc.edu.tw/files/" + req.params.id,
        method: "GET"
    }, function(e, r, b) {
        /* e: 錯誤代碼 */
        /* b: 傳回的資料內容 */
        if (e || !b) { return; }
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
        res.render('tlhc-view', { title: 'ㄉㄌㄐㄕ', tlhc: tlhcData, files: fileData })
    });
});
app.get('/tlhc/search/:id', function(req, res) {
    //res.send('USER ' + req.params.id);
    console.log(req.params.id)
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

app.listen(3000, function() {
    console.log("working on http://localhost:3000")
})