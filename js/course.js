Sortable.create(items, { animation: 150 });
$(function() {
    $("#save").click(function() {
        $(this).addClass("loading")
        let sub = $("[data-hiddenInputs]")
        let req = []
        for (var i = 0; i < sub.length; i++)
            req.push(JSON.parse($(sub[i]).attr("data-hiddenInputs")))
        $.post("/tlhc/course/", { "data": req })
            .done(function(data) {
                if (data)
                    snackbar("已儲存選課志願")
                else
                    snackbar("儲存失敗：（")
                window.location.reload()
            });
        $(this).removeClass("loading")
    })
})