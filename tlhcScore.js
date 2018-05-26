// 載入

const request = require("request"); // HTTP 客戶端輔助工具
const cheerio = require("cheerio"); // Server 端的 jQuery 實作
const express = require('express'); // Node.js Web 架構
const bodyParser = require('body-parser'); // 讀入 post 請求
const session = require('express-session');
const iconv = require('iconv-lite'); // ㄐㄅ的編碼處理

exports.getCookie = (req, res) => {
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
            if (b == '無權使用 請登入') {
                res.render('s-login', {
                    title: 'ㄉㄌㄐㄕ - 登入',
                    post: '/tlhc/login/',
                    message: '請檢查輸入的學號及身分證字號是否正確',
                    system: true
                })
                return
            } else {
                var userInfo = {
                    name: $("form[action=\"STDINFO.asp\"] table tr:nth-child(2) td:nth-child(4) .ContectFont").text().replace(/\n/g, ''),
                    id: $("form[action=\"STDINFO.asp\"] table tr:nth-child(2) td:nth-child(2) .ContectFont").text().replace(/\n/g, '')
                }
                res.render('s-login-success', {
                    title: 'ㄉㄌㄐㄕ - 登入成功',
                    system: true,
                    user: userInfo
                })
            }
        });
        //一開始用帳密跟學校換餅乾
        //然後餅乾存在 session 裡面
    });

}

exports.getScore = (cookie, res) => {
    request({
        url: "http://register.tlhc.ylc.edu.tw/hcode/STD_SCORE.asp",
        method: "GET",
        encoding: null,
        headers: {
            //some header
            'Cookie': cookie,
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:60.0) Gecko/20100101 CuteDick/60.0',
            //some header
        }
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
            id: $("form[action=\"STD_SCORE.asp\"] table .DataTD:nth-child(2) .DataFONT").text().replace(/\n/g, ''),
            name: $("form[action=\"STD_SCORE.asp\"] table .DataTD:nth-child(4) .DataFONT").text().replace(/\n/g, ''),
            class: $("form[action=\"STD_SCORE.asp\"] table .DataTD:nth-child(6) .DataFONT").text().replace(/\n/g, ''),
            num: $("form[action=\"STD_SCORE.asp\"] table .DataTD:nth-child(8) .DataFONT").text().replace(/\n/g, ''),
        }

        var score = $("body>center>table:nth-child(3) td>table>tbody")
        var total = $("body>center>table:nth-child(4) td>table>tbody")
        res.render('s-score-view', {
            title: 'ㄉㄌㄐㄕ - 成績',
            user: user,
            score: score.html().replace(/\n/g, ''),
            total: total.html().replace(/\n/g, ''),
            system: true
        })
    });
}

exports.getDay = (cookie, res) => {
    request({
        url: "http://register.tlhc.ylc.edu.tw/hcode/STD_DAY.asp",
        method: "GET",
        encoding: null,
        headers: {
            //some header
            'Cookie': cookie,
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:60.0) Gecko/20100101 CuteDick/60.0',
            //some header
        }
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
            id: $("form[action=\"STD_DAY.asp\"] table .DataTD:nth-child(2) .DataFONT").text().replace(/\n/g, ''),
            name: $("form[action=\"STD_DAY.asp\"] table .DataTD:nth-child(4) .DataFONT").text().replace(/\n/g, ''),
            class: $("form[action=\"STD_DAY.asp\"] table .DataTD:nth-child(6) .DataFONT").text().replace(/\n/g, ''),
            num: $("form[action=\"STD_DAY.asp\"] table .DataTD:nth-child(8) .DataFONT").text().replace(/\n/g, ''),
        }
        var day = $("body>center>table:nth-child(3)>tbody>tr>td>table>tbody")
        res.render('s-default-view', {
            title: 'ㄉㄌㄐㄕ - 出勤',
            user: user,
            day: day.html().replace(/\n/g, ''),
            system: true
        })
    });
}

exports.getRewards = (cookie, res) => {
    request({
        url: "http://register.tlhc.ylc.edu.tw/hcode/STD_CHK.asp",
        method: "GET",
        encoding: null,
        headers: {
            //some header
            'Cookie': cookie,
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:60.0) Gecko/20100101 CuteDick/60.0',
            //some header
        }
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
            id: $("form[action=\"STD_CHK.asp\"] table .DataTD:nth-child(2) .DataFONT").text().replace(/\n/g, ''),
            name: $("form[action=\"STD_CHK.asp\"] table .DataTD:nth-child(4) .DataFONT").text().replace(/\n/g, ''),
            class: $("form[action=\"STD_CHK.asp\"] table .DataTD:nth-child(6) .DataFONT").text().replace(/\n/g, ''),
            num: $("form[action=\"STD_CHK.asp\"] table .DataTD:nth-child(8) .DataFONT").text().replace(/\n/g, ''),
        }
        var day = $("body>center>table:nth-child(3)>tbody>tr>td>table>tbody")
        res.render('s-default-view', {
            title: 'ㄉㄌㄐㄕ - 獎懲',
            user: user,
            day: day.html().replace(/\n/g, ''),
            rewards: true,
            system: true
        })
    });
}