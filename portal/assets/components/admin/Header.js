const Template = `
<nav class="navbar navbar-top navbar-expand navbar-dark bg-primary border-bottom">
    <div class="container-fluid">
        <div class="collapse navbar-collapse" id="navbarSupportedContent">

            <ul class="navbar-nav align-items-center w-100 d-block">
                <li class="nav-item dropdown float-right">
                    <a class="nav-link pr-0" href="#" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        <div class="media align-items-center">
                            <span class="avatar avatar-sm rounded-circle">
                                <img alt="Image placeholder" src="assets/admin/img/theme/team-4.jpg">
                            </span>
                            <div class="media-body  ml-2  d-none d-lg-block">
                                <span class="mb-0 text-sm  font-weight-bold">John Snow</span>
                            </div>
                        </div>
                    </a>
                    <div class="dropdown-menu  dropdown-menu-right ">
                        <div class="dropdown-header noti-title">
                            <h6 class="text-overflow m-0">Hoşgeldin!</h6>
                        </div>
                        <a href="#!" class="dropdown-item">
                            <i class="ni ni-circle-08"></i>
                            <span>Profilim</span>
                        </a>
                        <div class="dropdown-divider"></div>
                        <a href="#!" class="dropdown-item text-danger">
                            <i class="ni ni-user-run "></i>
                            <span>Çıkış Yap</span>
                        </a>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</nav>
`;

const AdminHeader = {
    template: Template,
    methods: {
        collapseMenu() {
            var body = document.body;
            if (body.style.overflow == "hidden") {
                body.style.removeProperty('overflow');
            } else {
                body.style.overflow = "hidden";
            }
        },
        logoutFunc(){
            $.ajax({
                type: "post",
                data: {
                    logging: false
                },
                url: "/api/user/logout",
                async: false,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Authorization', 'Bearer ' + getCookie('token'));
                }, 
                timeout: 30000,
            })
                .done(function (res) {
                    showSuccessToast(res.result.message);
                    setCookie('token');
                    setTimeout(function(){ location.reload(); }, 500);
                })
                .fail(function(xhr, status, error) {
                    var err = eval("(" + xhr.responseText + ")");
                    if(!err.ok)
                        $("#error-toast").children('.toast-body').text(err.description)
                });
        }
    }
}

Vue.component('AdminHeader', AdminHeader)

export default AdminHeader;