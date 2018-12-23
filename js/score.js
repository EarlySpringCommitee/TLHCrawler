$(document).ready(function () {
    console.time("整理表格")

    function removeScoreProcessing(el) {
        $(el).html(function () {
            let text = $(this).text().trim();
            return (text.match(/成績輸入期間|成績處理期間/)) ? "" : text
        })
    }

    function scoreRating(el) {
        $(el).each(function () {
            let text = $(this).text().trim()
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
    scoreRating(`[data-table="semesterRank"] tr:nth-child(1) > td`)
    $(`[data-table="semesterRank"] tr td:nth-child(1n+2)`).addClass("score")
    // 學期總成績
    scoreRating(`[data-table="semesterScore"] td:nth-child(n+3):not(:nth-child(n+7))`) // 略過學分
    $(`[data-table="semesterScore"] td:nth-child(n+7)`).addClass("score") // 學分加上等寬

    /*/ === 表格整理完畢，耶！ === /*/
    $("table").removeAttr('style')
    console.timeEnd("整理表格")

    /*/ === 產出圖表 === /*/
    generateScoreChart()
    generateSemesterScoreChart()

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

function parseSubjectName(text) {
    let name = $(text).text().replace(/Ⅰ|Ⅱ|Ⅲ|Ⅳ|Ⅴ|Ⅵ|Ⅶ|Ⅷ|Ⅸ|Ⅹ/, '')
    let shortname = {
        "計算機概論": "計概",
        "程式語言": "程式",
        "行動裝置應用程式設計": "APP",
        "健康與護理": "健護",
        "會計學": "會計",
        "經濟學": "經濟",
        "文書處理": "文書",
        "商業概論": "商概",
        "全民國防教育": "國防",
        "基礎化學": "化學",
        "基礎物理": "物理",
        "基礎生物": "生物",
    }
    return shortname[name] || name
}
let removeSubjects = /會計學實習|英語會話/

// 建立圖表
function createChart({
    ctx,
    labels,
    data,
    title = false
}) {
    let score2Color = (score) => {
        let colors = []
        for (n of score) {
            if (n > 80)
                colors.push(`#8BC34A`) //棒    mdui-color-light-green-500
            else if (n < 60)
                colors.push(`#E57373`) //不及格 mdui-color-red-300
            else
                colors.push(`#03A9F4`) //普通   mdui-color-light-blue-500
        }
        return colors
    }
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: score2Color(data)
            }]
        },
        options: {
            title: {
                display: Boolean(title),
                text: title
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

function generateSemesterScoreChart() {
    $(`[data-table="semesterScore"]`).map((i, obj) => {
        if ($(obj).find("tr:nth-child(2) td").text() != "無任何資料") {
            let data = {}
            let subjectName = $(obj).find("tr:nth-child(n+2) td:nth-child(1)").map((i, obj) => parseSubjectName(obj))
            let score = $(obj).find(`tr:nth-child(n+2) td:nth-child(3)`).map((i, obj) => $(obj).text() != "" ? Number($(obj).text()) : false)
            score.map((i, obj) => {
                if (obj && obj != "" && !subjectName[i].match(removeSubjects)) {
                    data[subjectName[i]] = obj
                }
            })
            let randomID = Math.random().toString(36).substr(2)
            if (Object.keys(data).length > 0) {
                $(obj).parent().prev().append(`<div class="sixteen wide column"><canvas id="chart-${randomID}"></canvas></div>`)
                let ctx = document.getElementById(`chart-${randomID}`).getContext('2d')
                createChart({
                    ctx: ctx,
                    labels: Object.keys(data),
                    data: Object.values(data)
                })

            }
        }
    })
}

function generateScoreChart() {
    let subjectName = $(`[data-table="score"] tr:nth-child(n+2) td:nth-child(1)`).map((i, obj) => parseSubjectName(obj))
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
        $(`[data-chart="score"]`).append(`<div class="eight wide column"><canvas id="chart-${name}"></canvas></div>`)
        let ctx = document.getElementById(`chart-${name}`).getContext('2d')
        createChart({
            ctx: ctx,
            labels: Object.keys(data[name]),
            data: score,
            title: title[name]
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