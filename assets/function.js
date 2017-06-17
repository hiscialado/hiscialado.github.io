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

firebase.database().ref("Account").on("child_changed", (snapshot, error) => loadUsers());

firebase.database().ref("Account").on("child_removed", (snapshot, error) => loadUsers());

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

function encodeImageFileAsURL(element, callback) {
    var file = element.files[0];
    var reader = new FileReader();
    reader.onloadend = function() {
        callback(reader.result);
    }
    reader.readAsDataURL(file);
}

function addUnits() {
    var TenBai = $('#unitsName').val();
    var ChuongSo = $('#unitsPart').val();
    var Phan1 = $('#unitsNameContent1').val();
    var Phan2 = $('#unitsNameContent2').val();
    var NoiDung1 = $('#unitsContent1').val();
    var NoiDung2 = $('#unitsContent2').val();
    var HinhAnh1 = $('#unitsPhotos1').val();
    var HinhAnh2 = $('#unitsPhotos2').val();
    if (TenBai != '' && ChuongSo != '' && Phan1 != '' && Phan2 != '' && NoiDung1 != '' && NoiDung2 != '' && HinhAnh1 != '' && HinhAnh2 != '') {
        encodeImageFileAsURL(document.getElementById('unitsPhotos1'), (dataPhotos1) => {
            encodeImageFileAsURL(document.getElementById('unitsPhotos2'), (dataPhotos2) => {
                firebase.database().ref("Units").push().set({
                    Name: TenBai,
                    Part: ChuongSo,
                    Part1: Phan1,
                    Part2: Phan2,
                    Content1: NoiDung1,
                    Content2: NoiDung2,
                    Photos1: dataPhotos1,
                    Photos2: dataPhotos2
                }).then(() => {
                    resetUnits();
                });
            });
        });
    } else {
        swal({
            title: "Thông báo",
            text: "Nhập đầy đủ thông tin",
            type: "error",
            timer: 1500,
            showConfirmButton: false
        });
    }
}

function resetUnits() {
    var MaBai = $('#unitsKeyNode').val('');
    var TenBai = $('#unitsName').val('');
    var ChuongSo = $('#unitsPart').val('');
    var Phan1 = $('#unitsNameContent1').val('');
    var Phan2 = $('#unitsNameContent2').val('');
    var NoiDung1 = $('#unitsContent1').val('');
    var NoiDung2 = $('#unitsContent2').val('');
    var HinhAnh1 = $('#unitsPhotos1').val('');
    var HinhAnh2 = $('#unitsPhotos2').val('');
}

firebase.database().ref("Units").on("child_changed", (snapshot, error) => loadUnits());
firebase.database().ref("Units").on("child_removed", (snapshot, error) => loadUnits());

function loadUnits() {
    $('#bodyDanhSach').html("");
    firebase.database().ref("Units").on("child_added", (snapshot, error) => {
        $('#bodyDanhSach').append(`
        <tr>
            <td><input type="text" class="form-control" value="` + snapshot.val().Name + `" disabled></td>
            <td>
                <input style="margin-bottom: 15px;" type="text" class="form-control" value="` + snapshot.val().Part1 + `" disabled>
                <input type="text" class="form-control" value="` + snapshot.val().Part2 + `" disabled>
            </td>
            <td>
                <input style="margin-bottom: 15px;" type="text" class="form-control" value="` + snapshot.val().Content1 + `" disabled>
                <input type="text" class="form-control" value="` + snapshot.val().Content2 + `" disabled>
            </td>
            <td>
                <input style="margin-bottom: 15px;" type="text" class="form-control" value="` + snapshot.val().Photos1 + `" disabled>
                <input type="text" class="form-control" value="` + snapshot.val().Photos2 + `" disabled>
            </td>
            <td>
                <button style="width: 100%;" onclick="onEdit('` + snapshot.key + `','` + snapshot.val().Name + `','` + snapshot.val().Part + `','` + snapshot.val().Part1 + `','` + snapshot.val().Part2 + `','` + snapshot.val().Content1 + `','` + snapshot.val().Content2 + `')" type="button" class="btn btn-danger"><i class="icon-note"></i> &nbsp; Sửa</button>
                <button onclick="onRemove('` + snapshot.key + `')" style="margin-top: 15px; width: 100%;" type="button" class="btn btn-success"><i class="icon-close"></i> &nbsp; Xóa</button>
            </td>
        </tr>
        `);
    });
}

function onRemove(key) {
    firebase.database().ref("Units").child(key).remove();
}

function onEdit(key, name, part, part1, part2, content1, content2) {
    var MaBai = $('#unitsKeyNode').val(key);
    var TenBai = $('#unitsName').val(name);
    var ChuongSo = $('#unitsPart').val(part);
    var Phan1 = $('#unitsNameContent1').val(part1);
    var Phan2 = $('#unitsNameContent2').val(part2);
    var NoiDung1 = $('#unitsContent1').val(content1);
    var NoiDung2 = $('#unitsContent2').val(content2);
}

