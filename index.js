const TLHCrawlerLogo = `
88888 8 8                               8            
  8   8 8d8b. .d8b 8d8b .d88 Yb  db  dP 8 .d88b 8d8b 
  8   8 8P Y8 8    8P   8  8  YbdPYbdP  8 8.dP' 8P   
  8   8 8   8  Y8P 8     Y88   YP  YP   8  Y88P 8 
`
// 載入
const tlhcRequest = require('./TLHCrequest.js'); //請求模組
const tlhcScore = require('./TLHCScore.js'); //成績系統模組
const config = require('./config.js'); //設定檔
const express = require('express'); // Node.js Web 架構
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser'); // 讀入 post 請求
const session = require('express-session');
const Base64 = require('js-base64').Base64; // Base64
const helmet = require('helmet'); // 防範您的應用程式出現已知的 Web 漏洞
const moment = require('moment-timezone'); // 時間處理
const schedule = require('node-schedule'); //計時器
const fs = require('fs');
const jsonfile = require('jsonfile')
const breakdance = require('breakdance'); //html 2 md
const bot = process.env.TOKEN || process.argv[2] ? new(require('node-telegram-bot-api'))(process.env.TOKEN || process.argv[2], {
    polling: true
}) : false; //Telegram bot
const botData = jsonfile.readFileSync('./botData.json') || {
    "sentposts": {}
}
moment.locale('zh-tw');
moment.tz.setDefault("Asia/Taipei");
schedule.scheduleJob('0 * * * *', updateTgCh);
// 實現一個等待函數
const delay = (interval) => {
    return new Promise((resolve) => {
        setTimeout(resolve, interval);
    });
};

async function updateTgCh() {
    if (bot) {
        console.log('🤖 已啟用 Telegram bot')
        let pageData = (await tlhcRequest.getPage("http://web.tlhc.ylc.edu.tw/files/40-1001-15-1.php"))
        pageData.posts = pageData.posts.sort(function (a, b) {
            return b - a
        });
        for (i = 0; i < pageData.posts.length; i++) {
            if (!botData.sentposts[pageData.posts[i].link]) {
                let postData = await tlhcRequest.getPost(pageData.posts[i].url)
                if (postData != 404 && postData != "May be a directory") {
                    let link = pageData.posts[i].link ? `https://tlhc.gnehs.net${pageData.posts[i].link}` : ''
                    let title = `<a href="${link}">${postData.title.trim()}</a>`
                    let content = (postData.content && postData.content != postData.title) ? postData.content.replace(/<br>/g, '').replace(/\\n\\n/g, '\n') : ''
                    let msgText = `${title}\n<code>${content}</code>`
                    if (postData.title) {
                        let msg;
                        try {
                            msg = await bot.sendMessage(process.env.botChannelId || process.argv[3], msgText, {
                                parse_mode: "HTML",
                                disable_web_page_preview: true
                            })
                        } catch (e) {
                            msg = await bot.sendMessage(process.env.botChannelId || process.argv[3], `${title}\n本公告含有無法解析內容，請點擊上方連結預覽`, {
                                parse_mode: "HTML",
                                disable_web_page_preview: true
                            })
                        }
                        botData.sentposts[pageData.posts[i].link] = msg.message_id //儲存已發送的文章 id
                        for (j = 0; j < postData.files.length; j++)
                            bot.sendDocument(process.env.botChannelId || process.argv[3],
                                postData.files[j].link, {
                                    parse_mode: "markdown",
                                    reply_to_message_id: msg.message_id,
                                    caption: `📎${postData.files[j].name}\n🌎 [線上預覽](https://docs.google.com/viewer?url=${encodeURIComponent(postData.files[j].link)})`
                                })

                    }
                }
                await delay(10000); //wait 10s
                jsonfile.writeFileSync('./botData.json', botData)
            }
        }
    }
}
updateTgCh()

