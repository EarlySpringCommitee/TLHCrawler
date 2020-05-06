//
//  基本設定
//
const request = require("request"); // HTTP 客戶端輔助工具
function doRequest(url) {
    return new Promise(function (resolve, reject) {
        request(url, function (error, res, body) {
            if (!error && res.statusCode == 200)
                resolve(body);
            else if (!error && res.statusCode == 302)
                resolve(res.headers);
            else
                resolve(error);

        });
    });
}
const cheerio = require("cheerio"); // Server 端的 jQuery 實作
const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.80 Safari/537.36';
const authorizedDetect = /無權限使用本程式|無權使用 請登入/

function decodeBig5(code) {
    return require('iconv-lite').decode(code, 'Big5')
}
// ------------------- 登入
// 登入帳號並取得 Cookie
exports.getCookie = async function (req, res) {
    var userID = req.body['userID']
    var userPASS = req.body['userPASS']
    req.session.userID = userID
    req.session.userPASS = userPASS
    //- 登入成績系統
    request.post({
        url: "http://register.tlhc.ylc.edu.tw/hcode/login.asp",
        form: {
            txtID: userID,
            txtPWD: userPASS,
            'login_r7_c5.x': 0,
            'login_r7_c5.y': 0,
            Chk: 'Y'
        },
        headers: {
            'User-Agent': userAgent
        }
    }, function (e, r, b) {
        // 錯誤代碼 
        // 傳回的資料內容 
        if (e || !b) {
            return
        }
        req.session.tlhc = r.headers['set-cookie'];
        request({
            url: "http://register.tlhc.ylc.edu.tw/hcode/STDINFO.asp",
            method: "GET",
            encoding: null,
            headers: {
                'Cookie': r.headers['set-cookie'],
                'User-Agent': userAgent
            }
        }, (e, r, b) => {
            /* e: 錯誤代碼 */
            /* b: 傳回的資料內容 */
            b = decodeBig5(b)
            if (e || !b || b.match('抱歉,您無權限使用本程式!')) {
                return res.json(false)
            }
            var $ = cheerio.load(b);
            //登入成功
            let user = {
                /* 學號 */
                id: $(".FormStyle > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(2) > font:nth-child(1)").text().trim(),
                /* 姓名 */
                name: $(".FormStyle > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(4) > font:nth-child(1)").text().trim(),
                /* 班級 */
                class: $(".FormStyle > tbody:nth-child(1) > tr:nth-child(8) > td:nth-child(2) > font:nth-child(1)").text().trim(),
                /* 座號 */
                num: $(".FormStyle > tbody:nth-child(1) > tr:nth-child(8) > td:nth-child(4) > font:nth-child(1)").text().trim(),
            }
            req.session.user = JSON.stringify(user)
            return res.json(true)
        });
        //一開始用帳密跟學校換餅乾
        //然後餅乾存在 session 裡面
    });
}