function onSubmitUpdate() {
    var MaBai = $('#unitsKeyNode').val();
    if (MaBai != '') {
        var TenBai = $('#unitsName').val();
        var ChuongSo = $('#unitsPart').val();
        var Phan1 = $('#unitsNameContent1').val();
        var Phan2 = $('#unitsNameContent2').val();
        var NoiDung1 = $('#unitsContent1').val();
        var NoiDung2 = $('#unitsContent2').val();
        if ($('#unitsPhotos1').val() == '' && $('#unitsPhotos2').val() == '') {
            firebase.database().ref("Units").child(MaBai).update({
                Name: TenBai,
                Part: ChuongSo,
                Part1: Phan1,
                Part2: Phan2,
                Content1: NoiDung1,
                Content2: NoiDung2,
            }).then(() => {
                resetUnits();
            });;
        } else {
            if ($('#unitsPhotos1').val() != '' && $('#unitsPhotos2').val() != '') {
                encodeImageFileAsURL(document.getElementById('unitsPhotos1'), (dataPhotos1) => {
                    encodeImageFileAsURL(document.getElementById('unitsPhotos2'), (dataPhotos2) => {
                        firebase.database().ref("Units").child(MaBai).update({
                            Name: TenBai,
                            Part: ChuongSo,
                            Part1: Phan1,
                            Part2: Phan2,
                            Content1: NoiDung1,
                            Content2: NoiDung2,
                            Photos1: dataPhotos1,
                            Photos2: dataPhotos2
                        }).then(() => {
                            resetUnits();
                        });
                    });
                });
            } else {
                swal({
                    text: "Bạn chưa chọn hình ảnh đầy đủ để cập nhật",
                    type: "error",
                    title: "Opps!",
                    timer: 1000,
                    showConfirmButton: false
                });
            }
        }
    } else {
        swal({
            text: "Bạn chưa chọn bài để cập nhật",
            type: "error",
            title: "Thông báo",
            timer: 1000,
            showConfirmButton: false
        });
    }
}


function loadUsersActive() {
    $('#DanhSachQuanTri').html("");
    firebase.database().ref("Account").on("child_added", (snapshot, error) => {
        if (snapshot.val().Active == 1) {
            $('#DanhSachQuanTri').append(`
            <div class="media" style="margin-bottom: 15px">
            <img class="d-flex mr-3 img-thumbnail" style="max-width: 75px;" src="` + snapshot.val().Photos + `">
            <div class="media-body" style="width: 100%;">
              <h5 style="line-height: 2.0" class="mt-0">` + snapshot.val().Fullname + `</h5>
              <h6>#` + snapshot.val().Username + `</h6>
            </div>
          </div>
            `);
        }
    });
}

function addExamination() {
    var DapAn = $("#examAnswer").val();
    var CauHoi = $("#examQuestions").val();
    var A = $("#examA").val();
    var B = $("#examB").val();
    var C = $("#examC").val();
    var D = $("#examD").val();
    var GiaiThich = $("#examDetails").val();
    var ChuongSo = $("#examParts").val();
    if (DapAn != '' && A != '' && B != '' && C != '' && D != '' && CauHoi != '' && GiaiThich != '' && ChuongSo != '') {
        var NoiDungDapAn = '';
        if (DapAn == 'A') NoiDungDapAn = A;
        if (DapAn == 'B') NoiDungDapAn = B;
        if (DapAn == 'C') NoiDungDapAn = C;
        if (DapAn == 'D') NoiDungDapAn = D;
        firebase.database().ref("Exam").push().set({
            Parts: ChuongSo,
            Question: CauHoi,
            A: A,
            B: B,
            C: C,
            D: D,
            Details: GiaiThich,
            Answer: NoiDungDapAn
        }).then(() => resetExamination());
    } else {
        swal({
            type: "warning",
            title: "Opps!",
            text: "Bạn chưa nhập thông tin đầy đủ",
            timer: 1000,
            showConfirmButton: false
        })
    }
}

function resetExamination() {
    var keynode = $('#examKeyNode').val('');
    var DapAn = $("#examAnswer").val('A');
    var CauHoi = $("#examQuestions").val('');
    var A = $("#examA").val('');
    var B = $("#examB").val('');
    var C = $("#examC").val('');
    var D = $("#examD").val('');
    var GiaiThich = $("#examDetails").val('');
    var ChuongSo = $("#examParts").val('1');
}

firebase.database().ref("Exam").on("child_changed", (snapshot, error) => loadExamination());
firebase.database().ref("Exam").on("child_removed", (snapshot, error) => loadExamination());

