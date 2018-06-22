$(document).ready(function() {
    readContent()
    $.ripple(".items a.item,.ts.button,a.card,.menu a.item", {
        debug: false, // Turn Ripple.js logging on/off
        on: 'mousedown', // The event to trigger a ripple effect
        opacity: 0.3, // The opacity of the ripple
        color: "auto", // Set the background color. If set to "auto", it will use the text color
        multi: true, // Allow multiple ripples per element
        duration: 0.4, // The duration of the ripple
        // Filter function for modifying the speed of the ripple
        rate: function(pxPerSecond) {
            return pxPerSecond;
        },
        easing: 'linear' // The CSS3 easing function of the ripple
    });
    $('#search').keypress(function(e) {
        if (e.which == 13) {
            search()
        }
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
    $('#content td').html(function() {
        return $(this).text()
    })
    $('#content img').attr('src', function() {
        var osrc = $(this).attr('src')
        return 'http://web.tlhc.ylc.edu.tw' + osrc
    })
    $('#content img').removeAttr("style")
    $('#content img').attr("class", "ts centered rounded image")
}