// ------------------- 基本資料
exports.getInfoPage = async function (cookie, res, req) {
    let info = await doRequest({
        url: "http://register.tlhc.ylc.edu.tw/hcode/STDINFO.asp",
        method: "GET",
        encoding: null,
        headers: {
            'Cookie': cookie,
            'User-Agent': userAgent
        }
    });
    info = decodeBig5(info)
    if (info.match(authorizedDetect)) {
        req.session.destroy()
        res.redirect("/system/login/")
        return
    }
    let $ = cheerio.load(info)
    let listData = {
        '學號': $(`.FormStyle > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(2) > font:nth-child(1)`).text().trim(),
        '姓名': $(`.FormStyle > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(4) > font:nth-child(1)`).text().trim() +
            " (" + $(`.FormStyle > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(6) > font:nth-child(1)`).text().trim() + ")",
        '性別': $(`.FormStyle > tbody:nth-child(1) > tr:nth-child(3) > td:nth-child(2) > font:nth-child(1)`).text().trim(),
        '出生年月': $(`.FormStyle > tbody:nth-child(1) > tr:nth-child(3) > td:nth-child(4) > font:nth-child(1)`).text().trim(),
        '身份': $(`.FormStyle > tbody:nth-child(1) > tr:nth-child(3) > td:nth-child(6) > font:nth-child(1)`).text().trim(),
        '家長姓名': $(`.FormStyle > tbody:nth-child(1) > tr:nth-child(4) > td:nth-child(2) > font:nth-child(1)`).text().trim() +
            ' (' + $(`.FormStyle > tbody:nth-child(1) > tr:nth-child(4) > td:nth-child(4) > font:nth-child(1)`).text().trim() + ")",
        '聯絡電話': $(`.FormStyle > tbody:nth-child(1) > tr:nth-child(4) > td:nth-child(6) > font:nth-child(1)`).text().trim(),
        '戶籍地址': $(`.FormStyle > tbody:nth-child(1) > tr:nth-child(5) > td:nth-child(2) > font:nth-child(1)`).text().trim(),
        '通訊地址': $(`.FormStyle > tbody:nth-child(1) > tr:nth-child(6) > td:nth-child(2) > font:nth-child(1)`).text().trim(),
        '入學年度': $(`.FormStyle > tbody:nth-child(1) > tr:nth-child(7) > td:nth-child(2) > font:nth-child(1)`).text().trim(),
        '畢業國中': $(`.FormStyle > tbody:nth-child(1) > tr:nth-child(7) > td:nth-child(4) > font:nth-child(1)`).text().trim(),
        '在學班級、座號': $(`.FormStyle > tbody:nth-child(1) > tr:nth-child(8) > td:nth-child(2) > font:nth-child(1)`).text().trim() +
            " (" + $(`.FormStyle > tbody:nth-child(1) > tr:nth-child(8) > td:nth-child(4) > font:nth-child(1)`).text().trim() + ")",
        '在學狀態': $(`.FormStyle > tbody:nth-child(1) > tr:nth-child(8) > td:nth-child(6) > font:nth-child(1)`).text().trim() || '無資料'
    }
    res.render('s-list', {
        title: 'ㄉㄌㄐㄕ - 基本資料',
        user: JSON.parse(req.session.user),
        list: listData,
        page: "info"
    })
}