app.set('views', __dirname + '/views');
app.set('view engine', 'pug')
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(helmet.hidePoweredBy({
    setTo: 'PHP/5.2.1'
}));
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
    var files = fs.readdirSync("./ogimage/").filter(function (i, n) {
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
app.get('/', async (req, res) => {
    let links = config.links
    let slide = config.slide
    let posts = (await tlhcRequest.getPage("http://web.tlhc.ylc.edu.tw/files/40-1001-15-1.php")).posts
    res.render('index', {
        title: 'ㄉㄌㄐㄕ',
        links: links,
        slide: slide,
        posts: posts
    })
})
app.get('/about/', (req, res) => {
    res.render('about', {
        title: 'ㄉㄌㄐㄕ - 關於'
    });
});
//------------公佈欄------------
// ㄉㄌㄐㄕ
app.get('/tlhc/pages/:id', (req, res) => {
    let url = Base64.decode(req.params.id)
    if (url.match(/[0-9]*-[0-9]*-[0-9]*-[0-9]*\.php/)) {
        var originalURL = "http://web.tlhc.ylc.edu.tw/files/" + url
        tlhcRequest.sendPage(originalURL, Base64.decode(req.params.id), res)
    } else {
        res.status(404).render('error', {
            title: '錯誤 - 404',
            message: '看來我們找不到您要的東西'
        })
    }
});

app.get('/tlhc/post/:id', (req, res) => {
    let url = Base64.decode(req.params.id)
    if (url.match(/[0-9]*-[0-9]*-[0-9]*.+\.php/)) {
        var originalURL = "http://web.tlhc.ylc.edu.tw/files/" + url
        tlhcRequest.sendPost(originalURL, Base64.decode(req.params.id), res)
    } else {
        res.status(404).render('error', {
            title: '錯誤 - 404',
            message: '看來我們找不到您要的東西'
        })
    }
});

app.get('/tlhc/search/', (req, res) => {
    res.render('tlhc-search', {
        title: 'ㄉㄌㄐㄕ - 搜尋'
    })
});
app.get('/tlhc/search/:id/:page', (req, res) => {
    tlhcRequest.sendSearch(req.params.id, res, req.params.page)
});
//------------API-------------

app.get('/api', (req, res) => {
    res.render('api', {
        title: 'ㄉㄌㄐㄕ - API'
    })
});
app.get('/api/page', cors(), async (req, res) => {
    res.json(await tlhcRequest.getPage("http://web.tlhc.ylc.edu.tw/files/40-1001-15-1.php"))
});
app.get('/api/page/:id', cors(), async (req, res) => {
    let url = Base64.decode(req.params.id)
    if (url.match(/[0-9]*-[0-9]*-[0-9]*-[0-9]*\.php/)) {
        res.json(await tlhcRequest.getPage("http://web.tlhc.ylc.edu.tw/files/" + url))
    } else {
        res.status(404).send('error')
    }
});

app.get('/api/post/:id', cors(), async (req, res) => {
    let url = Base64.decode(req.params.id)
    if (url.match(/[0-9]*-[0-9]*-[0-9]*.+\.php/)) {
        res.json(await tlhcRequest.getPost("http://web.tlhc.ylc.edu.tw/files/" + url))
    } else {
        res.status(404).send('error')
    }
});
app.get('/api/search/', cors(), async (req, res) => {
    let page = req.query.page ? req.query.page : 1
    res.json(await tlhcRequest.searchPosts(req.query.keyword, page))
});
//------------成績系統------------
// 登入
app
    .get('/system/login/', (req, res) => {
        req.session.tlhc ?
            res.redirect("/system/score/") :
            res.render('s-login', {
                title: 'ㄉㄌㄐㄕ - 登入',
                post: '/tlhc/login/',
                system: true
            })
    })
    .post('/system/login/', (req, res) => tlhcScore.getCookie(req, res));
// 登出
app.get('/system/logout', (req, res) => {
    req.session.destroy()
    res.redirect("/system/login/")
});
//------- 測試頁面
app.get('/system/test/', (req, res) => tlhcScore.getTestPage(req.session.tlhc, res, req));
// 有登入嗎
app.use((req, res, next) => {
    req.session.tlhc || req.path.split("/")[1] != "system" ? next() : res.redirect("/system/login/")
});
//------- 基本資料
app.get('/system/info/', (req, res) => tlhcScore.getInfoPage(req.session.tlhc, res, req));
//------- 成績
app.get('/system/score/', (req, res) => tlhcScore.getScorePage(req.session.tlhc, res, req));
//------- 出勤
app.get('/system/attendance/', (req, res) => tlhcScore.getAttendance(req.session.tlhc, res, req));
//------- 獎懲
app.get('/system/rewards/', (req, res) => tlhcScore.getRewardsPage(req.session.tlhc, res, req));
//------- 社團及幹部
app.get('/system/group/', (req, res) => tlhcScore.getGroupPage(req.session.tlhc, res, req));
//------- 瀏覽匯出資料
app.get('/system/csv/', (req, res) => tlhcScore.getCSV(req.session.tlhc, res, req));
//------------錯誤頁------------
app.use((req, res, next) => {
    res.status(404).render('error', {
        title: 'ㄉㄌㄐㄕ - 錯誤',
        error: 404
    })
});
app.use((err, req, res, next) => {
    console.error(err)
    res.status(500).render('error', {
        title: 'ㄉㄌㄐㄕ - 錯誤',
        error: 500
    })
});