$(document).ready(function() {
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

    $('#content table:not(.imagetable)').attr("style", "")
    $('#content table:not(.imagetable)').attr("class", "ts celled table")
    $('#content td').attr("style", "")
    $('#content img').attr('src', function() {
        var osrc = $(this).attr('src')
        return 'http://web.tlhc.ylc.edu.tw' + osrc
    })
    $('#content img').attr("style", "")
    $('#content img').attr("class", "ts centered rounded image")
});

function search() {
    var search = document.getElementById('search').value
    if (!search) {
        alert("未輸入任何內容")
        return
    }
    location.href = '/tlhc/search/' + search
}

function headerImg() {
    if (window.sessionStorage["headerImg"]) {
        var headerImg = window.sessionStorage["headerImg"]
    } else {
        var perviewImg = Trianglify({
            width: 2560,
            height: 2560,
            stroke_width: 200,
            cell_size: 100,
        });
        var headerImg = perviewImg.png()
        window.sessionStorage["headerImg"] = headerImg
    }
    document.write('<img src="' + headerImg + '">');
}