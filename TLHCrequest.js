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
                resolve(error);
            }
        });
    });
}
const cheerio = require("cheerio"); // Server 端的 jQuery 實作
const excerpt = require("html-excerpt"); // 取摘要
const Base64 = require('js-base64').Base64; // Base64
const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:60.0) Gecko/20100101 CuteDick/60.0';
const moment = require('moment-timezone'); // 時間處理
moment.locale('zh-tw');
moment.updateLocale('zh-tw', {
    relativeTime: {
        future: "in %s",
        past: "%s",
        h: "今天",
        hh: "今天",
        d: "今天",
        dd: "%d天前",
        M: "一個月前",
        MM: "%d個月前",
        y: "一年前",
        yy: "%d年前"
    }
});
moment.tz.setDefault("Asia/Taipei");

function numberToChinses(chnStr) {
    // 數字轉中文
    // 123 -> 一百二十三
    return chnStr.replace(/[0-9]+/g, match => require('number-to-chinese-words').toWords(match))
}
// 獲取頁面
exports.getPage = async function(url, pageID, res) {
    let data = await getPage(url)
    if (data == 404) return res.status(404).render('error', { title: '錯誤 - 404', message: '看來我們找不到您要的東西' })
    if (data == 'May be an article') return res.render('error', {
        title: '錯誤 - 這不是一個目錄頁面',
        message: '也許你該試試下面的連結',
        button: '嘗試使用文章模板',
        buttonLink: '/tlhc/post/' + Base64.encodeURI(pageID)
    })
    res.render('tlhc', { title: data.pageTitle, tlhc: data.posts, pages: data.pagination, originalURL: url })

};

async function getPage(url) { //請求
    let PageData = await doRequest({
        url: url,
        method: "GET",
        headers: { 'User-Agent': userAgent }
    });
    //沒拿到資料
    if (!PageData) return '404';
    //可能是文章模板
    if (!PageData.match(/資料群組|標題|日期/)) return 'May be an article';

    let $ = cheerio.load(PageData);

    let pageTitle = 'ㄉㄌㄐㄕ - ' + $('#Dyn_2_1 .md_middle .mm_01 a.path:nth-child(2)').text()
    let author = $("#Dyn_2_2 .md_middle table tbody tr td:nth-child(1)");
    let title = $("#Dyn_2_2 .md_middle table tbody tr td:nth-child(2)");
    let link = $("#Dyn_2_2 .md_middle table tbody tr td:nth-child(2) a");
    let date = $("#Dyn_2_2 .md_middle table tbody tr td:nth-child(3)");
    let pages = $(".navigator-inner a.pagenum");

    // 獲取頁碼
    let pagination = [];
    for (var i = 0; i < pages.length; i++) {
        pagination.push({
            'text': $(pages[i]).text(),
            'title': $(pages[i]).text(),
            'link': Base64.encodeURI($(pages[i]).attr('href').split("/")[4]),
            'url': $(pages[i]).attr('href'),
        });
    }
    // 獲取文章
    let posts = [];
    for (var i = 0; i < author.length; i++) {
        let time = numberToChinses(moment($(date[i]).text().trim(), 'YYYY/MM/DD').fromNow())
        posts.push({
            'author': $(author[i]).text().trim(),
            'datefromnow': time,
            'date': $(date[i]).text().trim(),
            'link': '/tlhc/post/' + Base64.encodeURI($(link[i]).attr('href').split("/files/")[1]),
            'tags': [time, $(author[i]).text().trim(), $(date[i]).text().trim()],
            'title': $(title[i]).text().replace(/\n/g, ''),
            'url': $(link[i]).attr('href'),
        });
    }
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
    return {
        "pagination": pagination,
        "posts": posts,
        "pageTitle": pageTitle
    }
}
// 獲取文章
exports.getPost = async function(url, pageID, res) {

    let data = await getPost(url)
    if (data == 404)
        return res.status(404).render('error', { title: '錯誤 - 404', message: '看來我們找不到您要的東西' })
    if (data == 'May be a directory')
        return res.render('error', {
            title: '錯誤 - 這不是一個文章頁面',
            message: '也許你該試試下面的連結',
            button: '嘗試使用目錄模板',
            buttonLink: '/tlhc/pages/' + pageID
        })
    res.render('tlhc-view', {
        title: 'ㄉㄌㄐㄕ - ' + data.title,
        tlhc: {
            'title': data.title,
            'content': data.content
        },
        files: data.files,
        originalURL: url,
        headerTitle: excerpt.text(data.title, 25, '...')
    })
};

