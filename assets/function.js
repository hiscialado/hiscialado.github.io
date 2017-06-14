firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        $('#passWordDock').hide();
        $('#loginDock').hide();
        $('#logoutDock').show();
        var userName = user.email.replace("@hiscial.com", '');
        $('#userNames').val(userName + "@admin.hiscial.com");
        $('#userNames').attr("disabled", true)
        firebase.database().ref("Account").child(userName).on("value", (snapshot, before) => {
            var isActive = snapshot.val().Active;
            if (isActive == 0) {
                swal({
                    title: "Thông báo",
                    text: "Opps! Bạn không là thành viên được kích hoạt!",
                    type: "warning",
                    showConfirmButton: true,
                    confirmButtonText: "Đăng xuất",
                }, function(isConfirm) {
                    if (isConfirm) {
                        onLogout();
                    }
                });
            }
        });
    } else {
        if (window.location.pathname.indexOf('index.html') < 1) gotoUrl('index.html');
    }
});

firebase.database().ref("Account").on("child_changed", (snapshot, error) => {
    loadUsers();
});

firebase.database().ref("Account").on("child_removed", (snapshot, error) => {
    loadUsers();
});

function getCounters(ref, id) {
    firebase.database().ref(ref).on("value", (snapshot, before) => {
        $('#' + id).html("00" + snapshot.numChildren());
    });
}

function dialogLoading() {
    swal({
        title: "Đang tải trang",
        timer: 2000,
        text: "Thông báo sẽ tự động tắt",
        showConfirmButton: false,
        type: "success"
    });
}

function onLogin() {
    var userName = $('#userNames').val();
    var password = $('#passWords').val();
    if (userName != '' && password != '') {
        firebase.auth().signInWithEmailAndPassword(userName + "@hiscial.com", password).catch(function(error) {
            var errorCode = error.code;
            swal({
                title: "Thông tin sai",
                text: errorCode,
                type: "error",
                timer: 1500,
                showConfirmButton: false
            });
        });
    } else {
        swal({
            title: "Opps!",
            text: "Vui lòng nhập thông tin đầy đủ",
            type: "error",
            timer: 1500,
            showConfirmButton: false
        });
    }
}

function gotoUrl(url) {
    window.location.href = url;
}

function onLogout() {
    firebase.auth().signOut();
    gotoUrl('');
}

function loadUsers() {
    $('#danhSachThanhVien').html("");
    firebase.database().ref("Account").on("child_added", (snapshot, error) => {
        var isActive = "Chưa kích hoạt";
        var color = "btn-danger";
        if (snapshot.val().Active == 1) {
            isActive = "Đã kích hoạt";
            var color = "btn-success";
        }
        $('#danhSachThanhVien').append(`
            <div class="col-md-6" style="margin-bottom: 20px;">
                <div class="media" style="padding: 10px; border-style: solid; border-width: 1px; border-radius: 5px; border-color: #EEE;">
                    <img class="d-flex mr-3" style="max-width: 100px; border-radius: 10px;" src="` + snapshot.val().Photos + `">
                    <div class="media-body">
                        <h5 class="mt-0 mb-1" style="padding-top: 10px; padding-bottom: 10px; line-height: 1.5">` + snapshot.val().Fullname + `</h5>
                        <h6 class="text-muted" style="padding-bottom: 10px;">` + snapshot.val().Username + `</h6>
                        <h6 class="text-muted" style="padding-bottom: 10px;">` + isActive + `</h6>
                        <div class="col-md-12">
                            <div class="row">
                                <button onclick="resetActive('` + snapshot.val().Username + `','` + snapshot.val().Active + `')" class="btn ` + color + `"><i class="icon-refresh"></i> &nbsp; Kiểm duyệt</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `);
    })
}

function resetActive(username, active) {
    if (username != "tranquockhang") {
        if (active == 1) { active = 0 } else { active = 1 };
        firebase.database().ref("Account").child(username).update({
            Active: active
        });
    } else {
        swal({
            title: "Thông báo",
            text: "Đây là tài khoản quản trị cao nhất!",
            type: "warning",
            timer: 1500,
            showConfirmButton: false
        });
    }
}