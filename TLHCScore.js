//
//  基本設定
//
const request = require("request"); // HTTP 客戶端輔助工具
function doRequest(url) {
    return new Promise(function(resolve, reject) {
        request(url, function(error, res, body) {
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
const express = require('express'); // Node.js Web 架構
const bodyParser = require('body-parser'); // 讀入 post 請求
const session = require('express-session');
const Base64 = require('js-base64').Base64; // Base64
const iconv = require('iconv-lite'); // ㄐㄅ的編碼處理
const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:60.0) Gecko/20100101 CuteDick/60.0';

// ------------------- 登入
// 登入帳號並取得 Cookie
exports.getCookie = async function(req, res) {
    var userID = req.body['userID']
    var userPASS = req.body['userPASS']
    req.session.userID = userID
    req.session.userPASS = userPASS
        //-- 登入選課系統
    let getFormData = async(userID, userPASS) => {
        let loginPage = await doRequest({
            url: "http://register.tlhc.ylc.edu.tw/stdcourse3/Login.aspx",
            method: "GET",
            encoding: null
        });
        let $ = cheerio.load(loginPage.toString())
        let h = {}
        let inputs = $("input[type=\"hidden\"]")
        for (var i = 0; i < inputs.length; i++)
            h[$(inputs[i]).attr('name')] = $(inputs[i]).val()
        h[`user_code`] = userID
        h[`user_pswd`] = userPASS
        h[`ImageButton1.x`] = 33
        h[`ImageButton1.y`] = 20
        return h
    }
    let login = await doRequest({
        url: "http://register.tlhc.ylc.edu.tw/stdcourse3/Login.aspx",
        method: "POST",
        encoding: null,
        form: await getFormData(userID, userPASS),
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:60.0) Gecko/20100101 CuteDick/60.0',
        }
    });
    if (login[`set-cookie`])
        req.session.course = login[`set-cookie`]
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
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:60.0) Gecko/20100101 CuteDick/60.0',
        }
    }, function(e, r, b) {
        // 錯誤代碼 
        // 傳回的資料內容 
        if (e || !b) { return }
        req.session.tlhc = r.headers['set-cookie'];
        request({
            url: "http://register.tlhc.ylc.edu.tw/hcode/STDINFO.asp",
            method: "GET",
            encoding: null,
            headers: {
                //some header
                'Cookie': r.headers['set-cookie'],
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:60.0) Gecko/20100101 CuteDick/60.0',
                //some header
            }
        }, (e, r, b) => {
            /* e: 錯誤代碼 */
            /* b: 傳回的資料內容 */
            var b = iconv.decode(b, 'Big5')
            if (e || !b) { return }
            var $ = cheerio.load(b);
            if (b.match('抱歉,您無權限使用本程式!')) {
                res.render('s-login', {
                    title: 'ㄉㄌㄐㄕ - 登入',
                    post: '/tlhc/login/',
                    message: '請檢查輸入的學號及身份證字號是否正確',
                    system: true
                })
                return
            } else {
                //登入成功
                res.redirect("/tlhc/score/")
            }
        });
        //一開始用帳密跟學校換餅乾
        //然後餅乾存在 session 裡面
    });

}
exports.getSystem = async function(cookie, res) {
    let StudentInfoRequest = await doRequest({
        url: "http://register.tlhc.ylc.edu.tw/hcode/STDINFO.asp",
        method: "GET",
        encoding: null,
        headers: { 'Cookie': cookie, 'User-Agent': userAgent }
    });
    let StudentInfo = iconv.decode(StudentInfoRequest, 'Big5')
    if (StudentInfo.match(/抱歉,您無權限使用本程式!|無權使用 請登入/)) {
        res.redirect("/tlhc/login/")
        return
    }
    var $ = cheerio.load(StudentInfo)
    var userInfo = {
        name: $("form[action=\"STDINFO.asp\"] table tr:nth-child(2) td:nth-child(4) .ContectFont").text().replace(/\n/g, ''),
        id: $("form[action=\"STDINFO.asp\"] table tr:nth-child(2) td:nth-child(2) .ContectFont").text().replace(/\n/g, '')
    }
    var selector = [{
        'name': '成績',
        'link': '/tlhc/score/',
        'icon': 'pie chart'
    }, {
        'name': '出勤',
        'link': '/tlhc/day/',
        'icon': 'student'
    }, {
        'name': '獎懲',
        'link': '/tlhc/rewards/',
        'icon': 'legal'
    }, {
        'name': '社團及幹部',
        'link': '/tlhc/group/',
        'icon': 'users'
    }, {
        'name': '登出',
        'link': '/tlhc/score/logout/',
        'icon': 'sign out'
    }]
    res.render('s-selector', {
        title: 'ㄉㄌㄐㄕ - 登入成功',
        header: '從這裡開始',
        system: true,
        selector: selector,
        user: userInfo
    })
}

