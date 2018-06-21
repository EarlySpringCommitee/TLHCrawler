$(document).ready(function() {
    // 匯出資料
    if ($("table")) {
        var downloadDiv = $("<div />");
        $("table").each(function(i) {
            var downloadLink = $("<a />", {
                href: exportReportTableToCSV($(this), '匯出.csv'),
                html: "<i class='download icon'></i>匯出" + $(this).attr('data-name'),
                download: $(this).attr('data-name') + "_ㄉㄌㄐㄕ匯出.csv",
                class: "ts primary labeled icon button",
                style: "margin:0 4px 4px 0"
            })
            downloadDiv.append(downloadLink)
        })
        $('.ts.stackable.three.cards+br').after(downloadDiv)
        downloadDiv.before('<h3 class="ts header">匯出資料<div class="sub header">將表格轉換成 .csv 檔案</div></h3>')
    }
    $("table").removeAttr('style')
    $("[data-table] tr:last-child").remove()
    $("[data-table=\"rank\"]").removeClass("first line")
    $("[data-table=\"score\"] tr:first-child").remove()
    $("[data-table=\"rewards\"] tr:first-child").remove()
    $("[data-table=\"group\"] tr td:last-child").remove()
    $('td').removeAttr('class')
    $('[data-table=\"score\"] td,[data-table=\"day\"] td,[data-table=\"rewards\"] td').html(function() {
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
        if (text.match('大功') || text.match('小功') || text.match('嘉獎')) {
            // 棒棒
            $(this).addClass('positive')
        }
        if (text.match('大過') || text.match('小過') || text.match('警告') || text.match('缺點')) {
            // 壞壞
            $(this).addClass('negative')
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

// https://stackoverflow.com/questions/24610694/export-html-table-to-csv-in-google-chrome-browser/24611096
function exportReportTableToCSV($table, filename) {
    var dumpd = '';
    var csvData = '';

    $table.each(function() {
        var $rows = $(this).find('tr:has(td)');
        var $header = $(this).find('tr:has(th)');

        tmpColDelim = String.fromCharCode(11), // vertical tab character
            tmpRowDelim = String.fromCharCode(0), // null character

            colDelim = '","',
            rowDelim = '"\r\n"',

            csv = '"' + $header.map(function(i, head) {
                var $head = $(head),
                    $cols = $head.find('th');

                return $cols.map(function(j, col) {
                    var $col = $(col),
                        text = $col.text();

                    if (text == "&nbsp;")
                        text = "";
                    if (text == "PROGRAMS")
                        text = "";
                    console.log(text);
                    return text.replace('"', '""');

                }).get().join(tmpColDelim);

            }).get().join(tmpRowDelim)
            .split(tmpRowDelim).join(rowDelim)
            .split(tmpColDelim).join(colDelim) + '"';

        csv += '\r\n';

        csv += '"' + $rows.map(function(i, row) {
                var $row = $(row),
                    $cols = $row.find('td');

                return $cols.map(function(j, col) {
                    var $col = $(col);
                    var text;
                    if ($($(col)).find("input:checkbox").length > 0)
                        text = $($(col)).find("input:checkbox").prop('checked') ? 'Yes' : 'No';
                    else
                        text = $col.text();

                    if (text === "") {
                        text = "";
                    }

                    return text.replace('"', '""');

                }).get().join(tmpColDelim);

            }).get().join(tmpRowDelim)
            .split(tmpRowDelim).join(rowDelim)
            .split(tmpColDelim).join(colDelim) + '"';

        dumpd += csv + "\n\n";
    });

    var csvData = new Blob(["\uFEFF" + dumpd], { type: 'text/csv;charset=utf-8;' });
    var csvUrl = URL.createObjectURL(csvData);
    return csvUrl
}