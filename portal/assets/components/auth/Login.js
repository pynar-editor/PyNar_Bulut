import Toasts from '../alerts/Toasts.js';
import VertificationTeacher from './VertificationTeacher.js';

const Template = `
<div class="p-0 m-0 min-wh-100 min-vh-100 login-bg"> 
    <div id="container-form" class="animate animate__animated animate__faster person-login col-xl-4 col-lg-6 min-vh-100 d-flex justify-content-center align-items-center bg-white z-index-9 py-md-5 shadow-lg transition-1">            
        <div class="pt-md-3 col-12">
            <nav class="w-100 p-2 overflow-hidden">
                <button id="person-student-toggle" class="person-student-button person-student-button-hide float-start btn btn-default d-flex align-self-start shadow-none" @click="changePerson({type:'student', name:'Öğrenci'})">                        
                    <div class="pe-3">
                        <i class="fa fa-long-arrow-alt-left" ></i>       
                    </div>  
                    Öğrenci Giriş                           
                </button>   
                <button id="person-teacher-toggle" class="person-teacher-button float-end btn btn-default d-flex shadow-none" @click="changePerson({type:'teacher', name:'Öğretmen'})">                        
                    Öğretmen Giriş
                    <div class="ps-3">
                        <i class="fa fa-long-arrow-alt-right" ></i>       
                    </div>      
                </button>
            </nav>   
            <div class="w-100 d-flex py-3 justify-content-center align-items-center">
                <img class="border-end pe-3" src="assets/img/logo.png">
                <h1 class="ps-3">{{auth.name}} Giriş</h1>
            </div>                  
            <div class="text-center">
                <img id="student-login-image" align="center" class="col-6 border-bottom" src="assets/img/student-login.jpeg">
                <img id="teacher-login-image" align="center" class="col-6 border-bottom d-none" src="assets/img/teacher-login.jpeg">
            </div>
            <form id="login-form" class="w-100 pt-4 needs-validation" novalidate>
                <input type="hidden" name="auth" :value="auth.type" />
                <div class="col-md-12 d-flex justify-content-center">
                    <div class="col-md-8 col-sm-7 col-10 form-group">
                        <div class="form-group validate-me">
                            <div class="form-group validate-me">
                                <label for="email" class="form-label">E-posta*</label>
                                <div class="col-sm-12 pb-2">
                                    <div class="input-group has-validation">
                                        <span class="input-group-text bg-white">
                                            <i class="fa fa-envelope"></i>
                                        </span>
                                        <input type="email" name="email" v-model="form.email" class="form-control" placeholder="E-posta hesabınızı giriniz..." required>
                                        <div id="email-feedback" class="invalid-feedback">
                                            Lütfen e-postanızı giriniz.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                       <div class="form-group validate-me">
                            <label for="password" class="form-label">Şifre*</label>
                            <div class="col-sm-12 pb-2">
                                <div class="input-group has-validation">
                                    <span class="input-group-text bg-white">
                                        <i class="fa fa-key"></i>
                                    </span>
                                    <input id="password" name="password" v-model="form.password" type="password"  class="form-control" placeholder="**********" required>
                                    <div id="password-feedback" class="invalid-feedback">
                                        Lütfen şifrenizi giriniz.
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div class="form-check py-2">
                                <input id="remember" name="remember" v-model="form.remember" class="form-check-input" type="checkbox">
                                <label class="form-check-label" for="remember">
                                    Beni hatırla
                                </label>
                            </div>
                        </div>
                        <div class="form-group">
                            <template v-if="auth.type == 'teacher'">
                                <button class="btn btn-secondary" @click="login" type="submit">{{auth.name}} Girişi</button>
                            </template>
                            <template v-else>
                                <button class="btn btn-info" @click="login" type="submit">{{auth.name}} Girişi</button>
                            </template>                        
                        </div>
                        <div class="text-end">
                            <a class="text-muted" href="#">
                                <small class="text-grey">Şifreni mi unuttun?</small>
                            </a>
                            <br>
                            <a class="text-muted" href="signup">
                                <small class="text-grey">Bir hesabın yok mu ?</small>
                            </a>
                        </div>
                    </div>     
                </div>
            </form>
            <div class="pt-5 text-center">
                <small class="text-muted">© PyNar 2021</small>
            </div>
        </div>
    </div>
    <template v-if="vertificationTeacher">
        <VertificationTeacher />
    </template>
    <Toasts />
</div>
`;