// ------------------- 成績
// 取得總成績選擇頁面
exports.getScorePage = async function (cookie, res, req) {
    let ScoreSelect = await doRequest({
        url: "http://register.tlhc.ylc.edu.tw/hcode/STD_YEARSCO.asp",
        method: "GET",
        encoding: null,
        headers: {
            'Cookie': cookie,
            'User-Agent': userAgent
        }
    });
    ScoreSelect = decodeBig5(ScoreSelect)
    if (ScoreSelect.match(authorizedDetect)) {
        req.session.destroy()
        res.redirect("/system/login/")
        return
    }
    var $ = cheerio.load(ScoreSelect)
    let tables = [];

    //取得本學期成績
    let LatestScore = await doRequest({
        url: "http://register.tlhc.ylc.edu.tw/hcode/STD_SCORE.asp",
        method: "GET",
        encoding: null,
        headers: {
            'Cookie': cookie,
            'User-Agent': userAgent
        }
    });
    tables.push(
        getLatestScore(
            decodeBig5(LatestScore)
        )
    );
    // 取得學期總成績
    var link = $('body table table table tbody tr td.DataTD font.FieldCaptionFONT a')
    for (var i = 0; i < link.length; i++) {
        // link.length - i - 1 ==> 將成績反序 (#11)
        let getURL = "http://register.tlhc.ylc.edu.tw/hcode/" + $(link[link.length - i - 1]).attr('href')
        let ScoreSemesterRequest = await doRequest({
            url: getURL,
            method: "GET",
            encoding: null,
            headers: {
                'Cookie': cookie,
                'User-Agent': userAgent
            }
        });
        tables.push(
            getSemesterScore(
                decodeBig5(ScoreSemesterRequest)
            )
        );
    }
    /*
        tables.reduce((a, b) => a.concat(b), [])
        https://stackoverflow.com/a/46715585
    */
    res.render('s-multi-table', {
        title: 'ㄉㄌㄐㄕ - 成績',
        user: JSON.parse(req.session.user),
        tables: tables.reduce((a, b) => a.concat(b), []),
        page: "score"
    })
}
// 分數
function scoreRating($, el) {
    $(el).each(function () {
        let text = $(this).text().trim()
        if (text < 60 && text > 0 || text == '0') {
            // 不及格
            $(this).addClass('negative')
        }
        if (text <= 100 && text >= 80) {
            // 八十分
            $(this).addClass('positive')
        }
        if (text <= 100 && text >= 0) {
            // 如果是分數，加上等寬字元
            $(this).addClass('score')
        }
        return text
    })
}
// 整理本學期成績網頁並取出表格
function getLatestScore(data) {
    var $ = cheerio.load(data)
    let scoreTable = `body>center>table:nth-child(3) td>table`
    let rankTable = `body>center>table:nth-child(4) td>table`
    // clean score trash
    $(`${scoreTable}>tbody tr:first-child,
       ${scoreTable}>tbody td:nth-child(4),
       ${scoreTable}>tbody td:nth-child(7),
       ${scoreTable}>tbody tr:last-child`).remove()
    // clean total trash
    $(`${rankTable}>tbody td:nth-child(4),
       ${rankTable}>tbody td:nth-child(7),
       ${rankTable}>tbody tr:last-child`).remove()
    // clean hidden inputs
    $(`input[type="hidden"]`).remove()

    $(`${scoreTable} td,${rankTable} td`).text(function () {
        $(this).removeAttr('class')
        let text = $(this).children('font').text().trim()
        return !text.match(/成績輸入期間|成績處理期間/) ? text : ""
    })
    $(`${rankTable} tr:nth-child(n+1) td:nth-child(n+2)`).addClass("score")

    /*/ === 分數閃亮亮 === /*/
    scoreRating($, `${scoreTable} td`)
    scoreRating($, `${rankTable} tr:nth-child(1) > td`)

    var score = $("body>center>table:nth-child(3) td>table>tbody")
    var rank = $("body>center>table:nth-child(4) td>table>tbody")

    var tables = [{
            'title': '本學期段考成績',
            'table': score.html().replace(/\n/g, ''),
            'tableID': 'score'
        },
        {
            'title': '本學期段考排名',
            'table': rank.html().replace(/\n/g, ''),
            'tableID': 'rank'
        }
    ]
    return tables
}

// 整理學期成績網頁並取出表格
function getSemesterScore(data) {
    var $ = cheerio.load(data)
    let title,
        tables,
        scoreSemesterTable = `body > center:nth-child(1) > table:nth-child(3) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(1) > table:nth-child(1) > tbody:nth-child(1)`,
        rankSemesterTable = `body > center:nth-child(1) > table:nth-child(4) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(1) > form:nth-child(1) > table:nth-child(1) > tbody:nth-child(1)`

    title = $(".FormHeaderFONT").text()

    // clean scoreTable trash
    $(`${scoreSemesterTable} tr:first-child,${scoreSemesterTable} tr:last-child`).remove()
    // clean rankTable trash
    $(`${rankSemesterTable} tr:last-child`).remove()
    // clean hidden inputs
    $(`input[type="hidden"]`).remove()
    // parse td
    $(`${scoreSemesterTable} td,${rankSemesterTable} td`).text(function () {
        $(this).removeAttr('class')
        /*導師評語*/
        let textarea = $(this).children('textarea').text().trim()
        if (textarea != "" && !textarea.match(/成績輸入期間|成績處理期間/)) return textarea
        /*其他欄位*/
        let text = $(this).children('font').text().trim()
        return !text.match(/成績輸入期間|成績處理期間/) ? text : ""
    })
    //add score class
    $(`${rankSemesterTable} tr td:nth-child(1n+2)`).addClass("score")
    $(`${scoreSemesterTable} td:nth-child(n+7)`).addClass("score") // 學分加上等寬

    /*/ === 分數閃亮亮 === /*/
    // 學期排名
    scoreRating($, `${rankSemesterTable}  tr:nth-child(1) > td`)
    // 學期總成績
    scoreRating($, `${scoreSemesterTable} td:nth-child(n+3):not(:nth-child(n+7))`) // 略過學分

    scoreSemesterTable = $(scoreSemesterTable)
    rankSemesterTable = $(rankSemesterTable)

    tables = [{
            'title': title + '總成績',
            'table': scoreSemesterTable.html().replace(/\n/g, ''),
            'tableID': 'semesterScore'
        },
        {
            'title': title + '排名',
            'table': rankSemesterTable.html().replace(/\n/g, ''),
            'tableID': 'semesterRank'
        }
    ]
    return tables

}

