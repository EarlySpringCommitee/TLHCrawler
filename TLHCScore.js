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
    let data = await doRequest({
        url: "http://register.tlhc.ylc.edu.tw/hcode/STDINFO.asp",
        method: "GET",
        encoding: null,
        headers: {
            'Cookie': cookie,
            'User-Agent': userAgent
        }
    });
    data = decodeBig5(data)
    let $ = cheerio.load(data)
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
        system: true,
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
    if (ScoreSelect == '無權使用 請登入') {
        res.redirect("/tlhc/login/")
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

// 整理本學期成績網頁並取出表格
function getLatestScore(data) {
    var $ = cheerio.load(data)
    // clean score trash
    $(`body>center>table:nth-child(3) td>table>tbody tr:first-child,
       body>center>table:nth-child(3) td>table>tbody td:nth-child(4),
       body>center>table:nth-child(3) td>table>tbody td:nth-child(7)`).remove()
    // clean total trash
    $(`body>center>table:nth-child(4) td>table>tbody td:nth-child(4),
       body>center>table:nth-child(4) td>table>tbody td:nth-child(7)`).remove()
    // clean hidden inputs
    $(`input[type="hidden"]`).remove()

    var score = $("body>center>table:nth-child(3) td>table>tbody")
    var total = $("body>center>table:nth-child(4) td>table>tbody")
    var tables = [{
            'title': '本學期段考成績',
            'table': score.html().replace(/\n/g, ''),
            'tableID': 'score'
        },
        {
            'title': '本學期段考排名',
            'table': total.html().replace(/\n/g, ''),
            'tableID': 'total'
        }
    ]
    return tables
}

// 整理學期成績網頁並取出表格
function getSemesterScore(data) {
    var $ = cheerio.load(data)
    let title,
        tables,
        scoreTable = `body > center:nth-child(1) > table:nth-child(3) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(1) > table:nth-child(1) > tbody:nth-child(1)`,
        rankTable = `body > center:nth-child(1) > table:nth-child(4) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(1) > form:nth-child(1) > table:nth-child(1) > tbody:nth-child(1)`

    title = $(".FormHeaderFONT").text()

    // clean score trash
    $(`${scoreTable} tr:first-child`).remove()
    // clean hidden inputs
    $(`input[type="hidden"]`).remove()

    scoreTable = $(scoreTable)
    rankTable = $(rankTable)

    tables = [{
            'title': title + '總成績',
            'table': scoreTable.html().replace(/\n/g, ''),
            'tableID': 'score'
        },
        {
            'title': title + '排名',
            'table': rankTable.html().replace(/\n/g, ''),
            'tableID': 'rank'
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
        if (b == '無權使用 請登入') {
            res.redirect("/tlhc/login/")
            return
        }
        var $ = cheerio.load(b)
        var day = $("body>center>table:nth-child(3)>tbody>tr>td>table>tbody")
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
    if (RewardsSelect == '無權使用 請登入') {
        res.redirect("/tlhc/login/")
        return
    }
    var $ = cheerio.load(RewardsSelect)

    // 拿資料囉
    let tables = [];
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
        let table = parseRewards(data)
        tables.push(table);
    }

    res.render('s-multi-table', {
        title: 'ㄉㄌㄐㄕ - 獎懲紀錄',
        user: JSON.parse(req.session.user),
        tables: tables.reduce((a, b) => a.concat(b), []),
        page: "rewards"
    })
}

function parseRewards(data) {
    let $ = cheerio.load(data)
    let rewardsTitle = $("body>center>table:nth-child(3)>tbody>tr>td>table>tbody a font").text()
    $("body>center>table:nth-child(3)>tbody>tr>td>table>tbody tr:first-child").remove()
    let rewardsTable = $("body>center>table:nth-child(3)>tbody>tr>td>table>tbody")
    let tables = [{
        'title': rewardsTitle + '獎懲紀錄',
        'table': rewardsTable.html().replace(/\n/g, '').trim(),
        'tableID': 'rewards'
    }]
    return tables
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
    if (GroupPage == '無權使用 請登入') {
        res.redirect("/tlhc/login/")
        return
    }
    var $ = cheerio.load(GroupPage)
    $("input").remove()
    $('td').removeAttr('class')
    $("body>center>table:nth-child(3)>tbody>tr>td>table>tbody tr td:last-child").remove()
    var tables = [{
        'title': '社團及幹部紀錄',
        'table': $("body>center>table:nth-child(3)>tbody>tr>td>table>tbody").html().replace(/\n/g, ''),
        'tableID': 'group'
    }]

    res.render('s-multi-table', {
        title: 'ㄉㄌㄐㄕ - 社團及幹部',
        user: JSON.parse(req.session.user),
        tables: tables.reduce((a, b) => a.concat(b), []),
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