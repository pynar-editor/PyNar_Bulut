const Template = `
<header id="header">
    <div class="headerCssBaseline"></div>
    <nav id="navbar" :class="'navbar navbar-expand-lg navbar-dark bg-primary shadow-lg fixed-top px-5 ' + color">
        <div class="container-fluid">
            <a class="navbar-brand" href="/">
                <template v-if="logo">
                    <img src="assets/img/logo.png" >
                </template>
                <template v-else>
                    {{title}}
                </template>
            </a>
            <template v-if="collapse">   
                <button class="d-sm-none navbar-toggler border-0" @click="collapseMenu" type="button" data-bs-toggle="collapse" data-bs-target="#navbarToggler" aria-controls="navbarToggler" aria-expanded="false" aria-label="Toggle navigation">
                    <i class="fa fa-bars d-sm-none text-white"></i>
                </button>
            </template>
            <div class="justify-content-end d-sm-flex d-none w-auto" >
                <ul class="navbar-nav flex-sm-row">
                    <template v-if="announcement">
                        <li class="nav-item">
                            <a 
                                type="button"
                                rel="noopener" 
                                class="nav-link p-1 d-flex align-items-center" 
                                data-bs-toggle="popover" 
                                data-bs-placement="bottom" 
                                title="Bildirimler" 
                                data-bs-html="true" 
                                :data-bs-content="announcements"
                            >
                                <i class="fa fa-bell icon-size m-1 text-white" ></i>
                                <span v-show="parseInt(announcement) > 0" class="badge rounded-pill bg-danger icon-badge">
                                    {{announcement}}
                                </span>
                            </a>
                        </li>
                    </template>       
                    <template v-if="username">
                        <li class="nav-item">
                            <a type="button" class="nav-link p-1 d-flex align-items-center" rel="noopener">
                                <i class="fa fa-user-circle icon-size text-white" ></i>
                                <span class="p-1 px-2 text-white">{{username}}</span>
                            </a>
                        </li>
                    </template>
                    <template v-if="logout">
                        <li class="nav-item d-flex align-items-center">
                            <a type="button" class="nav-link p-1 text-white" @click="logoutFunc" rel="noopener">
                                Çıkış Yap
                            </a>
                        </li>
                    </template>
                </ul>
            </div>
            <template v-if="collapse">
                <div class="collapse animate__animated animate__fadeIn animate__faster bg-menu navbar-toggler mw-50 w-100 h-100 position-fixed align-items-center d-sm-none fixed-top z-index-9999" id="navbarToggler">
                    <button class="d-sm-none navbar-toggler border-0 position-absolute top-0 end-0 m-5 text" @click="collapseMenu" type="button" data-bs-toggle="collapse" data-bs-target="#navbarToggler" aria-controls="navbarToggler" aria-expanded="false" aria-label="Toggle navigation">
                        <i class="fa fa-times d-sm-none text-dark icon-size"></i>
                    </button>
                    <div class="w-100 h-100 d-flex align-items-center">           
                        <ul class="navbar-nav flex-sm-row w-100">
                            <template v-if="announcement">
                                <li class="nav-item p-2">
                                    <a class="nav-link p-1 d-flex justify-content-center align-items-center" href="announcements" type="button" target="_blank" rel="noopener">              
                                        <i class="fa fa-bell icon-size text-dark" ></i><span v-show="parseInt(announcement) > 0" class="badge rounded-pill bg-danger icon-badge">{{announcement}}</span>
                                        <span class="p-2 text-dark">Bildirimler</span>
                                    </a>
                                </li>
                            </template>
                            <template v-if="username">
                                <li class="nav-item p-2">
                                    <a class="nav-link p-1 d-flex justify-content-center align-items-center" type="button" target="_blank" rel="noopener">
                                        <i class="fa fa-user-circle icon-size m-2 text-dark" ></i>
                                        <span class="p-2 text-dark">{{username}}</span>
                                    </a>
                                </li>
                            </template>
                            <template v-if="logout">
                                <li class="nav-item  p-2">
                                    <a class="nav-link p-1 text-dark d-flex justify-content-center align-items-center" @click="logoutFunc" type="button" target="_blank" rel="noopener">
                                        Çıkış Yap
                                    </a>
                                </li>
                            </template>
                        </ul>
                    </div>  
                </div>
            </template>  
        </div>
    </nav>
</header>`;

const Header = {
    template: Template,
    props: {
        logout: {
            type: Boolean,
            required: false,
            default: function () {
                return false
            }
        },
        collapse: {
            type: Boolean,
            required: false,
            default: function () {
                return false
            }
        },
        logo: {
            type: Boolean,
            required: false,
            default: function () {
                return false
            }
        },
        color: {
            type: String,
            required: false,
            default: function () {
                return ''
            }
        },
        title: {
            type: String,
            required: false,
            default: function () {
                return ''
            }
        },
        username: {
            type: String,
            required: false,
            default: function () {
                return ''
            }
        },
        announcement: {
            type: String,
            required: false,
            default: function () {
                return ''
            }
        },
        announcements: {
            type: String,
            required: false,
            default: function () {
                return ""
            }
        },
    },
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

Vue.component('Header', Header)

export default Header;