// ------------------- 取得出勤
exports.getAttendance = (cookie, res, req) => {
    request({
        url: "http://register.tlhc.ylc.edu.tw/hcode/STD_DAY.asp",
        method: "GET",
        encoding: null,
        headers: {
            'Cookie': cookie,
            'User-Agent': userAgent
        }
    }, (e, r, b) => {
        /* e: 錯誤代碼 */
        /* b: 傳回的資料內容 */
        b = decodeBig5(b)
        if (e || !b) {
            return
        }
        if (b.match(authorizedDetect)) {
            req.session.destroy()
            res.redirect("/system/login/")
            return
        }
        var $ = cheerio.load(b)
        let table = `body>center>table:nth-child(3)>tbody>tr>td>table>tbody`

        // clean empty tr
        $(`${table} tr:last-child`).remove()

        $(`${table} td`).text(function () {
            $(this).removeAttr('class')
            let text = $(this).children('font').text().trim()
            if (text.match(/曠課|遲到|缺席/)) $(this).addClass('negative')
            return text
        })

        var day = $(table)
        var tables = [{
            'title': '出勤紀錄',
            'table': day.html().replace(/\n/g, ''),
            'tableID': 'day'
        }]
        res.render('s-multi-table', {
            title: 'ㄉㄌㄐㄕ - 出勤',
            user: JSON.parse(req.session.user),
            tables: tables,
            page: "attendance"
        })
    });
}

// ------------------- 取得獎懲
// 取得獎懲選擇頁面
exports.getRewardsPage = async function (cookie, res, req) {
    let RewardsSelect = await doRequest({
        url: "http://register.tlhc.ylc.edu.tw/hcode/STD_YEARCHK.asp",
        method: "GET",
        encoding: null,
        headers: {
            'Cookie': cookie,
            'User-Agent': userAgent
        }
    });

    RewardsSelect = decodeBig5(RewardsSelect)
    if (RewardsSelect.match(authorizedDetect)) {
        req.session.destroy()
        res.redirect("/system/login/")
        return
    }
    var $ = cheerio.load(RewardsSelect)

    // 拿資料囉
    let r = [];
    var link = $('body table table table tbody tr td.DataTD font.FieldCaptionFONT a')
    for (var i = 0; i < link.length; i++) {
        let getURL = "http://register.tlhc.ylc.edu.tw/hcode/" + $(link[i]).attr('href')
        let RewardsRequest = await doRequest({
            url: getURL,
            method: "GET",
            encoding: null,
            headers: {
                'Cookie': cookie,
                'User-Agent': userAgent
            }
        });
        let data = decodeBig5(RewardsRequest)
        let parsedData = parseRewards(data)
        r.push(parsedData);
    }

    res.render('s-list', {
        title: 'ㄉㄌㄐㄕ - 獎懲紀錄',
        user: JSON.parse(req.session.user),
        list: r.reduce((a, b) => a.concat(b), []),
        page: "rewards"
    })
}

