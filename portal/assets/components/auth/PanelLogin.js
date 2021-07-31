import Toast from '../alerts/Toast.js';

const Template = `
<div class="p-0 m-0 min-wh-100 min-vh-100 d-flex justify-content-center align-items-center bg-white"> 
    <div id="container-form" class="col-xl-4 col-lg-6 col-md-8 col-12 min-vh-100 d-flex justify-content-center align-items-center bg-white z-index-9 py-md-5">            
        <div class="py-md-5 pt-md-3 col-12"> 
            <div class="w-100 d-flex py-3 justify-content-center align-items-center">
                <img class="border-end pe-3" src="assets/img/logo.png">
                <h1 class="ps-3">Panel</h1>
            </div>                  
            <div class="text-center">
                <i class="fa fa-unlock-alt fa-4x"></i>
            </div>
            <form id="login-form" class="w-100 pt-4 needs-validation"  novalidate>
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
                        <div class="form-group py-3">
                            <button class="btn btn-primary" @click="login" type="submit">Giriş</button>
                        </div>
                        <div class="text-end">
                            <a class="text-muted" href="#">
                                <small class="text-grey">Şifreni mi unuttun?</small>
                            </a>
                        </div>
                    </div>     
                </div>
            </form>
            <div class="pt-5 text-center">
                <small class="text-muted">© PyNar 2021</small>
            </div>
            <Toast 
                message="Giriş başarılı portala yönlendiriliyorsunuz.." 
                icon="check" 
                id="success-toast" 
                title="Başarılı!" 
                color="success" 
            />
            <Toast 
                message="Giriş başarısız, bir problem oluştu." 
                icon="times" 
                id="error-toast" 
                title="Giriş başarısız!" 
                color="danger" 
            />
        </div>
    </div>     
</div>
`;

const PanelLogin = {
    template: Template,
    data: function() {
        return {
            form: {
                email: '',
                password: '',
            }
        }
    },
    methods: {
        login(){
            if (!document.querySelector('#login-form').checkValidity()) 
                return -1;
            const data = {
                email: this.form.email,
                password: this.form.password,
                group: 'admin',
                logging: false,
            };

            $.ajax({
                type: "post",
                data: data,
                url: "/api/user/admin/login",
                timeout: 30000,
                error: function(xhr, status, error) {
                    try {
                        var err = eval("(" + xhr.responseText + ")");
                        if(!err.ok)
                            $("#error-toast").children('.toast-body').text(err.description)
                        else
                            $("#error-toast").children('.toast-body').text("Sunucuda bir hata oluştu, daha sonra tekrar deneyiniz.")
                        $('#error-toast').toast('show');       
                    } catch (error) {
                        $("#error-toast").children('.toast-body').text("Bilinmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyiniz. Err-Login-1")
                        $('#error-toast').toast('show');         
                    }      
                },
                success: function (res) {
                    try {
                        document.cookie = "admin_token=" + res.result.token + ";";
                        location.reload()    
                    } catch (error) {
                        $("#error-toast").children('.toast-body').text("Bilinmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyiniz. Err-Login-2")
                        $('#error-toast').toast('show');         
                    }
                }
            });
            return -1;
        }
    }
};


Vue.component('PanelLogin', PanelLogin)

const App = new Vue({
    el: "#app",
}).$mount('#app');

export default App;