function loadExamination() {
    $('#bodyDanhSachCauHoi').html("");
    firebase.database().ref("Exam").on("child_added", (snapshot, error) => {
        $('#bodyDanhSachCauHoi').append(
            `
        <tr>
            <td><input type="text" class="form-control" value="` + snapshot.val().Question + `" disabled></td>
            <td>
                <input style="margin-bottom: 15px;" type="text" class="form-control" value="` + snapshot.val().A + `" disabled>
                <input style="margin-bottom: 15px;" type="text" class="form-control" value="` + snapshot.val().B + `" disabled>
                <input style="margin-bottom: 15px;" type="text" class="form-control" value="` + snapshot.val().C + `" disabled>
                <input type="text" class="form-control" value="` + snapshot.val().D + `" disabled>
            </td>
            <td>
                <input type="text" class="form-control" value="` + snapshot.val().Details + `" disabled>                
            </td>
            <td>
                <input type="text" class="form-control" value="` + snapshot.val().Answer + `" disabled>                
            </td>
            <td>
                <button style="width: 100%;" onclick="onExamEdit('` + snapshot.key + `','` + snapshot.val().Question + `','` + snapshot.val().A + `','` + snapshot.val().B + `','` + snapshot.val().C + `','` + snapshot.val().D + `','` + snapshot.val().Details + `','` + snapshot.val().Answer + `','` + snapshot.val().Parts + `')" type="button" class="btn btn-danger"><i class="icon-note"></i> &nbsp; Sửa</button>
                <button onclick="onExamRemove('` + snapshot.key + `')" style="margin-top: 15px; width: 100%;" type="button" class="btn btn-success"><i class="icon-close"></i> &nbsp; Xóa</button>
            </td>
        </tr>
            `
        );
    });
}

function onExamEdit(key, cauhoi, a, b, c, d, giaithich, dapan, chuongso) {
    $('#examKeyNode').val(key);

    if (dapan == a) $("#examAnswer").val('A');
    if (dapan == b) $("#examAnswer").val('B');
    if (dapan == c) $("#examAnswer").val('C');
    if (dapan == d) $("#examAnswer").val('D');

    var CauHoi = $("#examQuestions").val(cauhoi);
    var A = $("#examA").val(a);
    var B = $("#examB").val(b);
    var C = $("#examC").val(c);
    var D = $("#examD").val(d);
    var GiaiThich = $("#examDetails").val(giaithich);
    var ChuongSo = $("#examParts").val(chuongso);
}

function onExamRemove(key) {
    firebase.database().ref("Exam").child(key).remove();
}

function onSubmitEditExamination() {
    var DapAn = $("#examAnswer").val();
    var CauHoi = $("#examQuestions").val();
    var A = $("#examA").val();
    var B = $("#examB").val();
    var C = $("#examC").val();
    var D = $("#examD").val();
    var GiaiThich = $("#examDetails").val();
    var ChuongSo = $("#examParts").val();
    var key = $("#examKeyNode").val();
    if ($('#examKeyNode').val() != '') {
        var NoiDungDapAn = '';
        if (DapAn == 'A') NoiDungDapAn = A;
        if (DapAn == 'B') NoiDungDapAn = B;
        if (DapAn == 'C') NoiDungDapAn = C;
        if (DapAn == 'D') NoiDungDapAn = D;
        firebase.database().ref("Exam").child(key).update({
            Parts: ChuongSo,
            Question: CauHoi,
            A: A,
            B: B,
            C: C,
            D: D,
            Details: GiaiThich,
            Answer: NoiDungDapAn
        }).then(() => resetExamination());
    } else {
        swal({
            type: "error",
            title: "Opps!",
            text: "Bạn chưa chọn câu hỏi",
            timer: 1000,
            showConfirmButton: false
        })
    }
}

firebase.database().ref("Forums").on("child_changed", (snapshot, error) => loadForums());
firebase.database().ref("Forums").on("child_removed", (snapshot, error) => loadForums());
firebase.database().ref("Comments").on("child_changed", (snapshot, error) => loadForums());
firebase.database().ref("Comments").on("child_removed", (snapshot, error) => loadForums());

function loadForums() {
    loadPost();
    loadComm();
}

function loadPost() {
    $('#bodyDienDan').html("");
    firebase.database().ref("Forums").on("child_added", (snapshot, error) => {
        $('#bodyDienDan').append(
            `
        <tr>
            <td><input type="text" class="form-control" value="` + snapshot.val().Username + `" disabled></td>
            <td>
                <textarea style="margin-bottom: 0px;" type="text" class="form-control" disabled>` + snapshot.val().Contents + `</textarea>
            </td>
            <td>
                <input type="text" class="form-control" value="` + snapshot.val().Photos + `" disabled>                
            </td>
            <td>
                <input type="text" class="form-control" value="` + snapshot.val().Liked + `" disabled>                
            </td>
            <td>                
                <button onclick="removeForum('` + snapshot.key + `', 'Forums')" style="width: 100%;" type="button" class="btn btn-success"><i class="icon-close"></i> &nbsp; Xóa</button>
            </td>
        </tr>
            `
        );
    })
}