function parseRewards(data) {
    let $ = cheerio.load(data)
    let rewardsTitle = $("body>center>table:nth-child(3)>tbody>tr>td>table>tbody a font").text()
    $("body>center>table:nth-child(3)>tbody>tr>td>table>tbody tr:first-child").remove()
    $("body>center>table:nth-child(3)>tbody>tr>td>table>tbody tr td:last-child").remove()
    $("body>center>table:nth-child(3)>tbody>tr>td>table>tbody td").text(function () {
        return $(this).children('font').text().trim()
    })

    let s = "body>center>table:nth-child(3)>tbody>tr>td>table>tbody tr:nth-child(n+2)"
    let d = []
    for (i = 0; i < $(s).length; i++) {
        let date = $(s).eq(i).find('td:nth-child(1)').text() //獎懲日期
        let type = $(s).eq(i).find('td:nth-child(2)').text() //獎懲類別
        let item = $(s).eq(i).find('td:nth-child(3)').text().replace(/。/g, '') //獎懲事項
        let clause = $(s).eq(i).find('td:nth-child(4)').text() //獎懲條款
        let offsetDate = $(s).eq(i).find('td:nth-child(5)').text() //抵銷日期
        let offsetType = $(s).eq(i).find('td:nth-child(6)').text() //抵銷類別
        let rating;
        if (type.match(/大功|小功|嘉獎/)) {
            // 棒棒
            rating = 'positive'
        }
        if (type.match(/小過|警告|缺點/)) {
            // 壞壞
            rating = 'negative'
        }
        if (date == "無任何資料" || type == "") break
        title = type
        subTitle = date

        description = `您於${rewardsTitle} (${date}) `

        if (clause) description += `以「${item}」及條款「${clause}」`
        else description += `以「${item}」`

        description += `取得「${type}」`

        if (offsetDate != "")
            description += `並於 ${offsetDate} 以「${offsetType}」抵銷`

        d.push({
            "title": title,
            "subTitle": subTitle,
            "description": description,
            "rating": rating
        })
    }
    return d
}

// ------------------- 取得社團
exports.getGroupPage = async function (cookie, res, req) {
    let GroupPage = await doRequest({
        url: "http://register.tlhc.ylc.edu.tw/hcode/STDClgQry.asp",
        method: "GET",
        encoding: null,
        headers: {
            'Cookie': cookie,
            'User-Agent': userAgent
        }
    });
    GroupPage = decodeBig5(GroupPage)
    if (GroupPage.match(authorizedDetect)) {
        req.session.destroy()
        res.redirect("/system/login/")
        return
    }
    var $ = cheerio.load(GroupPage)
    $("input").remove()
    $('td').removeAttr('class')
    $("body>center>table:nth-child(3)>tbody>tr>td>table>tbody tr td:last-child").remove()
    $("body>center>table:nth-child(3)>tbody>tr>td>table>tbody td").text(function () {
        return $(this).children('font').text().trim()
    })
    let data = []
    let s = "body>center>table:nth-child(3)>tbody>tr>td>table>tbody tr:nth-child(n+2)"
    for (i = 0; i < $(s).length; i++) {
        let semester1 = $(s).eq(i).find('td:nth-child(1)').text()
        let semester2 = $(s).eq(i).find('td:nth-child(2)').text() == "1" ? "上" : $(s).eq(i).find('td:nth-child(2)').text() == "2" ? "下" : false
        if (!semester2) continue //跳過詭異空欄位
        let className = $(s).eq(i).find('td:nth-child(3)').text()
        let classOfficer = $(s).eq(i).find('td:nth-child(4)').text()
        let autonomousOfficer = $(s).eq(i).find('td:nth-child(5)').text()
        let groupName = $(s).eq(i).find('td:nth-child(6)').text()
        let groupOfficer = $(s).eq(i).find('td:nth-child(7)').text()
        let classAssociation = $(s).eq(i).find('td:nth-child(8)').text()
        let title, subTitle, description;
        if (classOfficer != "") {
            title = classOfficer
            subTitle = "班級幹部"
            description = `您於 ${semester1} 年${semester2}學期於${className}擔任「${classOfficer}」`
        }
        if (autonomousOfficer != "") {
            title = autonomousOfficer
            subTitle = "自治幹部"
            description = `您於 ${semester1} 年${semester2}學期於擔任自治幹部「${autonomousOfficer}」`
        }
        if (groupName != "") {
            title = groupName
            subTitle = "社團"
            description = `您於 ${semester1} 年${semester2}學期參加社團「${groupName}」`
            if (groupOfficer) {
                title += ` (${groupOfficer})`
                description += `，並擔任「${groupOfficer}」`
            }
        }
        if (classAssociation != "") {
            title = classAssociation
            subTitle = "班聯會"
            description = `您於 ${semester1} 年${semester2}學期於班聯會擔任「${classAssociation}」`
        }

        data.push({
            "title": title,
            "subTitle": subTitle,
            "description": description
        })
    }
    res.render('s-list', {
        title: 'ㄉㄌㄐㄕ - 社團及幹部',
        user: JSON.parse(req.session.user),
        list: data,
        page: "group"
    })
}