// ------------------- 成績
// 取得總成績選擇頁面
exports.getScorePage = async function(cookie, res) {

    let ScoreSelectRequest = await doRequest({
        url: "http://register.tlhc.ylc.edu.tw/hcode/STD_YEARSCO.asp",
        method: "GET",
        encoding: null,
        headers: { 'Cookie': cookie, 'User-Agent': userAgent }
    });
    var ScoreSelectPage = iconv.decode(ScoreSelectRequest, 'Big5')
    if (ScoreSelectPage == '無權使用 請登入') {
        res.redirect("/tlhc/login/")
        return
    }
    var $ = cheerio.load(ScoreSelectPage)
    var user = {
        id: $("body>center:nth-child(1)>table:nth-child(2) form:nth-child(1) table:nth-child(1) td:nth-child(2)>font:nth-child(1)").text(),
        name: $("body>center:nth-child(1)>table:nth-child(2) form:nth-child(1) table:nth-child(1) td:nth-child(4)>font:nth-child(1)").text(),
        class: $("body>center:nth-child(1)>table:nth-child(2) form:nth-child(1) table:nth-child(1) td:nth-child(6)>font:nth-child(1)").text(),
        num: $("body>center:nth-child(1)>table:nth-child(2) form:nth-child(1) table:nth-child(1) td:nth-child(8)>font:nth-child(1)").text(),
    }
    let tables = [];

    //取得本學期成績
    let LatestScoreRequest = await doRequest({
        url: "http://register.tlhc.ylc.edu.tw/hcode/STD_SCORE.asp",
        method: "GET",
        encoding: null,
        headers: { 'Cookie': cookie, 'User-Agent': userAgent }
    });
    let LatestScore = iconv.decode(LatestScoreRequest, 'Big5')
    let LatestScoreData = getLatestScore(LatestScore)
    tables.push(LatestScoreData);
    // 取得學期總成績
    var link = $('body table table table tbody tr td.DataTD font.FieldCaptionFONT a')
    for (var i = 0; i < link.length; i++) {
        // link.length - i - 1 ==> 將成績反序 (#11)
        let getURL = "http://register.tlhc.ylc.edu.tw/hcode/" + $(link[link.length - i - 1]).attr('href')
        let ScoreSemesterRequest = await doRequest({
            url: getURL,
            method: "GET",
            encoding: null,
            headers: { 'Cookie': cookie, 'User-Agent': userAgent }
        });
        let data = iconv.decode(ScoreSemesterRequest, 'Big5')
        let table = getSemesterScore(data)
        tables.push(table);
    }
    /*
        tables.reduce((a, b) => a.concat(b), [])
        https://stackoverflow.com/a/46715585
    */
    res.render('s-multi-table', {
        title: 'ㄉㄌㄐㄕ - 成績',
        user: user,
        tables: tables.reduce((a, b) => a.concat(b), []),
        system: true
    })
}

// 整理本學期成績網頁並取出表格
function getLatestScore(data) {
    var $ = cheerio.load(data)
    var user = {
        id: $("body>center:nth-child(1)>table:nth-child(2) form:nth-child(1) table:nth-child(1) td:nth-child(2)>font:nth-child(1)").text(),
        name: $("body>center:nth-child(1)>table:nth-child(2) form:nth-child(1) table:nth-child(1) td:nth-child(4)>font:nth-child(1)").text(),
        class: $("body>center:nth-child(1)>table:nth-child(2) form:nth-child(1) table:nth-child(1) td:nth-child(6)>font:nth-child(1)").text(),
        num: $("body>center:nth-child(1)>table:nth-child(2) form:nth-child(1) table:nth-child(1) td:nth-child(8)>font:nth-child(1)").text(),
    }
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
    var scoreTable = $("body > center:nth-child(1) > table:nth-child(3) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(1) > table:nth-child(1) > tbody:nth-child(1)")
    var scoreTitle = $(".FormHeaderFONT")
    var rankTable = $("body > center:nth-child(1) > table:nth-child(4) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(1) > form:nth-child(1) > table:nth-child(1) > tbody:nth-child(1)")
    var tables = [{
            'title': scoreTitle.text() + '總成績',
            'table': scoreTable.html().replace(/\n/g, ''),
            'tableID': 'score'
        },
        {
            'title': scoreTitle.text() + '排名',
            'table': rankTable.html().replace(/\n/g, ''),
            'tableID': 'rank'
        }
    ]
    return tables

}

