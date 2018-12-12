const Base64 = require('js-base64').Base64; // Base64
exports.links = [{
    "name": "學校佈告欄",
    "table": [{
        "header": "校園公告",
        "description": "來看看學校最新的公告",
        "link": "/tlhc/pages/" + Base64.encodeURI("40-1001-15-1.php"),
        "icon": "graduation cap "
    }, {
        "header": "榮譽榜",
        "description": "哇嗚",
        "link": "/tlhc/pages/" + Base64.encodeURI("40-1001-38-1.php"),
        "icon": "flag checkered"
    }, {
        "header": "轉知資訊-政令宣導",
        "description": "吼吼",
        "link": "/tlhc/pages/" + Base64.encodeURI("40-1001-29-1.php"),
        "icon": "announcement"
    }, {
        "header": "圖書館公告",
        "description": "消失在學校網頁上ㄉ圖書館公告",
        "link": "/tlhc/pages/" + Base64.encodeURI("40-1001-21-1.php"),
        "icon": "book"
    }, {
        "header": "獎助學金公告",
        "description": "能拿錢的情報",
        "link": "/tlhc/pages/" + Base64.encodeURI("40-1001-30-1.php"),
        "icon": "dollar sign "
    }, {
        "header": "教務處公告",
        "description": "招生考試之類的",
        "link": "/tlhc/pages/" + Base64.encodeURI("40-1001-28-1.php"),
        "icon": "announcement"
    }]
}, {
    "name": "校內相關連結",
    "table": [{
        "header": "Web 學生選課系統",
        "description": "庫",
        "link": "http://register.tlhc.ylc.edu.tw/stdcourse3/",
        "icon": "external link alt"
    }, {
        "header": "設備報修",
        "description": "設備組那邊ㄉ",
        "link": "https://docs.google.com/forms/d/e/1FAIpQLSe1ex8qCBmaWWR0BwK4felr_BI4eV2CJ1bM0eng71OfrsUKsw/viewform",
        "icon": "external link alt"
    }, {
        "header": "學生社團選填",
        "description": "只有上學期初才會開放",
        "link": "http://register.tlhc.ylc.edu.tw/ClgStd/",
        "icon": "external link alt"
    }, {
        "header": "志工服務管理系統",
        "description": "庫",
        "link": "http://163.27.124.31/EPSTD/",
        "icon": "external link alt"
    }, {
        "header": "學校首頁",
        "description": "學校ㄉ首頁",
        "link": "http://web.tlhc.ylc.edu.tw/bin/home.php",
        "icon": "external link alt"
    }, {
        "header": "雲端社群播客(哀居踢)",
        "description": "好",
        "link": "http://igtplus.tlhc.ylc.edu.tw/",
        "icon": "external link alt"
    }]
}]
exports.slide = [{
    "header": "哈囉！",
    "description": "ㄉㄌㄐㄕ歡迎尼",
    "img": "https://i.imgur.com/8NPV00a.png",
    "link": "#"
}, {
    "header": "大改版！",
    "description": "新版成績系統上線啦",
    "img": "https://i.imgur.com/5X7rJkV.jpg",
    "link": "/tlhc/login/"
}, {
    "header": "API",
    "description": "歡迎使用",
    "img": "https://i.imgur.com/pJnIOpJ.jpg",
    "link": "/api"
}, {
    "header": "加入橫幅",
    "description": "免費在此加入您的橫幅",
    "img": "https://i.imgur.com/PpiLxni.png",
    "link": "http://telegra.ph/addtlhc-05-26"
}]