// ------------------- 瀏覽匯出資料
exports.getCSV = function (cookie, res, req) {
    res.render('s-csvtohtml', {
        title: 'ㄉㄌㄐㄕ - 瀏覽匯出資料',
        user: JSON.parse(req.session.user),
        page: "csv"
    })
}
// ------------------- 測試頁面
exports.getTestPage = async function (cookie, res, req) {
    res.render('s-multi-table', {
        "title": "ㄉㄌㄐㄕ - 成績",
        "user": {
            "id": "124A17",
            "name": "小熊貓",
            "class": "正音班",
            "num": "69"
        },
        "tables": [{
                "title": "本學期段考成績",
                "table": `<tbody><tr><td>科目</td><td>期中考一</td><td>期中考二</td><td>平時成績</td><td>期末考</td><td>補考成績</td><td>重修成績</td><td>學期</td><td>調整後成績</td></tr><tr><td>基礎注音</td><td class="score">73</td><td class="score">75</td><td class="score">72</td><td class="score">78</td><td class="score"></td><td class="score"></td><td class="score">74.4</td><td class="score"></td></tr><tr><td>魔法實習</td><td class="positive score">99</td><td class="positive score">95</td><td class="positive score">98</td><td class="positive score">100</td><td class="score"></td><td class="score"></td><td class="positive score">98.3</td><td class="score"></td></tr><tr><td>現代微積分</td><td class="score">78</td><td class="negative score">56</td><td class="score">78</td><td class="score">63</td><td class="score"></td><td class="score"></td><td class="score">70.2</td><td class="score"></td></tr><tr><td>企鵝管理學</td><td class="score">68</td><td class="score">61</td><td class="negative score">58</td><td class="negative score">33</td><td class="score">69</td><td class="score"></td><td class="negative score">52.45</td><td class="score">69</td></tr><tr><td>貓咪管理系</td><td class="score">63</td><td class="score">78</td><td class="score">66</td><td class="score">66</td><td class="score"></td><td class="score"></td><td class="score">67.35</td><td class="score"></td></tr><tr><td>可愛小熊貓</td><td class="positive score">89</td><td class="positive score">98</td><td class="positive score">95</td><td class="positive score">98</td><td class="score"></td><td class="score"></td><td class="positive score">95.45</td><td class="score"></td></tr><tr><td>哲學小貓貓</td><td class="score">63</td><td class="score">69</td><td class="negative score">59</td><td class="score">68</td><td class="score"></td><td class="score"></td><td class="score">63.8</td><td class="score"></td></tr><tr><td>簡易現代魔法</td><td class="positive score">92</td><td class="score">63</td><td class="score">63</td><td class="negative score">23</td><td class="score">76</td><td class="score">64</td><td class="negative score">55.35</td><td class="score">76</td></tr><tr><td>基礎咒語</td><td class="score">67</td><td class="score">65</td><td class="negative score">56</td><td class="score">63</td><td class="score"></td><td class="score"></td><td class="score">61.1</td><td class="score"></td></tr><tr><td>現代癿科學</td><td class="score">76</td><td class="positive score">98</td><td class="positive score">99</td><td class="positive score">100</td><td class="score"></td><td class="score"></td><td class="positive score">95.7</td><td class="score"></td></tr><tr><td>蟹堡王實習</td><td class="score">78</td><td class="negative score">48</td><td class="negative score">56</td><td class="score">78</td><td class="score"></td><td class="score"></td><td class="score">64.7</td><td class="score"></td></tr><tr><td>恐龍經濟學</td><td class="positive score">92</td><td class="positive score">98</td><td class="positive score">95</td><td class="positive score">93</td><td class="score"></td><td class="score"></td><td class="positive score">94.4</td><td class="score"></td></tr></tbody>`,
                "tableID": "score"
            },
            {
                "title": "本學期段考排名",
                "table": `<tbody><tr><td>項目</td><td class="score">期中考一</td><td class="score">期中考二</td><td class="score">平時成績</td><td class="score">期末考</td><td class="score">學期</td></tr><tr><td>學業平均</td><td class="score">78.17</td><td class="score">75.33</td><td class="score">74.58</td><td class="score">71.92</td><td class="score">74.43</td></tr><tr><td>班排</td><td class="score">12/69</td><td class="score">68/69</td><td class="score">42/69</td><td class="score">25/69</td><td class="score">10/69</td></tr></tbody>`,
                "tableID": "rank"
            }, {
                "title": "本學期總成績",
                "table": `<tbody><tr> <td>科目</td> <td>必選修</td> <td>學期總成績</td> <td>補考</td> <td>重修</td> <td>調整後成績</td> <td class="score">學分</td> </tr>  <tr><td>基礎注音<br></td><td>部定必修</td><td class="score">74.4</td><td class="score"></td><td class="score"></td><td class="score"></td><td class="score">1</td> </tr> <tr><td>魔法實習<br></td><td>部定必修</td><td class="score positive">98.3</td><td class="score"></td><td class="score"></td><td class="score"></td><td class="score">0</td> </tr> <tr><td>現代微積分<br></td><td>部定必修</td><td class="score">70.2</td><td class="score"></td><td class="score"></td><td class="score"></td><td class="score">6</td> </tr> <tr><td>企鵝管理學<br></td><td>部定必修</td><td class="score negative">52.45</td><td class="score">69</td><td class="score"></td><td class="score">69</td><td class="score">9</td> </tr> <tr><td>貓咪管理系<br></td><td>部定必修</td><td class="score">67.35</td><td class="score"></td><td class="score"></td><td class="score"></td><td class="score">1</td> </tr> <tr><td>可愛小熊貓<br></td><td>部定必修</td><td class="score positive">95.45</td><td class="score"></td><td class="score"></td><td class="score"></td><td class="score">0</td> </tr> <tr><td>哲學小貓貓<br></td><td>部定必修</td><td class="score">63.8</td><td class="score"></td><td class="score"></td><td class="score"><br></td><td class="score">6</td> </tr> <tr><td>簡易現代魔法<br></td><td>部定必修</td><td class="positive score negative">23</td><td class="score">76</td><td class="score">64</td><td class="score">64</td><td class="score">9</td> </tr> <tr><td>基礎咒語<br></td><td>部定必修</td><td class="score">61.1</td><td class="score"></td><td class="score"></td><td class="score"></td><td class="score">1</td> </tr> <tr><td>現代癿科學<br></td><td>部定必修</td><td class="score positive">95.7</td><td class="score"></td><td class="score"></td><td class="score"></td><td class="score">0</td> </tr> <tr><td>蟹堡王實習<br></td><td>部定必修</td><td class="score">67.7</td><td class="score"></td><td class="score"></td><td class="score"></td><td class="score">6</td> </tr> <tr><td>恐龍經濟學<br></td><td>部定必修</td><td class="score positive">94.4</td><td class="score"><br></td><td class="score"><br></td><td class="score"><br></td><td class="score">9</td></tr>   </tbody>`,
                "tableID": "semesterScore"
            }
        ],
        "page": "score"
    })
}