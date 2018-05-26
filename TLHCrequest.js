//
//  基本設定
//
const request = require("request"); // HTTP 客戶端輔助工具
const cheerio = require("cheerio"); // Server 端的 jQuery 實作
const excerpt = require("html-excerpt"); // 取摘要
const Base64 = require('js-base64').Base64; // Base64
const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:60.0) Gecko/20100101 CuteDick/60.0';
// 獲取頁面
exports.getPage = function(url, pageID, res) {
    request({
        url: url,
        method: "GET",
        headers: {
            'User-Agent': userAgent,
        }
    }, (e, r, b) => {
        /* e: 錯誤代碼 */
        /* b: 傳回的資料內容 */
        if (e || !b) {
            res.render('error', { title: '錯誤 - 404', message: '看來我們找不到您要的東西' })
            return;
        }
        if (b.indexOf('資料群組') == -1 && b.indexOf('標題') == -1 && b.indexOf('日期') == -1) {
            res.render('error', {
                title: '錯誤 - 這不是一個目錄頁面',
                message: '也許你該試試下面的連結',
                button: '嘗試使用文章模板',
                buttonLink: '/tlhc/post/' + req.params.id
            })
            return;
        }
        var $ = cheerio.load(b);
        var ajaxcode = $('#Dyn_2_2 script[language="javascript"]').html()
        if (ajaxcode.indexOf('divOs.openSajaxUrl("Dyn_2_2"') > -1) {
            ajaxcode = ajaxcode.split("'")[1]
            console.log(ajaxcode)
                //這是需要 post 請求的頁面
            request.post({
                url: "http://web.tlhc.ylc.edu.tw" + ajaxcode,
                form: {
                    rs: 'sajaxSubmit'
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:60.0) Gecko/20100101 CuteDick/60.0',
                }
            }, function(e, r, b) {
                // 錯誤代碼 
                // 傳回的資料內容 
                if (e || !b) { return }
                console.log(b)
            })
        }
        var tlhcData = [];
        var pageData = [];
        var tag = $("#Dyn_2_2 .md_middle table tbody tr td:nth-child(1)");
        var title = $("#Dyn_2_2 .md_middle table tbody tr td:nth-child(2)");
        var link = $("#Dyn_2_2 .md_middle table tbody tr td:nth-child(2) a");
        var date = $("#Dyn_2_2 .md_middle table tbody tr td:nth-child(3)");
        var pages = $(".navigator-inner a.pagenum");

        var pgid = pageID.split("-")[2]
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
                'link': Base64.encodeURI($(pages[i]).attr('href').split("/")[4]),
            }
            pageData.push(preJoin);
        }

        for (var i = 0; i < tag.length; i++) {
            var preJoin = {
                'tag': $(tag[i]).text().replace(/\n/g, ''),
                'title': $(title[i]).text().replace(/\n/g, ''),
                'link': '/tlhc/post/' + Base64.encodeURI($(link[i]).attr('href').split("/files/")[1]),
                'date': $(date[i]).text().replace(/\n/g, '')
            }
            tlhcData.push(preJoin);
        }
        res.render('tlhc', { title: pgTitle, tlhc: tlhcData, pages: pageData, originalURL: url })
    });
};
// 獲取文章
exports.getPost = function(url, pageID, res) {
    request({
        url: url,
        method: "GET",
        headers: {
            'User-Agent': userAgent,
        }
    }, (e, r, b) => {
        /* e: 錯誤代碼 */
        /* b: 傳回的資料內容 */
        if (e || !b) {
            res.render('error', { title: '錯誤 - 404', message: '看來我們找不到您要的東西' })
            return;
        }
        if (b.indexOf('資料群組') != -1 && b.indexOf('標題') != -1 && b.indexOf('日期') != -1) {
            res.render('error', {
                title: '錯誤 - 這不是一個文章頁面',
                message: '也許你該試試下面的連結',
                button: '嘗試使用目錄模板',
                buttonLink: '/tlhc/pages/' + pageID
            })
            return;
        }

        var $ = cheerio.load(b);
        var title = $('title').text().replace(new RegExp('- 國立斗六高級家事商業職業學校', "g"), '')
        var headerTitle = excerpt.text(title, 25, '...')
        var view = $(".PtStatistic span").text()

        var ajaxcode = $('#Dyn_2_2 script[language="javascript"]').html()
        if (ajaxcode.indexOf('divOs.openSajaxUrl("Dyn_2_2"') > -1) {
            ajaxcode = ajaxcode.split("'")[1]
            console.log(ajaxcode)
                //這是需要 post 請求的頁面
            request.post({
                url: "http://web.tlhc.ylc.edu.tw" + ajaxcode,
                form: {
                    rs: 'sajaxSubmit'
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:60.0) Gecko/20100101 CuteDick/60.0',
                }
            }, function(e, r, b) {
                // 錯誤代碼 
                // 傳回的資料內容 
                if (e || !b) { return }
                console.log(b)
                var $ = cheerio.load(b);
                var content = $("Content").html();
            })
        } else {
            var content = $("#Dyn_2_2 .ptcontent tr td:nth-child(2)").html();
            if (content == null)
                var content = $("#Dyn_2_2 .ptcontent").html();
            if (content && content.indexOf('http://web.tlhc.ylc.edu.tw/files/') > -1) {
                content = content.replace(new RegExp('http://web.tlhc.ylc.edu.tw/files/', "g"), '/tlhc/post/')
            }
        }
        var content = content.replace(/\n/g, '')
        console.log(content)
            //var tlhcData = [];

        var files = $('.baseTB a');
        var fileData = [];
        for (var i = 0; i < files.length; i++) {
            if ($(files[i]).text() != "下載附件") {
                var file = $(files[i]).attr('href')
                if ($(files[i]).attr('href') == 'javascript:void(0)') {
                    var file = $(files[i]).attr('onclick').split("'")[3]
                }
                var preJoin = {
                    'name': $(files[i]).text(),
                    'file': 'http://web.tlhc.ylc.edu.tw' + file,
                    'type': file.split(".")[1],
                }
                fileData.push(preJoin);
            }
        }

        var tlhcData = {
            'title': title,
            'content': content,
            'view': view,
        }
        res.render('tlhc-view', {
            title: 'ㄉㄌㄐㄕ - ' + title,
            tlhc: tlhcData,
            files: fileData,
            originalURL: url,
            view: view,
            headerTitle: headerTitle
        })
    });
};
// 搜尋
exports.search = function(search, res) {
    request.post({
        url: "http://www.tlhc.ylc.edu.tw/bin/ptsearch.php?" + search,
        form: {
            SchKey: search,
            search: 'search'
        },
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:60.0) Gecko/20100101 CuteDick/60.0',
        }
    }, (e, r, b) => {
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
        res.render('tlhc-search', {
            title: 'ㄉㄌㄐㄕ - 搜尋',
            tlhc: tlhcData,
            pages: pageData
        })
    });
};