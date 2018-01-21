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
    baha = {
        '測試測試': 'https://www.facebook.com/',
        'ㄉㄌㄐㄕ': 'http://localhost:3000/tlhc',
        'ㄅㄏ': 'http://localhost:3000/baha'
    }
    res.render('index', { title: '使春延期', message: 'owowo', baha: baha })
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
app.get('/tlhc', function(req, res) {
    request({
        url: "http://web.tlhc.ylc.edu.tw/files/40-1001-15-1.php",
        method: "GET"
    }, function(e, r, b) {
        /* e: 錯誤代碼 */
        /* b: 傳回的資料內容 */
        if (e || !b) { return; }
        var $ = cheerio.load(b);
        const tlhcData = []; //*[@id="Dyn_2_2"]/div/div[2]/div/div/div/table/tbody/tr[1]/td[1]
        var tag = $("#Dyn_2_2 .md_middle table tbody tr td:nth-child(1)");
        var title = $("#Dyn_2_2 .md_middle table tbody tr td:nth-child(2)");
        var link = $("#Dyn_2_2 .md_middle table tbody tr td:nth-child(2) a");
        var date = $("#Dyn_2_2 .md_middle table tbody tr td:nth-child(3)");
        for (var i = 0; i < tag.length; i++) {
            var preJoin = {
                'tag': $(tag[i]).text(),
                'title': $(title[i]).text(),
                'link': '/tlhc/' + $(link[i]).attr('href').split("/")[4],
                'date': $(date[i]).text()
            }
            console.log($(link[i]).attr('href').split("/"))
            tlhcData.push(preJoin);
        }
        res.render('tlhc', { title: 'ㄉㄌㄐㄕ', tlhc: tlhcData })
    });
});
app.get('/tlhc/:id', function(req, res) {
    //res.send('USER ' + req.params.id);
    request({
        url: "http://web.tlhc.ylc.edu.tw/files/" + req.params.id,
        method: "GET"
    }, function(e, r, b) {
        /* e: 錯誤代碼 */
        /* b: 傳回的資料內容 */
        if (e || !b) { return; }
        var $ = cheerio.load(b);
        var tlhcData = []; //*[@id="Dyn_2_2"]/div/div[2]/div/div/div/table/tbody/tr[1]/td[1]
        var title = $("#Dyn_2_2 .h4.item-title").text();
        var content = $("#Dyn_2_2 .ptcontent tr td:nth-child(2)").text();
        var date = $("#Dyn_2_2 .md_middle table tbody tr td:nth-child(3)").text();
        var tlhcData = [{
            'title': title,
            'content': content,
            'date': date,
        }]
        res.render('tlhc-view', { title: 'ㄉㄌㄐㄕ', tlhc: tlhcData })
    });
});

app.listen(3000, function() {
    console.log("working on http://localhost:3000")
})