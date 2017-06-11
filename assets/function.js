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
        if(isActive == 0) {           
           swal({
                title: "Thông báo",
                text: "Opps! Bạn không là thành viên được kích hoạt!",
                type: "warning",                
                showConfirmButton: true,
                confirmButtonText: "Đăng xuất",
            }, function(isConfirm) {
                if(isConfirm) {
                    onLogout();
                }
            });
        }
    });
  } else {      
      if(window.location.pathname.indexOf('index.html') < 1) gotoUrl('index.html');
  }
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
    if(userName != '' && password != '') {
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