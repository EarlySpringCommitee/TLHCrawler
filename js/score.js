$(document).ready(function() {

    $("#score ,#total,#day,.color.first.line.table").attr('style', '')
    $("#score tr:first-child ,#total tr:last-child,#day tr:last-child,#rank tr:last-child").remove()
    $('td').removeAttr('class')
    $('#score td ,#total td ,#day td').html(function() {
        var text = $(this).text().replace(/[s]+/g, "");
        if (text < 60 && text > 0) {
            // 不及格
            $(this).addClass('negative')
        }
        if (text <= 100 && text >= 80) {
            // 八十分
            $(this).addClass('positive')
        }
        if (text <= 100 && text >= 0) {
            // 如果是分數，加上等寬字元
            $(this).addClass('score')
        }
        if (text.match('曠課') || text.match('遲到') || text.match('升降旗缺席')) {
            // 壞壞
            $(this).addClass('negative')
        }
        if (text.match('成績輸入期間')) {
            var text = "";
        }
        return text
    })
    $('#rank').removeClass('first line')
    $('#rank td').html(function() {
        var text = $(this).text().replace(/[s]+/g, "");
        if (text.match('成績輸入期間')) {
            var text = "";
        }
        return text
    })
});