// ------------------- 取得出勤
exports.getAttendance = (cookie, res) => {
    request({
        url: "http://register.tlhc.ylc.edu.tw/hcode/STD_DAY.asp",
        method: "GET",
        encoding: null,
        headers: { 'Cookie': cookie, 'User-Agent': userAgent }
    }, (e, r, b) => {
        /* e: 錯誤代碼 */
        /* b: 傳回的資料內容 */
        var b = iconv.decode(b, 'Big5')
        if (e || !b) { return }
        if (b == '無權使用 請登入') {
            res.redirect("/tlhc/login/")
            return
        }
        var $ = cheerio.load(b)
        var user = {
            id: $("body>center:nth-child(1)>table:nth-child(2) form:nth-child(1) table:nth-child(1) td:nth-child(2)>font:nth-child(1)").text(),
            name: $("body>center:nth-child(1)>table:nth-child(2) form:nth-child(1) table:nth-child(1) td:nth-child(4)>font:nth-child(1)").text(),
            class: $("body>center:nth-child(1)>table:nth-child(2) form:nth-child(1) table:nth-child(1) td:nth-child(6)>font:nth-child(1)").text(),
            num: $("body>center:nth-child(1)>table:nth-child(2) form:nth-child(1) table:nth-child(1) td:nth-child(8)>font:nth-child(1)").text(),
        }
        var day = $("body>center>table:nth-child(3)>tbody>tr>td>table>tbody")
        var tables = [{
            'title': '出勤紀錄',
            'table': day.html().replace(/\n/g, ''),
            'tableID': 'day'
        }]
        res.render('s-multi-table', {
            title: 'ㄉㄌㄐㄕ - 出勤',
            user: user,
            tables: tables,
            system: true
        })
    });
}

// ------------------- 取得獎懲
// 取得獎懲選擇頁面
exports.getRewardsPage = async function(cookie, res) {
    let RewardsSelectRequest = await doRequest({
        url: "http://register.tlhc.ylc.edu.tw/hcode/STD_YEARCHK.asp",
        method: "GET",
        encoding: null,
        headers: { 'Cookie': cookie, 'User-Agent': userAgent }
    });
    var RewardsSelectPage = iconv.decode(RewardsSelectRequest, 'Big5')
    if (RewardsSelectPage == '無權使用 請登入') {
        res.redirect("/tlhc/login/")
        return
    }
    var $ = cheerio.load(RewardsSelectPage)
    var user = {
        id: $("body>center:nth-child(1)>table:nth-child(2) form:nth-child(1) table:nth-child(1) td:nth-child(2)>font:nth-child(1)").text(),
        name: $("body>center:nth-child(1)>table:nth-child(2) form:nth-child(1) table:nth-child(1) td:nth-child(4)>font:nth-child(1)").text(),
        class: $("body>center:nth-child(1)>table:nth-child(2) form:nth-child(1) table:nth-child(1) td:nth-child(6)>font:nth-child(1)").text(),
        num: $("body>center:nth-child(1)>table:nth-child(2) form:nth-child(1) table:nth-child(1) td:nth-child(8)>font:nth-child(1)").text(),
    }

    // 拿資料囉
    let tables = [];
    var link = $('body table table table tbody tr td.DataTD font.FieldCaptionFONT a')
    for (var i = 0; i < link.length; i++) {
        var getURL = "http://register.tlhc.ylc.edu.tw/hcode/" + $(link[i]).attr('href')
        let RewardsRequest = await doRequest({
            url: getURL,
            method: "GET",
            encoding: null,
            headers: { 'Cookie': cookie, 'User-Agent': userAgent }
        });
        let data = iconv.decode(RewardsRequest, 'Big5')
        let table = getRewards(data)
        tables.push(table);
    }

    res.render('s-multi-table', {
        title: 'ㄉㄌㄐㄕ - 獎懲紀錄',
        user: user,
        tables: tables.reduce((a, b) => a.concat(b), []),
        system: true
    })
}

