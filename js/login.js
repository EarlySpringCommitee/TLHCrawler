function check() {
    //讀取中喔
    $("[type=\"submit\"]").addClass("loading");
    //獲取 form 表單輸入:使用者名稱,密碼,是否保存密碼
    var username = document.getElementById("userID").value.trim();
    var password = document.getElementById("userPASS").value.trim();

    //判斷使用者名稱,密碼是否為空(全空格也算空)
    if (username.length != 0 && password.length == 10) {
        $.ajax({
                type: "POST",
                url: '.',
                data: {
                    userID: username,
                    userPASS: password
                }
            })
            .done(function (data) {
                if (data) {
                    location.href = '../score/'
                } else
                    swal({
                        title: "錯誤！",
                        text: "請確認學號及身分證是否填寫正確",
                        icon: "error",
                    });
            })
            .fail(function () {
                swal({
                    title: "喔不",
                    text: "發生了未知的錯誤",
                    icon: "error",
                });
            })

        return false;
    }
    //非法輸入提示
    else {
        swal({
            title: "喔不",
            text: "請正確填寫學號及身分證字號",
            icon: "error",
        });

        $("[type=\"submit\"]").removeClass("loading");
        return false;
    }
}