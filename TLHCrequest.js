//
//  基本設定
//
const request = require("request"); // HTTP 客戶端輔助工具
function doRequest(url) {
    return new Promise(function(resolve, reject) {
        request(url, function(error, res, body) {
            if (!error && res.statusCode == 200) {
                resolve(body);
            } else {
                reject(error);
            }
        });
    });
}
const cheerio = require("cheerio"); // Server 端的 jQuery 實作
const excerpt = require("html-excerpt"); // 取摘要
const Base64 = require('js-base64').Base64; // Base64
const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:60.0) Gecko/20100101 CuteDick/60.0';
const moment = require('moment'); // 時間處理
moment.locale('zh-tw');

// 獲取頁面
exports.getPage = async function(url, pageID, res) {
    //請求
    let PageData = await doRequest({
        url: url,
        method: "GET",
        headers: { 'User-Agent': userAgent }
    });
    //沒拿到資料
    if (!PageData) {
        res.render('error', { title: '錯誤 - 404', message: '看來我們找不到您要的東西' })
        return;
    }
    //可能是文章模板
    if (PageData.indexOf('資料群組') == -1 && PageData.indexOf('標題') == -1 && PageData.indexOf('日期') == -1) {
        res.render('error', {
            title: '錯誤 - 這不是一個目錄頁面',
            message: '也許你該試試下面的連結',
            button: '嘗試使用文章模板',
            buttonLink: '/tlhc/post/' + Base64.encodeURI(pageID)
        })
        return;
    }
    var $ = cheerio.load(PageData);

    var author = $("#Dyn_2_2 .md_middle table tbody tr td:nth-child(1)");
    var title = $("#Dyn_2_2 .md_middle table tbody tr td:nth-child(2)");
    var link = $("#Dyn_2_2 .md_middle table tbody tr td:nth-child(2) a");
    var date = $("#Dyn_2_2 .md_middle table tbody tr td:nth-child(3)");
    var pages = $(".navigator-inner a.pagenum");

    var pgTitle = 'ㄉㄌㄐㄕ - ' + $('#Dyn_2_1 .md_middle .mm_01 a.path:nth-child(2)').html()

    var pgid = pageID.split("-")[2]
    if (pgid == 246) {
        // 這頁不知道為啥一直出錯 Orz
        // http://web.tlhc.ylc.edu.tw/files/11-1004-246-2.php
        res.status(404).render('error', { title: '錯誤 - 404', message: '看來我們找不到您要的東西' })
        return
    }
    // 獲取頁碼
    var pageData = [];
    for (var i = 0; i < pages.length; i++) {
        var preJoin = {
            'text': $(pages[i]).text(),
            'link': Base64.encodeURI($(pages[i]).attr('href').split("/")[4]),
        }
        pageData.push(preJoin);
    }
    // 獲取文章
    var tlhcData = [];
    for (var i = 0; i < author.length; i++) {
        let time = moment($(date[i]).text().trim(), 'YYYY/MM/DD').utcOffset("+08:00").fromNow()
        var preJoin = {
            'tags': [time, $(author[i]).text().trim(), $(date[i]).text().trim()],
            'title': $(title[i]).text().replace(/\n/g, ''),
            'link': '/tlhc/post/' + Base64.encodeURI($(link[i]).attr('href').split("/files/")[1]),
        }
        tlhcData.push(preJoin);
    }
    res.render('tlhc', { title: pgTitle, tlhc: tlhcData, pages: pageData, originalURL: url })
        /*var ajaxcode = $('#Dyn_2_2 script[language="javascript"]').html()
        if (ajaxcode.indexOf('divOs.openSajaxUrl("Dyn_2_2"') > -1) {
            //這是需要 post 請求的頁面
            ajaxcode = ajaxcode.split("'")[1]
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
            })
        }*/
};
// 獲取文章
exports.getPost = async function(url, pageID, res) {

    //請求
    let PostData = await doRequest({
        url: url,
        method: "GET",
        headers: { 'User-Agent': userAgent }
    });

    //沒資料
    if (!PostData) {
        res.render('error', { title: '錯誤 - 404', message: '看來我們找不到您要的東西' })
        return;
    }
    //可能是目錄
    if (PostData.indexOf('資料群組') != -1 && PostData.indexOf('標題') != -1 && PostData.indexOf('日期') != -1) {
        res.render('error', {
            title: '錯誤 - 這不是一個文章頁面',
            message: '也許你該試試下面的連結',
            button: '嘗試使用目錄模板',
            buttonLink: '/tlhc/pages/' + pageID
        })
        return;
    }
    var $ = cheerio.load(PostData);
    var title = $('title').text().replace(/- 國立斗六高級家事商業職業學校/, '')
    var headerTitle = excerpt.text(title, 25, '...')
        //設定內容範圍
    var ajaxcode = $('#Dyn_2_2 script[language="javascript"]').html()
    if (ajaxcode && ajaxcode.indexOf('divOs.openSajaxUrl("Dyn_2_2"') > -1) {
        ajaxcode = ajaxcode.split("'")[1];
        //這是需要 post 請求的頁面

        let ajaxData = await doRequest({
            url: "http://web.tlhc.ylc.edu.tw" + ajaxcode,
            form: {
                rs: 'sajaxSubmit'
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:60.0) Gecko/20100101 CuteDick/60.0',
            }
        });

        var $ = cheerio.load(ajaxData);
        var content = $("Content").html();

    } else {
        if ($("#Dyn_2_2 .ptcontent tr td.imagetd+td[valign=\"top\"] tr td:empty+td:nth-child(2)").html())
            var content = $("#Dyn_2_2 .ptcontent tr td.imagetd+td[valign=\"top\"] tr td:nth-child(2)").html().trim();
        else if ($("#Dyn_2_2 .ptcontent tr td.imagetd+td[valign=\"top\"]").html())
            var content = $("#Dyn_2_2 .ptcontent tr td.imagetd+td[valign=\"top\"]").html().trim();
        else
            var content = $("#Dyn_2_2 .ptcontent").html().trim();
    }
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
        'content': content
    }
    res.render('tlhc-view', {
        title: 'ㄉㄌㄐㄕ - ' + title,
        tlhc: tlhcData,
        files: fileData,
        originalURL: url,
        headerTitle: headerTitle
    })
};
// 搜尋
exports.search = async function(search, res, page) {
    if (page == "1") {
        var SearchData = await doRequest({
            url: "http://web.tlhc.ylc.edu.tw/bin/ptsearch.php",
            method: "POST",
            form: {
                SchKey: search,
                search: "search"
            },
            headers: { 'User-Agent': userAgent }
        });
    } else {
        var SearchData = await doRequest({
            url: 'http://www.tlhc.ylc.edu.tw/bin/ptsearch.php?P=' + page + '&T=66&wc=a%3A3%3A{s%3A3%3A%22Key%22%3Bs%3A6%3A%22' + encodeURIComponent(search) + '%22%3Bs%3A8%3A%22pagesize%22%3Bs%3A2%3A%2210%22%3Bs%3A3%3A%22Rcg%22%3Bi%3A0%3B}',
            method: "GET",
            headers: { 'User-Agent': userAgent }
        });
    }
    var $ = cheerio.load(SearchData);
    //var table = $(".baseTB.list_TIDY");
    //文章內容
    var tlhcData = [];
    var header = $(".baseTB.list_TIDY tr>td.mc .h5 a");
    var content = $(".baseTB.list_TIDY tr>td.mc .message");
    if (content == undefined) {
        res.render('tlhc-search', { title: 'ㄉㄌㄐㄕ - 搜尋' })
        return
    }
    for (var i = 0; i < header.length; i++) {
        var preJoin = {
            'header': $(header[i]).text(),
            'content': $(content[i]).text(),
            'link': '/tlhc/post/' + Base64.encodeURI($(header[i]).attr('href').split("/")[4])
        }
        tlhcData.push(preJoin);
    }
    //換頁導航
    var pageData = [];
    var pages = $(".navigator-inner a.pagenum");
    for (var i = 0; i < pages.length; i++) {
        var preJoin = {
            'text': $(pages[i]).text(),
            'link': $(pages[i]).attr('href').match(/\d+/)[0],
        }
        pageData.push(preJoin);
    }
    res.render('tlhc-search', {
        title: 'ㄉㄌㄐㄕ - 搜尋：' + search,
        tlhc: tlhcData,
        pages: pageData,
        search: search
    })
};