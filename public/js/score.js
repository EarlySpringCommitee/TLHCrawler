$(document).ready(function () {
    /*/ === 產出圖表 === /*/
    generateScoreChart()
    generateSemesterScoreChart()

    /*/ === 匯出資料 === /*/
    if ($("table")) {
        let downloadDiv = $(`<div class="mdui-list"></div>`)
        let date = new Date().toLocaleString('zh-TW', {
            hour12: false
        }).replace(/ /, "-")
        $("table").each(function (i) {
            let item = $(`
            <a class="mdui-list-item mdui-ripple"
               href="${exportReportTableToCSV($(this))}"
               download="${$(this).attr('data-name')}_${date}_ㄉㄌㄐㄕ匯出.csv">
                <i class="mdui-list-item-icon mdui-icon material-icons">insert_drive_file</i>
                <div class="mdui-list-item-content">
                    <div class="mdui-list-item-title">${$(this).attr('data-name')}</div>
                    <div class="mdui-list-item-text">${$(this).attr('data-name')}_${date}_ㄉㄌㄐㄕ匯出.csv</div>
                </div>
            </a>
             `)
            $(downloadDiv).append(item)
        })
        $('#export').html(downloadDiv)
    }
});

function parseSubjectName(text) {
    let name = $(text).text().replace(/Ⅰ|Ⅱ|Ⅲ|Ⅳ|Ⅴ|Ⅵ|Ⅶ|Ⅷ|Ⅸ|Ⅹ/, '')
    switch (true) {
        case /計算機概論|計算機應用/.test(name):
            return "計概"
        case /行動裝置應用/.test(name):
            return "APP"
        case /程式/.test(name):
            return "程式"
        case /健康與護理/.test(name):
            return "健護"
        case /會計/.test(name):
            return "會計"
        case /經濟/.test(name):
            return "經濟"
        case /商業概論/.test(name):
            return "商概"
        case /化學/.test(name):
            return "化學"
        case /物理/.test(name):
            return "物理"
        case /生物/.test(name):
            return "生物"
        case /文書/.test(name):
            return "文書"
        case /國防/.test(name):
            return "國防"
        case /物聯網互動科/.test(name):
            return "IoT"
        case /電子商務/.test(name):
            return "電商"
        case /專題/.test(name):
            return "專題"
        case /公民與社會/.test(name):
            return "公民"
        case /網際網路應用實務/.test(name):
            return "網路"
        case /法律與生活/.test(name):
            return "法律"
        case /資料庫應用/.test(name):
            return "資料庫"
        default:
            return name
    }

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
            if (n >= 80)
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
                padding: {
                    bottom: 5
                }
            },
            legend: {
                display: false,
                labes: {
                    usePotintStyle: true
                }
            },
            plugins: {
                datalabels: {
                    align: 'start',
                    anchor: 'end',
                    color: 'white'
                }
            }
        },
        plugins: [ChartDataLabels],
    })
}

function generateSemesterScoreChart() {
    $(`[data-table="semesterScore"]`).map((i, obj) => {
        if ($(obj).find("tr:nth-child(2) td").text() != "無任何資料") {
            let data = {}
            let subjectName = $(obj).find("tr:nth-child(n+2) td:nth-child(1)").map((i, obj) => parseSubjectName(obj))
            let score = $(obj).find(`tr:nth-child(n+2) td:nth-child(3)`).map((i, obj) => $(obj).text() != "" ? Number($(obj).text()) : false)
            let scoreMakeUp = $(obj).find(`tr:nth-child(n+2) td:nth-child(4)`).map((i, obj) => $(obj).text() != "" ? Number($(obj).text()) : false)
            let scoreRetake = $(obj).find(`tr:nth-child(n+2) td:nth-child(5)`).map((i, obj) => $(obj).text() != "" ? Number($(obj).text()) : false)
            let scoreAdjustment = $(obj).find(`tr:nth-child(n+2) td:nth-child(6)`).map((i, obj) => $(obj).text() != "" ? Number($(obj).text()) : false)
            score.map((i, obj) => {
                if (obj && obj != "" && !subjectName[i].match(removeSubjects)) {
                    data[subjectName[i]] = Math.max(obj, scoreMakeUp[i], scoreRetake[i], scoreAdjustment[i])
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
    let scoreMakeUp = $(`[data-table="score"] tr:nth-child(n+2) td:nth-child(6)`).map((i, obj) => $(obj).text() != "" ? Number($(obj).text()) : false)
    let scoreRetake = $(`[data-table="score"] tr:nth-child(n+2) td:nth-child(7)`).map((i, obj) => $(obj).text() != "" ? Number($(obj).text()) : false)
    let semesterScore = $(`[data-table="score"] tr:nth-child(n+2) td:nth-child(8)`).map((i, obj) => $(obj).text())
    let scoreAdjustment = $(`[data-table="score"] tr:nth-child(n+2) td:nth-child(9)`).map((i, obj) => $(obj).text() != "" ? Number($(obj).text()) : false)

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
            data.semester[subjectName[i]] = Math.max(obj, scoreMakeUp[i], scoreRetake[i], scoreAdjustment[i])
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