function loadComm() {
    $('#bodyBinhLuan').html("");
    firebase.database().ref("Comments").on("child_added", (snapshot, error) => {
        $('#bodyBinhLuan').append(
            `
        <tr>
            <td><input type="text" class="form-control" value="` + snapshot.val().Username + `" disabled></td>
            <td>
                <textarea style="margin-bottom: 0px;" type="text" class="form-control" disabled>` + snapshot.val().Contents + `</textarea>
            </td>
            <td>
                <input type="text" class="form-control" value="` + snapshot.val().Photos + `" disabled>                
            </td>
            <td>
                <input type="text" class="form-control" value="` + snapshot.val().Keynode + `" disabled>                
            </td>
            <td>                
                <button onclick="removeForum('` + snapshot.key + `', 'Comments')" style="width: 100%;" type="button" class="btn btn-success"><i class="icon-close"></i> &nbsp; Xóa</button>
            </td>
        </tr>
            `
        );
    })
}

function removeForum(key, node) {
    firebase.database().ref(node).child(key).remove();
}

firebase.database().ref("Entertainments").on("child_changed", (snapshot, error) => loadEntertainmenst());
firebase.database().ref("Entertainments").on("child_removed", (snapshot, error) => loadEntertainmenst());

function loadEntertainmenst() {
    $('#bodyDanhSachCauDo').html("");
    firebase.database().ref("Entertainments").on("child_added", (snapshot, error) => {
        $('#bodyDanhSachCauDo').append(
            `
             <tr>
            <td><input type="text" class="form-control" value="` + snapshot.val().Key + `" disabled></td>         
            <td>
                <input type="text" class="form-control" value="` + snapshot.val().Photos + `" disabled>                
            </td>
            <td>
                <textarea rows="5" type="text" class="form-control" disabled>` + snapshot.val().Details + `</textarea> 
            </td>
            <td>
                <button style="width: 100%;" onclick="onEntEdit('` + snapshot.key + `')" type="button" class="btn btn-danger"><i class="icon-note"></i> &nbsp; Sửa</button>
                <button onclick="onEntertainemntRemove('` + snapshot.key + `')" style="margin-top: 15px; width: 100%;" type="button" class="btn btn-success"><i class="icon-close"></i> &nbsp; Xóa</button>
            </td>
        </tr>
            `
        );
    });
}

function onEntertainemntRemove(key) {
    firebase.database().ref("Entertainments").child(key).remove();
}

function onEntEdit(node) {
    $('#entKeynode').val(node);
    firebase.database().ref("Entertainments").child(node).on("value", (snapshot, error) => {
        var key = $('#entAnswer').val(snapshot.val().Key);
        var details = $('#entDetails').val(snapshot.val().Details);
    })
}

function addEnt() {
    var key = $('#entAnswer').val();
    var details = $('#entDetails').val();
    var photos = $('#entPhotos').val();
    if (key != '' && details != '' && photos != '') {
        encodeImageFileAsURL(document.getElementById("entPhotos"), (data) => {
            firebase.database().ref("Entertainments").push().set({
                Key: key,
                Photos: data,
                Details: details
            }).then(() => resetEnt());
        })
    } else {
        swal({
            type: "error",
            title: "Opps!",
            text: "Chưa nhập thông tin",
            timer: 1500,
            showConfirmButton: false
        });
    }
}

function resetEnt() {
    $('#entAlert').html('');
    var node = $('#entKeynode').val('');
    var key = $('#entAnswer').val('');
    var details = $('#entDetails').val('');
    var photos = $('#entPhotos').val('');
}

function submitEnt() {
    var node = $('#entKeynode').val();
    var key = $('#entAnswer').val();
    var details = $('#entDetails').val();
    var photos = $('#entPhotos').val();
    if (node != '') {
        if (photos != '') {
            encodeImageFileAsURL(document.getElementById("entPhotos"), (data) => {
                firebase.database().ref("Entertainments").child(node).update({
                    Key: key,
                    Photos: data,
                    Details: details
                }).then(() => resetEnt());
            })
        } else {
            firebase.database().ref("Entertainments").child(node).update({
                Key: key,
                Details: details
            }).then(() => resetEnt());
        }
    } else {
        swal({
            type: "error",
            title: "Opps!",
            text: "Chưa chọn câu đố để sửa thông tin",
            timer: 1500,
            showConfirmButton: false
        });
    }
};