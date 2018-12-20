$(document).ready(function () {
    console.time("整理表格");

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
    console.timeEnd("整理表格");

    /*/ === 產出圖表 === /*/
    generateChart()

    /*/ === 匯出資料 === /*/
    if ($("table")) {
        let downloadDiv = `<div class="mdui-list">`
        let date = new Date().toLocaleString('zh-TW', {
            hour12: false
        }).replace(/ /, "-")
        $("table").each(function (i) {
            downloadDiv += `
            <a class="mdui-list-item mdui-ripple"
               href="${exportReportTableToCSV($(this))}"
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

function generateChart() {
    let subjectName = $(`[data-table="score"] tr:nth-child(n+2) td:nth-child(1)`).map((i, obj) => {
        let name = $(obj).text().replace(/Ⅰ|Ⅱ|Ⅲ|Ⅳ|Ⅴ|Ⅵ|Ⅶ|Ⅷ|Ⅸ|Ⅹ/, '')
        if (name == "計算機概論")
            return "計概"
        if (name == "程式語言")
            return "程式"
        if (name == "行動裝置應用程式設計")
            return "APP"
        if (name == "健康與護理")
            return "健護"
        if (name == "會計學")
            return "會計"
        if (name == "經濟學")
            return "經濟"
        return name
    })
    let midtermExam1Score = $(`[data-table="score"] tr:nth-child(n+2) td:nth-child(2)`).map((i, obj) => $(obj).text())
    let midtermExam2Score = $(`[data-table="score"] tr:nth-child(n+2) td:nth-child(3)`).map((i, obj) => $(obj).text())
    let finalExamScore = $(`[data-table="score"] tr:nth-child(n+2) td:nth-child(5)`).map((i, obj) => $(obj).text())
    let semesterScore = $(`[data-table="score"] tr:nth-child(n+2) td:nth-child(8)`).map((i, obj) => $(obj).text())

    let data = {}
    let title = {
        midtermExam1: "第一次期中考",
        midtermExam2: "第二次期中考",
        finalExam: "期末考",
        semester: "學期成績",
    }
    let removeSubjects = /會計學實習|英語會話/
    //期中考一
    midtermExam1Score.map((i, obj) => {
        if (obj != "" && !subjectName[i].match(removeSubjects)) {
            if (!data.midtermExam1) data.midtermExam1 = {}
            data.midtermExam1[subjectName[i]] = Number(obj)
        }
    })
    //期中考二
    midtermExam2Score.map((i, obj) => {
        if (obj != "" && !subjectName[i].match(removeSubjects)) {
            if (!data.midtermExam2) data.midtermExam2 = {}
            data.midtermExam2[subjectName[i]] = Number(obj)
        }
    })
    //期末考
    finalExamScore.map((i, obj) => {
        if (obj != "" && !subjectName[i].match(removeSubjects)) {
            if (!data.finalExam) data.finalExam = {}
            data.finalExam[subjectName[i]] = Number(obj)
        }
    })
    //學期成績
    semesterScore.map((i, obj) => {
        if (obj != "" && !subjectName[i].match(removeSubjects)) {
            if (!data.semester) data.semester = {}
            data.semester[subjectName[i]] = Number(obj)
        }
    })
    for (name in data) {
        let score = Object.values(data[name])
        let score2Color = (score, alpha = 0.2) => {
            let colors = []
            for (n of score) {
                if (n > 80)
                    colors.push(`rgba(255, 159, 64, ${alpha})`)
                else if (n < 60)
                    colors.push(`rgba(255, 99, 132, ${alpha})`)
                else
                    colors.push(`rgba(54, 162, 235, ${alpha})`)
            }
            return colors
        }
        $(`[data-chart="score"]`).append(`<div class="column"><canvas id="chart-${name}"></canvas></div>`)
        var ctx = document.getElementById(`chart-${name}`).getContext('2d')
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(data[name]),
                datasets: [{
                    data: score,
                    backgroundColor: score2Color(score),
                    borderColor: score2Color(score, 1),
                    borderWidth: 1
                }]
            },
            options: {
                title: {
                    display: true,
                    text: title[name]
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true,
                            max: 100
                        }
                    }]
                },
                layout: {
                    padding: 5
                },
                legend: {
                    display: false
                }
            }
        })
    }

}
// https://stackoverflow.com/questions/24610694/export-html-table-to-csv-in-google-chrome-browser/24611096
function exportReportTableToCSV($table) {
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