async function getPost(url) { //請求
    //請求
    let PostData = await doRequest({
        url: url,
        method: "GET",
        headers: { 'User-Agent': userAgent }
    });
    //沒資料
    if (!PostData)
        return 404

    //可能是目錄
    if (PostData.match(/資料群組|標題|日期/))
        return 'May be a directory'

    var $ = cheerio.load(PostData);
    var title = $('title').text().replace(/- 國立斗六高級家事商業職業學校/, '')
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
    let files = $('.baseTB a');
    let filesData = [];
    for (var i = 0; i < files.length; i++) {
        if ($(files[i]).text() != "下載附件") {
            let fileLink = $(files[i]).attr('href') == 'javascript:void(0)' ? $(files[i]).attr('onclick').split("'")[3] : $(files[i]).attr('href')
            filesData.push({
                'name': $(files[i]).text(),
                'link': 'http://web.tlhc.ylc.edu.tw' + fileLink,
                'type': fileLink.split(".")[1],
            });
        }
    }

    return {
        "title": title,
        "content": content,
        "files": filesData
    }
}

// 搜尋
exports.search = async function(keyword, res, page) {
    let data = await searchPosts(keyword, page)
    if (data == 'no result') return res.render('tlhc-search', { title: 'ㄉㄌㄐㄕ - 搜尋' })
    res.render('tlhc-search', {
        title: 'ㄉㄌㄐㄕ - 搜尋：' + keyword,
        tlhc: data.posts,
        pages: data.pageData,
        search: keyword
    })
};
async function searchPosts(keyword, page) {
    let SearchData;
    if (page == "1") {
        SearchData = await doRequest({
            url: "http://web.tlhc.ylc.edu.tw/bin/ptsearch.php",
            method: "POST",
            form: {
                SchKey: keyword,
                search: "search"
            },
            headers: { 'User-Agent': userAgent }
        });
    } else {
        SearchData = await doRequest({
            url: 'http://www.tlhc.ylc.edu.tw/bin/ptsearch.php?P=' + page + '&T=66&wc=a%3A3%3A{s%3A3%3A%22Key%22%3Bs%3A6%3A%22' + encodeURIComponent(keyword) + '%22%3Bs%3A8%3A%22pagesize%22%3Bs%3A2%3A%2210%22%3Bs%3A3%3A%22Rcg%22%3Bi%3A0%3B}',
            method: "GET",
            headers: { 'User-Agent': userAgent }
        });
    }
    var $ = cheerio.load(SearchData);
    //文章內容
    var tlhcData = [];
    var header = $(".baseTB.list_TIDY tr>td.mc .h5 a");
    var content = $(".baseTB.list_TIDY tr>td.mc .message");
    if (content == undefined) {
        return 'no result'
    }
    for (var i = 0; i < header.length; i++) {
        let timePrecision = $(content[i]).text().match(/[0-9]{4}\/[0-9]{2}\/[0-9]*/).pop()
        let timeSimple = numberToChinses(moment(timePrecision, 'YYYY/MM/DD').fromNow())
        var preJoin = {
            'header': $(header[i]).text(),
            'title': $(header[i]).text(),
            'content': $(content[i]).text().split(/[0-9]{4}\/[0-9]{2}\/[0-9]*/)[0],
            'tags': [timeSimple, timePrecision],
            'url': $(header[i]).attr('href'),
            'date': timePrecision,
            'datefromnow': timeSimple,
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
    return {
        "pagination": pageData,
        "posts": tlhcData
    }
}