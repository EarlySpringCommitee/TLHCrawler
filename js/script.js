$(document).ready(function() {
    $.ripple(".items a.item,.menu a.item,.ts.button,a.card", {
        debug: false, // Turn Ripple.js logging on/off
        on: 'mousedown', // The event to trigger a ripple effect

        opacity: 0.4, // The opacity of the ripple
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
    $('#content td').attr("style", "")
    $('#content table').attr("style", "")
    $('#content table').attr("class", "ts celled table")
});

function search() {
    var search = document.getElementById('search').value
    if (!search) {
        alert("未輸入任何內容")
        return;
    }
    location.href = '/tlhc/search/' + search
}