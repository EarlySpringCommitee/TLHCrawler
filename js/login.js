function check() {
    //讀取中喔
    $("[type=\"submit\"]").addClass("loading");
    //獲取 form 表單輸入:使用者名稱,密碼,是否保存密碼
    var username = document.getElementById("userID").value.trim();
    var password = document.getElementById("userPASS").value.trim();
    var isRmbPwd = document.getElementById("isRmbPwd").checked;

    //判斷使用者名稱,密碼是否為空(全空格也算空)
    if (username.length != 0 && password.length == 10) {
        return true;
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