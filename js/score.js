$(document).ready(function () {
    function removeScoreProcessing(el) {
        $(el).html(function () {
            let text = $(this).text().trim();
            return (text.match(/成績輸入期間|成績處理期間/)) ? "" : text
        })
    }

    function scoreRating(el) {
        $(el).html(function () {
            let text = $(this).text().trim();
            if (text < 60 && text > 0 || text == '0') {
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
            return text
        })
    }

    function othersRating(el) {
        $(el).html(function () {
            let text = $(this).text().trim();
            if (text.match(/大功|小功|嘉獎/)) {
                // 棒棒
                $(this).addClass('positive')
            }
            if (text.match(/曠課|遲到|升降旗缺席|小過|警告|缺點/)) {
                // 壞壞
                $(this).addClass('negative')
            }
            return text
        })
    }

    $("[data-table] tr:last-child").remove()
    $("[data-table=\"semesterRank\"]").removeClass("first line")
    $('td').removeAttr('class')
    $('td').html(function () {
        return $(this).text().trim()
    })

    /*/ === 移除「成績輸入期間、成績處理期間」 === /*/
    removeScoreProcessing(`[data-table="score"] td`) //本學期段考成績
    removeScoreProcessing(`[data-table="rank"] td`) //本學期段考排名
    removeScoreProcessing(`[data-table="semesterRank"] td`) //學期排名
    removeScoreProcessing(`[data-table="semesterScore"] td`) //學期總成績

    /*/ === 分數閃亮亮 === /*/
    // 本學期段考成績
    scoreRating(`[data-table="score"] td`)
    // 本學期段考排名
    scoreRating(`[data-table="rank"] tr:nth-child(2) td:nth-child(n+2)`)
    $(`[data-table="rank"] tr:nth-child(n+1) td:nth-child(n+2)`).addClass("score")
    // 學期排名
    scoreRating(`[data-table="semesterRank"] tr:nth-child(1) > td.score`)
    $(`[data-table="semesterRank"] tr td:nth-child(1n+2)`).addClass("score")
    // 學期總成績
    scoreRating(`[data-table="semesterScore"] td:nth-child(n+3):not(:nth-child(n+7))`) // 略過學分
    $(`[data-table="semesterScore"] td:nth-child(n+7)`).addClass("score") // 學分加上等寬

    /*/ === 獎懲、出勤閃亮亮 === /*/
    othersRating(`[data-table="rewards"] td`) // 獎懲
    othersRating(`[data-table="day"] td`) // 出勤

    /*/ === 表格整理完畢，耶！ === /*/
    $("table").removeAttr('style')

    // 匯出資料
    if ($("table")) {
        let downloadDiv = `<div class="mdui-list">`
        let date = new Date().toLocaleString('zh-TW').replace(/ /, "_")
        $("table").each(function (i) {
            downloadDiv += `
            <a class="mdui-list-item mdui-ripple"
               href="${exportReportTableToCSV($(this), '匯出.csv')}"
               download="${$(this).attr('data-name')}_${date}_ㄉㄌㄐㄕ匯出.csv">
                <i class="mdui-list-item-icon mdui-icon material-icons">insert_drive_file</i>
                <div class="mdui-list-item-content">
                    <div class="mdui-list-item-title">${$(this).attr('data-name')}</div>
                    <div class="mdui-list-item-text">${$(this).attr('data-name')}_${date}_ㄉㄌㄐㄕ匯出.csv</div>
                </div>
            </a>
             `
        })
        downloadDiv += `</div>`
        $('#export').html(downloadDiv)
    }
});

// https://stackoverflow.com/questions/24610694/export-html-table-to-csv-in-google-chrome-browser/24611096
function exportReportTableToCSV($table, filename) {
    var dumpd = '';
    var csvData = '';
    $table.each(function () {
        var $rows = $(this).find('tr:has(td)');
        var $header = $(this).find('tr:has(th)');

        tmpColDelim = String.fromCharCode(11), // vertical tab character
            tmpRowDelim = String.fromCharCode(0), // null character

            colDelim = '","',
            rowDelim = '"\r\n"',

            csv = '"' + $header.map(function (i, head) {
                var $head = $(head),
                    $cols = $head.find('th');

                return $cols.map(function (j, col) {
                    var $col = $(col),
                        text = $col.text();

                    if (text == "&nbsp;")
                        text = "";
                    if (text == "PROGRAMS")
                        text = "";
                    return text.replace('"', '""');

                }).get().join(tmpColDelim);

            }).get().join(tmpRowDelim)
            .split(tmpRowDelim).join(rowDelim)
            .split(tmpColDelim).join(colDelim) + '"';

        csv += '\r\n';

        csv += '"' + $rows.map(function (i, row) {
                var $row = $(row),
                    $cols = $row.find('td');

                return $cols.map(function (j, col) {
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
        dumpd = dumpd.replace(/""\r\n/, '')
    })
    var csvData = new Blob(["\uFEFF" + dumpd], {
        type: 'text/csv;charset=utf-8;'
    });
    var csvUrl = URL.createObjectURL(csvData);
    return csvUrl
}