$(document).ready(function() {

    $("#score ,#total").attr('style', '')
    $("#score tr:first-child ,#total tr:last-child").remove();

    $('#score td ,#total td').html(function() {
        var text = $(this).text()
        if (text < 60 && text > 0) {
            $(this).addClass('negative')
        }
        if (text < 101 && text > 0) {
            $(this).addClass('score')
        }
        return text
    })
});