const Login = {
    template: Template,
    data: function() {
        let urlParams = new URLSearchParams(window.location.search);   

        return {
            auth: {
                type: "student",
                name: "Öğrenci"
            },
            form: {
                email: '',
                password: '',
                remember: false,
            },
            email: urlParams.get('m'),
            vertificationTeacher: urlParams.get('e') == "activation"
        }
    },
    created(){
        this.activation();
    },
    mounted() {       
        var choosenUser = localStorage.getItem("choosenUser");
        
        if(choosenUser == undefined || ['teacher','student'].includes(getCookie('forceLogin'))){

            let authType = ['teacher','student'].includes(getCookie('forceLogin')) ? getCookie('forceLogin'): "student";
            let authName = authType == 'teacher' ? "Öğretmen": "Öğrenci";
            const auth = {
                type: authType,
                name: authName
            };
            this.auth = auth;
            localStorage.setItem("choosenUser", JSON.stringify(this.auth), 365);
        }
        else
            this.auth = JSON.parse(choosenUser);
        
        this.animatePerson(this.auth.type);
    },
    methods: {
        async changePerson(obj) {
            this.auth = obj
            var self = this;
            document.querySelector('#container-form').classList.remove("animate__bounceInDown");
            document.querySelector('#container-form').classList.add("animate__backOutDown");
            setTimeout(function(){ 
                self.animatePerson(obj.type);
                
                document.querySelector('#container-form').classList.remove("animate__backOutDown");
                document.querySelector('#container-form').classList.add("animate__bounceInDown");
            },500);
            
            localStorage.setItem("choosenUser", JSON.stringify(obj), 365);
        },
        animatePerson(person){
            var hidePerson = {
                teacher: "student",
                student: "teacher"
            };

            var animate = {
                teacher: function(){
                    document.querySelector('#container-form').classList.add("person-login-teacher");
                },
                student: function(){
                    document.querySelector('#container-form').classList.remove("person-login-teacher");
                },
            };

            animate[person]();
                      
            document.querySelector('#person-' + person + '-toggle').classList.add("person-" + person + "-button-hide");
            document.querySelector('#person-' + hidePerson[person] + '-toggle').classList.remove("person-" + hidePerson[person] + "-button-hide");

            document.querySelector('#' + hidePerson[person] + '-login-image').classList.add("d-none");
            document.querySelector('#' + person + '-login-image').classList.remove("d-none");

        },
        login(){
            if (!document.querySelector('#login-form').checkValidity()) 
                return -1;

            const data = {
                email: this.form.email,
                password: this.form.password,
                group: this.auth.type,
                logging: false,
            };

            const self = this;
            $.ajax({
                type: "post",
                data: data,
                async: false,
                url: "/api/user/login",
                timeout: 30000,
            })
                .done(function (res) {
                    try {
                        if(self.form.remember)
                            setCookie("token", res.result.token, 1);
                        else 
                            setCookie("token", res.result.token);
                                         
                        window.history.pushState(null, null, window.location.pathname);
                        setCookie('loggedUser', self.auth.type);
                        if(res.result.is_inited == 0)
                            document.location = 'my';
                        else
                            location.reload();
                        
                    } catch (error) {
                        showErrorToast("Bilinmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyiniz. Err-Login-2");      
                    }
                })
                .fail(function(xhr, status, error) {
                    try {
                        var err = eval("(" + xhr.responseText + ")");
                        if(!err.ok)
                            $("#error-toast").children('.toast-body').text(err.description)
                        else
                            $("#error-toast").children('.toast-body').text("Sunucuda bir hata oluştu, daha sonra tekrar deneyiniz.")
                        $('#error-toast').toast('show');                       
                        
                    } catch (error) {
                        showErrorToast("Bilinmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyiniz. Err-Login-1");
                    }      
                });
        },
        activation() {
            let urlParams = new URLSearchParams(window.location.search);
            
            try {
                if (!urlParams.has('e') || urlParams.get('e') != "activation" )
                    return 0;
                if (!urlParams.has('t')) {
                    this.result = "Üzgünüm, bilinmeyen bir hata oluştu. Yeniden kaydolmayı deneyiniz veya bir yöneticiye başvurunuz.";
                    return 0;
                }
                const self = this;
                const data = {
                    token: urlParams.get('t')
                };
                
                $.ajax({
                    type: "post",
                    data: data,
                    url: "/api/user/activate",
                    timeout: 30000,
                })
                    .done(function (res) {
                        try {
                            if(res.ok){
                                showSuccessToast(res.result.message);
                                if(urlParams.get('g') == "teacher")
                                    $('.teacher-activation').removeClass('d-none');
                            }
                            else
                                showErrorToast(res.description);                 
                        } catch (error) {
                            showErrorToast("Bilinmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyiniz. Err-Login-1");
                        }  
                    })
                    .fail(function(xhr, status, error) {
                        try {
                            var err = eval("(" + xhr.responseText + ")");
                            if(!err.ok)
                                showErrorToast(err.description);
                            else
                                showErrorToast("Sunucuda bir hata oluştu, daha sonra tekrar deneyiniz.");
                                
                        } catch (error) {
                            showErrorToast("Bilinmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyiniz. Err-Login-1"); 
                        }    
                    });                
            } catch (error) {
                showErrorToast("Şu anda servise erişilemiyor, lütfen daha sonra tekrar deneyiniz.");
                console.log(error);
            }
        },
    },
};


Vue.component('Login', Login)

const App = new Vue({
    el: "#app",
}).$mount('#app');

export default App;