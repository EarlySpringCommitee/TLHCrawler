// 載入
const fs = require('fs'); //檔案系統
const tlhcRequest = require('./TLHCrequest.js'); //因為程式碼太長分出來的模塊
const tlhcScore = require('./tlhcScore.js'); //因為程式碼太長分出來的模塊
const excerpt = require("html-excerpt"); // 取摘要
const request = require("request"); // HTTP 客戶端輔助工具
const cheerio = require("cheerio"); // Server 端的 jQuery 實作
const express = require('express'); // Node.js Web 架構
const bodyParser = require('body-parser'); // 讀入 post 請求
const session = require('express-session');
const iconv = require('iconv-lite'); // ㄐㄅ的編碼處理
const app = express()
app.set('views', __dirname + '/views');
app.set('view engine', 'pug')
app.use(bodyParser.urlencoded({
    extended: true,
}));

//拿餅乾
app.use(session({
    secret: 'ㄐㄐ讚',
    resave: false,
    saveUninitialized: false,
}));
//發餅乾
app.use('/js', express.static('js'))
app.use('/css', express.static('css'))
app.use('/icon', express.static('icon'))
    //設定 /js /icon /css 目錄

app.listen(3000, () => {
    console.log("")
    console.log("   ╭─────────────────────────────────────╮")
    console.log("   │                                     │")
    console.log("   │    TLHCrawler                       │")
    console.log("   │    github.com/TWScore/TLHCrawler    │")
    console.log("   │                                     │")
    console.log("   ╰─────────────────────────────────────╯")
    console.log('\n' + Date())
    console.log("working on http://localhost:3000\n")
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
    links = [{
        'header': '校園公告',
        'description': '好像很重要，又沒那麼重要',
        'link': '/tlhc/pages/40-1001-15-1.php'
    }, {
        'header': '榮譽榜',
        'description': '實際上沒人去看的東西，只會害你升旗站更久',
        'link': '/tlhc/pages/40-1001-38-1.php'
    }, {
        'header': '轉知資訊-政令宣導',
        'description': '一些比賽跟你完全不會想點進去看的東西',
        'link': '/tlhc/pages/40-1001-29-1.php'
    }, {
        'header': '圖書館公告',
        'description': '消失在學校網頁上ㄉ圖書館公告',
        'link': '/tlhc/pages/40-1001-21-1.php'
    }, {
        'header': '獎助學金公告',
        'description': '能拿錢的情報',
        'link': '/tlhc/pages/40-1001-30-1.php'
    }, {
        'header': '教務處公告',
        'description': '招生考試之類的',
        'link': '/tlhc/pages/40-1001-28-1.php'
    }]
    someLinks = [{
        'header': '行事曆',
        'description': '可愛的行事曆',
        'link': 'http://web.tlhc.ylc.edu.tw/ezfiles/1/1001/img/7/161383665.pdf'
    }, {
        'header': 'Web 學生選課系統',
        'description': '不安全 Desu',
        'link': 'http://register.tlhc.ylc.edu.tw/stdcourse3/'
    }, {
        'header': '設備報修',
        'description': '設計得很有障礙的表格',
        'link': 'https://docs.google.com/forms/d/e/1FAIpQLSe1ex8qCBmaWWR0BwK4felr_BI4eV2CJ1bM0eng71OfrsUKsw/viewform'
    }, {
        'header': '學生社團選填',
        'description': '我賭一百隻長頸鹿跟成績系統同一家出的',
        'link': 'http://register.tlhc.ylc.edu.tw/clgstd/Index.aspx'
    }, {
        'header': '志工服務管理系統',
        'description': '跟成績系統同一家的系統',
        'link': 'http://163.27.124.31/EPSTD/'
    }, {
        'header': '首頁',
        'description': '對，就是學校首頁',
        'link': 'http://web.tlhc.ylc.edu.tw/bin/home.php'
    }, {
        'header': '雲端社群播客(哀居踢)',
        'description': '幹不要把文字放進圖片',
        'link': 'http://igtplus.tlhc.ylc.edu.tw/'
    }]
    res.render('index', { title: 'ㄉㄌㄐㄕ - 公告' })
})
app.get('/about/', (req, res) => {
    res.render('about', { title: 'ㄉㄌㄐㄕ - 關於' });
});
//------------公佈欄------------
// ㄉㄌㄐㄕ
app.get('/tlhc/pages/:id', (req, res) => {
    var originalURL = "http://web.tlhc.ylc.edu.tw/files/" + req.params.id
    tlhcRequest.getPage(originalURL, req.params.id, res)
});

app.get('/tlhc/post/:id', (req, res) => {
    //res.send('USER ' + req.params.id);
    var originalURL = "http://web.tlhc.ylc.edu.tw/files/" + req.params.id
    tlhcRequest.getPost(originalURL, req.params.id, res)
});

app.get('/tlhc/search/:id', (req, res) => {
    tlhcRequest.search(req.params.id, res)
});
//------------成績系統------------
//登入
app.get('/tlhc/login/', (req, res) => {
    res.render('s-login', {
        title: 'ㄉㄌㄐㄕ - 登入',
        post: '/tlhc/login/',
        system: true
    });
});
app.post('/tlhc/login/', (req, res) => {
    tlhcScore.getCookie(req, res)
});
//成績
app.get('/tlhc/score/', (req, res) => {
    if (req.session.tlhc) {
        tlhcScore.getScore(req.session.tlhc, res)
    } else {
        res.redirect("/tlhc/login/")
    }
});
//出勤
app.get('/tlhc/day/', (req, res) => {
    if (req.session.tlhc) {
        tlhcScore.getDay(req.session.tlhc, res)
    } else {
        res.redirect("/tlhc/login/")
    }
});
//獎
app.get('/tlhc/rewards/', (req, res) => {
    if (req.session.tlhc) {
        tlhcScore.getRewards(req.session.tlhc, res)
    } else {
        res.redirect("/tlhc/login/")
    }
});
// 登出
app.get('/tlhc/score/logout', (req, res) => {
    req.session.destroy()
    res.redirect("/tlhc/score/")
});
//------------錯誤頁------------
app.use((req, res, next) => {
    res.status(404).render('error', { title: '錯誤 - 404', message: '看來我們找不到您要的東西' })
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { title: '錯誤 - 500', message: '看來工程師不小心打翻了香菇雞湯' })
}); // error