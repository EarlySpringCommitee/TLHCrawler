$(document).ready(function() {
    readContent()
    $('#search').keypress(function(e) {
        if (e.which == 13) {
            search()
        }
    });
    $('a.ts.card[href^="/tlhc/"').click(function() {
        $(this).find("i.icon").attr('class', 'notched circle loading icon')
    });
    // 幻燈片
    $('.slick').slick({
        dots: true,
        fade: true,
        speed: 500,
        autoplay: true,
        autoplaySpeed: 2000,
        arrows: false
    });
    cheet('↑ ↑ ↓ ↓ ← → ← → b a', function() {
        $("body").attr("style", "transform: skewY(6deg);transition: all .4s;")
    });
});

function search() {
    var search = document.getElementById('search').value
    if (!search) {
        swal({
            title: "糟糕！",
            text: "您未輸入任何關鍵字",
            icon: "error",
        });
        return
    }
    $('[onclick="search()"]').addClass('loading')
    location.href = '/tlhc/search/' + search + '/1'
}



function readContent() {


    $('#content table:not(.imagetable)').attr("class", "ts celled table").removeAttr("border").removeAttr("style")
    $('#content table:not(.imagetable)').wrap('<div class="gs scroll"></div>')

    $('#content td,#content tr').removeAttr("style").removeAttr("nowrap")
    $('#content img').attr('src', function() {
        var osrc = $(this).attr('src')
        return 'http://web.tlhc.ylc.edu.tw' + osrc
    })
    $('#content img').removeAttr("style")
    $('#content img').attr("class", "ts centered rounded image")
    $('#content a').attr("href", function() {
        let href = $(this).attr("href")
        if (href.indexOf('http://web.tlhc.ylc.edu.tw/files/') > -1) {
            let href = href.replace(new RegExp('http://web.tlhc.ylc.edu.tw/files/', "g"), '/tlhc/post/')
        }
        return href
    })
}