const TLHCrawlerLogo = `
88888 8 8                               8            
  8   8 8d8b. .d8b 8d8b .d88 Yb  db  dP 8 .d88b 8d8b 
  8   8 8P Y8 8    8P   8  8  YbdPYbdP  8 8.dP' 8P   
  8   8 8   8  Y8P 8     Y88   YP  YP   8  Y88P 8 
`
    // 載入
const fs = require('fs'); //檔案系統
const tlhcRequest = require('./TLHCrequest.js'); //請求模組
const tlhcScore = require('./TLHCScore.js'); //成績系統模組
const config = require('./config.js'); //設定檔
const excerpt = require("html-excerpt"); // 取摘要
const request = require("request"); // HTTP 客戶端輔助工具
const cheerio = require("cheerio"); // Server 端的 jQuery 實作
const express = require('express'); // Node.js Web 架構
const bodyParser = require('body-parser'); // 讀入 post 請求
const session = require('express-session');
const iconv = require('iconv-lite'); // ㄐㄅ的編碼處理
const Base64 = require('js-base64').Base64; // Base64
const helmet = require('helmet'); // 防範您的應用程式出現已知的 Web 漏洞
const moment = require('moment-timezone'); // 時間處理
moment.locale('zh-tw');
moment.tz.setDefault("Asia/Taipei");

const app = express()
app.set('views', __dirname + '/views');
app.set('view engine', 'pug')
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet.hidePoweredBy({ setTo: 'PHP/5.2.1' }));
//拿餅乾
app.use(session({
    secret: 'ㄐㄐ讚' + Math.random().toString(36).substr(2),
    resave: false,
    saveUninitialized: false,
}));
//發餅乾

//設定 /js /icon /css 目錄
app.use('/js', express.static('js'))
app.use('/css', express.static('css'))
app.use('/icon', express.static('icon'))


app.listen(3000, () => {
    console.log(TLHCrawlerLogo)
    console.log("🌏 http://localhost:3000")
    console.log(moment().format("🕒 YYYY/MM/DD HH:mm"))
})

app.get('/og/og.png', (req, res) => {
    var files = fs.readdirSync("./ogimage/").filter(function(i, n) {
        if (i.toString().indexOf('.png') > -1 && i.toString().indexOf('._') < 0)
            return i
    });
    //og
    var imgnum = Math.floor(Math.random() * files.length);
    var img = __dirname + "/ogimage/" + files[imgnum]
    try {
        res.sendFile(img)
    } catch (err) {}
});
//------------可愛的首頁------------
app.get('/', (req, res) => {
    let links = config.links
    let slide = config.slide
    res.render('index', { title: 'ㄉㄌㄐㄕ', links: links, slide: slide })
})
app.get('/about/', (req, res) => {
    res.render('about', { title: 'ㄉㄌㄐㄕ - 關於' });
});
//------------公佈欄------------
// ㄉㄌㄐㄕ
app.get('/tlhc/pages/:id', (req, res) => {
    let url = Base64.decode(req.params.id)
    if (url.indexOf(".php") > -1) {
        var originalURL = "http://web.tlhc.ylc.edu.tw/files/" + url
        tlhcRequest.getPage(originalURL, Base64.decode(req.params.id), res)
    } else {
        res.status(404).render('error', { title: '錯誤 - 404', message: '看來我們找不到您要的東西' })
    }
});

app.get('/tlhc/post/:id', (req, res) => {
    let url = Base64.decode(req.params.id)
    if (url.indexOf(".php") > -1) {
        var originalURL = "http://web.tlhc.ylc.edu.tw/files/" + url
        tlhcRequest.getPost(originalURL, Base64.decode(req.params.id), res)
    } else {
        res.status(404).render('error', { title: '錯誤 - 404', message: '看來我們找不到您要的東西' })
    }
});

app.get('/tlhc/search/', (req, res) => {
    res.render('tlhc-search', { title: 'ㄉㄌㄐㄕ - 搜尋' })
});
app.get('/tlhc/search/:id/:page', (req, res) => {
    tlhcRequest.search(req.params.id, res, req.params.page)
});
//------------成績系統------------
// 登入
app
    .get('/tlhc/login/', (req, res) => {
        res.render('s-login', {
            title: 'ㄉㄌㄐㄕ - 登入',
            post: '/tlhc/login/',
            system: true
        });
    })
    .post('/tlhc/login/', (req, res) => {
        tlhcScore.getCookie(req, res)
    });
// 登出
app.get('/tlhc/score/logout', (req, res) => {
    req.session.destroy()
    res.redirect("/tlhc/login/")
});
//------- 成績
app.get('/tlhc/score/', (req, res) => {
    if (req.session.tlhc) {
        tlhcScore.getScorePage(req.session.tlhc, res)
    } else {
        res.redirect("/tlhc/login/")
    }
});
//------- 出勤
app.get('/tlhc/attendance/', (req, res) => {
    if (req.session.tlhc) {
        tlhcScore.getAttendance(req.session.tlhc, res)
    } else {
        res.redirect("/tlhc/login/")
    }
});
//------- 獎懲
app.get('/tlhc/rewards/', (req, res) => {
    if (req.session.tlhc) {
        tlhcScore.getRewardsPage(req.session.tlhc, res)
    } else {
        res.redirect("/tlhc/login/")
    }
});
//------- 社團及幹部
app.get('/tlhc/group/', (req, res) => {
    if (req.session.tlhc) {
        tlhcScore.getGroupPage(req.session.tlhc, res)
    } else {
        res.redirect("/tlhc/login/")
    }
});
//------- 選課
app
    .get('/tlhc/course/', (req, res) => {
        if (req.session.course) {
            tlhcScore.getCoursePage(req.session.course, res)
        } else {
            res.redirect("/tlhc/login/")
        }
    })
    .post('/tlhc/course/', (req, res) => {
        tlhcScore.saveCoursePage(req, res)
    });
//------- 瀏覽匯出資料
app.get('/tlhc/csv/', (req, res) => {
    if (req.session.tlhc) {
        tlhcScore.getCSV(req.session.tlhc, res)
    } else {
        res.redirect("/tlhc/login/")
    }
});
//------------錯誤頁------------
app.use((req, res, next) => {
    res.status(404).render('error', { title: '錯誤 - 404', message: '看來我們找不到您要的東西' })
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { title: '錯誤 - 500', message: '看來工程師不小心打翻了香菇雞湯' })
}); // error