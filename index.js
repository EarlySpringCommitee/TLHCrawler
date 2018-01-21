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
        'ㄉㄌㄐㄕ': 'tlhc/pages/40-1001-15-1.php',
        'ㄅㄏ': 'baha'
    }
    res.render('index', { title: '使春延期', message: 'owowo', baha: links })
})

// ㄅㄏ爬蟲
app.get('/baha', function(req, res) {
    request({
        url: "https://ani.gamer.com.tw/",
        method: "GET"
    }, function(e, r, b) {
        /* e: 錯誤代碼 */
        /* b: 傳回的資料內容 */
        if (e || !b) { return; }
        var $ = cheerio.load(b);
        var resp = {};
        var titles = $(".newanime-title");
        var link = $(".newanime__content");
        var ep = $(".newanime .newanime-vol");
        for (var i = 0; i < 10; i++) {
            resp[$(titles[i]).text() + " " + $(ep[i]).text()] = $(link[i]).attr('href');
            console.log($(link[i]).attr('href'))
        }
        console.log(resp)
        res.render('index', { title: 'ㄅㄏ爬蟲', message: 'ㄅㄏ爬蟲', baha: resp })
    });
});

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
        for (var i = 0; i < pages.length; i++) {
            var preJoin = {
                'text': $(pages[i]).text(),
                'link': $(pages[i]).attr('href').split("/")[4],
            }
            pageData.push(preJoin);
        }
        console.log(pageData)
        for (var i = 0; i < tag.length; i++) {
            var preJoin = {
                'tag': $(tag[i]).text(),
                'title': $(title[i]).text(),
                'link': '/tlhc/post/' + $(link[i]).attr('href').split("/")[4],
                'date': $(date[i]).text()
            }
            tlhcData.push(preJoin);
        }
        res.render('tlhc', { title: 'ㄉㄌㄐㄕ', tlhc: tlhcData, pages: pageData })
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

app.listen(3000, function() {
    console.log("working on http://localhost:3000")
})