function getRewards(data) {
    var $ = cheerio.load(data)
    var rewardsTable = $("body>center>table:nth-child(3)>tbody>tr>td>table>tbody")
    var rewardsTitle = $("body>center>table:nth-child(3)>tbody>tr>td>table>tbody a font").text()
    var tables = [{
        'title': rewardsTitle + '獎懲紀錄',
        'table': rewardsTable.html().replace(/\n/g, ''),
        'tableID': 'rewards'
    }]
    return tables
}

// ------------------- 取得社團
exports.getGroupPage = async function(cookie, res) {
        let GroupPageRequest = await doRequest({
            url: "http://register.tlhc.ylc.edu.tw/hcode/STDClgQry.asp",
            method: "GET",
            encoding: null,
            headers: { 'Cookie': cookie, 'User-Agent': userAgent }
        });
        var GroupPage = iconv.decode(GroupPageRequest, 'Big5')
        if (GroupPage == '無權使用 請登入') {
            res.redirect("/tlhc/login/")
            return
        }
        var $ = cheerio.load(GroupPage)
        var user = {
            name: $("body > center:nth-child(1) > table:nth-child(2) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(1) > form:nth-child(1) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(6) > font:nth-child(1)").text(),
            num: $("body > center:nth-child(1) > table:nth-child(2) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(1) > form:nth-child(1) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(4) > font:nth-child(1)").text()
        }

        var tables = [{
            'title': '社團及幹部紀錄',
            'table': $("body>center>table:nth-child(3)>tbody>tr>td>table>tbody").html().replace(/\n/g, ''),
            'tableID': 'group'
        }]

        res.render('s-multi-table', {
            title: 'ㄉㄌㄐㄕ - 社團及幹部',
            user: user,
            tables: tables.reduce((a, b) => a.concat(b), []),
            system: true
        })
    }
    // ------------------- 瀏覽匯出資料
exports.getCSV = function(cookie, res) {
        res.render('s-csvtohtml', {
            title: 'ㄉㄌㄐㄕ - 瀏覽匯出資料',
            system: true,
            user: true
        })
    }
    // - 選課
exports.getCoursePage = async function(cookie, res) {
    let getInfo = await doRequest({
        url: "http://register.tlhc.ylc.edu.tw/stdcourse3/STD04.aspx",
        method: "GET",
        encoding: null,
        headers: { 'Cookie': cookie, 'User-Agent': userAgent }
    });
    let $ = cheerio.load(getInfo.toString())
    let user = {
            id: $("#TITLE_sastd_schcode").text(),
            name: $("#TITLE_sastd_name").text(),
            num: $("#TITLE_sastd_seatno").text()
        }
        // 回傳資料時從 2 開始算
    let subjects = [],
        subjectDatas;
    // 已選填的志願
    subjectDatas = $("#BAThas_Content_td>table>tbody>tr.ContectTdX0001,#BAThas_Content_td>table>tbody>tr.ContectTd0001")
    for (var i = 0; i < subjectDatas.length; i++) {
        let h = {}
            //h[`want_id`]=wantId
        h[`cour_group`] = $(subjectDatas[i]).find(`input[name$="BAThas_PK_Lbl_cour_group"]`).val()
        h[`course_sn`] = $(subjectDatas[i]).find(`input[name$="BAThas_PK_Lbl_course_sn"]`).val()
        h[`zcor_code`] = $(subjectDatas[i]).find(`input[name$="BAThas_PK_Lbl_zcor_code"]`).val()
        h[`sbcor_cortimestr`] = $(subjectDatas[i]).find(`input[name$="BAThas_Lbl_sbcor_cortimestr"]`).val()
        h[`zcor_code`] = $(subjectDatas[i]).find(`input[name$="BAThas_Lbl_zcor_code"]`).val()
        h[`csclst_rtstage`] = $(subjectDatas[i]).find(`input[name$="BAThas_Lbl_csclst_rtstage"]`).val()
        let zclsNames = $(subjectDatas[i]).find(`[id$="zcls_names"]`).text() //班級
        let zcorNames = $(subjectDatas[i]).find(`[id$="zcor_names"]`).text() //科目
        let ztchName = $(subjectDatas[i]).find(`[id$="ztch_name"]`).text() //教師
        let sbcorCortimestrA = $(subjectDatas[i]).find(`[id$="sbcor_cortimestrA"]`).text() //上課時間
        subjects.push({
            "hiddenInputs": h,
            "class": zclsNames,
            "name": zcorNames,
            "teacher": ztchName,
            "time": sbcorCortimestrA
        })
    }
    // 未選填的
    subjectDatas = $("#BAT_Content_td>table>tbody>tr.ContectTdX0001,#BAT_Content_td>table>tbody>tr.ContectTd0001")
    for (var i = 0; i < subjectDatas.length; i++) {
        let h = {}
        h[`cour_group`] = $(subjectDatas[i]).find(`input[name$="BAT_cour_group"]`).val()
        h[`course_sn`] = $(subjectDatas[i]).find(`input[name$="BAT_PK_course_sn"]`).val()
        h[`zcor_code`] = $(subjectDatas[i]).find(`input[name$="BAT_PK_zcor_code"]`).val()
        h[`sbcor_cortimestr`] = $(subjectDatas[i]).find(`input[name$="BAT_sbcor_cortimestr"]`).val()
        h[`zcor_code`] = $(subjectDatas[i]).find(`input[name$="BAT_zcor_code"]`).val()
        h[`csclst_rtstage`] = $(subjectDatas[i]).find(`input[name$="_BAT_csclst_rtstage"]`).val()
        let zclsNames = $(subjectDatas[i]).find(`[id$="zcls_names"]`).text() //班級
        let zcorNames = $(subjectDatas[i]).find(`[id$="zcor_names"]`).text() //科目
        let ztchName = $(subjectDatas[i]).find(`[id$="ztch_name"]`).text() //教師
        let sbcorCortimestrA = $(subjectDatas[i]).find(`[id$="sbcor_cortimestrA"]`).text() //上課時間
        subjects.push({
            "hiddenInputs": h,
            "class": zclsNames,
            "name": zcorNames,
            "teacher": ztchName,
            "time": sbcorCortimestrA
        })
    }
    res.render('s-course', {
        title: 'ㄉㄌㄐㄕ - 選課',
        user: user,
        subjects: subjects,
        system: true
    })

}
exports.saveCoursePage = async(req, res) => {
    /*
    ＝
    已
    棄
    坑
    ＝
    */
    let requestForm = {}
    requestForm[`__EVENTARGUMENT`] = ''
    requestForm[`__EVENTTARGET`] = `BAT_Submit`
    requestForm[`TITLE_PK_sastd_id`] = req.session.userPASS
    requestForm[`TITLE_sastd_id`] = req.session.userPASS
    for (var i = 0; i < req.body.data.length; i++) {
        let item = req.body.data[i]
        if (i > 0) {
            // wantId 從 2 開始
            let wantId = i + 1 > 9 ? i + 1 : '0' + (i + 1)
            requestForm[`BAT_DataGrid$ctl${wantId}$BAT_Lbl_csclst_rtmark`] = ''
            requestForm[`BAT_DataGrid$ctl${wantId}$BAT_Lbl_csclst_rtstage`] = item.csclst_rtstage
            requestForm[`BAT_DataGrid$ctl${wantId}$BAT_Lbl_sbcor_cortimestr`] = item.sbcor_cortimestr
            requestForm[`BAT_DataGrid$ctl${wantId}$BAT_Lbl_zcor_code`] = item.zcor_code
            requestForm[`BAT_DataGrid$ctl${wantId}$BAT_PK_Lbl_cour_group`] = item.cour_group
            requestForm[`BAT_DataGrid$ctl${wantId}$BAT_PK_Lbl_zcor_code`] = item.zcor_code
            requestForm[`BAT_DataGrid$ctl${wantId}$BAT_PK_Lbl_course_sn`] = item.course_sn
            requestForm[`BAT_DataGrid$ctl${wantId}$BAT_PK_Lbl_want_id`] = i
        }
    }
    let pushData = await doRequest({
        url: "http://register.tlhc.ylc.edu.tw/stdcourse3/STD04.aspx",
        method: "POST",
        encoding: null,
        form: requestForm,
        headers: {
            'Cookie': req.session.course,
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:60.0) Gecko/20100101 CuteDick/60.0',
        }
    })
    if (pushData && pushData.toString().match("您尚未登入或已逾登入有效時限")) {
        res.json(false)
    } else {
        res.json(true)
    }
}