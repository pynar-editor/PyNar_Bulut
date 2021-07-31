import Toasts from '../alerts/Toasts.js';

const Template = `
<div class="bg-primary"> 
    <div class="d-flex py-5 justify-content-center align-items-center ">
        <a href="/">
            <img class="px-3 " src="assets/img/logo.png">
        </a>
        <h1 class="px-3 text-white border-start display-4">Kayıt Ol</h1>
    </div>
    <div class="p-0 m-0 min-wh-100 min-vh-100 d-flex align-items-center justify-content-center"> 
        <div class="container col-xl-6 col-lg-8 col-md-10 bg-white p-0 shadow-sm rounded">
            <nav class="w-100 p-2 overflow-hidden">
                <button id="person-student-toggle" class="person-student-button person-student-button-hide float-start transition-1 btn btn-default d-flex align-self-start shadow-none" @click="changePerson({type:'student', name:'Öğrenci'})">                        
                    <div class="pe-3">
                        <i class="fa fa-long-arrow-alt-left" ></i>       
                    </div>  
                    Öğrenci Kayıt Ol                           
                </button>   
                <button id="person-teacher-toggle" class="person-teacher-button float-end transition-1 btn btn-default d-flex shadow-none" @click="changePerson({type:'teacher', name:'Öğretmen'})">                        
                    Öğretmen Kayıt Ol
                    <div class="ps-3">
                        <i class="fa fa-long-arrow-alt-right" ></i>       
                    </div>      
                </button>
            </nav>   
            <div class="d-flex h-100">
                <div class="col-12 d-flex transition-1 p-2 py-4" >                    
                    <div class="col-lg-6 d-lg-flex align-items-center justify-content-center h-100 d-none ">
                        <img src="assets/img/students.jpeg" class="person-student-image w-100" >
                        <img src="assets/img/teacher.jpeg" class="w-100 p-absolute transition-1" >
                    </div>
                    <div class="col-lg-6 col-12">                          
                        <form id="signup-form" class="needs-validation py-5 shadow-lg col-12 rounded bg-white transition-1" novalidate>       
                            <div class="transition-1 w-100 d-flex align-items-center justify-content-center py-2">         
                                <template v-if="form.group.type == 'teacher'">
                                    <button class="btn btn-secondary pe-none px-3 transition-1">{{form.group.name}} Kayıt</button> 
                                </template>
                                <template v-else>
                                    <button class="btn btn-info pe-none px-3 transition-1">{{form.group.name}} Kayıt</button> 
                                </template>
                            </div>       
                            <input type="hidden" name="group" :value="form.group.type" />
                            <div class="w-100 d-flex justify-content-center">
                                <div class="col-10 ">
                                    <div class="form-group validate-me">
                                        <label for="email" class="form-label">E-posta*</label>
                                        <div class="col-sm-12 pb-2">
                                            <div class="input-group has-validation">
                                                <span class="input-group-text bg-white">
                                                    <i class="fa fa-envelope"></i>
                                                </span>
                                                <input type="email" v-model="form.email" name="email" class="form-control" placeholder="E-posta hesabınızı giriniz..." required>
                                                <div id="email-feedback" class="invalid-feedback">
                                                    Lütfen e-postanızı giriniz.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="form-group validate-me">
                                        <label for="first_name" class="form-label">Ad*</label>
                                        <div class="col-sm-12 pb-2">
                                            <div class="input-group has-validation">
                                                <span class="input-group-text bg-white">
                                                    <i class="fa fa-user"></i>
                                                </span>
                                                <input type="text" v-model="form.first_name" name="first_name" class="form-control" placeholder="Adınızı giriniz..." required>
                                                <div id="first_name-feedback" class="invalid-feedback">
                                                    Lütfen adınızı giriniz.
                                                </div>
                                            </div>
                                        </div>
                                    </div>    
                                    <div class="form-group validate-me">
                                        <label for="last_name" class="form-label">Soyad*</label>
                                        <div class="col-sm-12 pb-2">
                                            <div class="input-group has-validation">
                                                <span class="input-group-text bg-white">
                                                    <i class="fa fa-user"></i>
                                                </span>
                                                <input type="text" v-model="form.last_name" name="last_name" class="form-control" placeholder="Soyadınızı giriniz..." required>
                                                <div id="last_name-feedback" class="invalid-feedback">
                                                    Lütfen soyadınızı giriniz.
                                                </div>
                                            </div>
                                        </div>
                                    </div>    
                                    <div class="form-group">
                                        <label for="password" class="form-label">Şifre*</label>
                                        <div class="col-sm-12 pb-2">
                                            <div class="input-group has-validation">
                                                <span class="input-group-text bg-white">
                                                    <i class="fa fa-key"></i>
                                                </span>
                                                <input id="password" name="password" type="password" v-model="form.password" class="form-control" placeholder="**********" required>
                                                <div id="password-feedback" class="invalid-feedback">
                                                    Şifreniz istenen formatta olmalıdır.
                                                </div>
                                            </div>
                                        </div>
                                    </div>    
                                    <div class="form-group">
                                        <label for="password" class="form-label">Şifre Tekrar*</label>
                                        <div class="col-sm-12 pb-2">
                                            <div class="input-group has-validation">
                                                <span class="input-group-text bg-white">
                                                    <i class="fa fa-key"></i>
                                                </span>
                                                <input type="password" v-model="form.password_r" name="password-r" class="form-control" placeholder="**********" required>
                                                <div id="password-feedback" class="invalid-feedback">
                                                    Şifreler uyuşmuyor.
                                                </div>
                                            </div>
                                            <div class="p-2"> 
                                                <i class="password-length fa fa-check text-success d-none" ></i>
                                                <i class="password-length fa fa-times text-danger" ></i>
                                                Şifre, en az 8 karakter olmalıdır.
                                            </div>
                                            <div class="p-2"> 
                                                <i class="password-must-contains fa fa-check text-success d-none" ></i>
                                                <i class="password-must-contains fa fa-times text-danger" ></i>
                                                En az bir büyük karakter, en az bir küçük karakter, en az bir özel karakter ve en az bir sayı içermelidir.
                                            </div>
                                            <div class="p-2"> 
                                                <i class="password-similarity fa fa-check text-success d-none" ></i>
                                                <i class="password-similarity fa fa-times text-danger" ></i>
                                                Şifreler birbiriyle uyuşmalıdır.
                                            </div>
                                        </div>   
                                    </div>                                
                                    <div>
                                        <div class="py-2">
                                            <template v-if="form.group.type == 'teacher'">
                                                <button class="btn btn-info transition-1" @click="signup" type="submit">Kayıt Ol</button>
                                            </template>
                                            <template v-else>
                                                <button class="btn btn-secondary transition-1" @click="signup" type="submit">Kayıt Ol</button>
                                            </template>
                                            <div class="text-end">
                                                <a class="text-muted" href="/portal">
                                                    <small class="text-grey">Zaten bir hesabın var mı ?</small>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>     
                            </div>
                        </form>
                    </div>        
                </div>             
            </div>
        </div>
        <Toasts/>
    </div>
</div>
`;

const Signup = {
    template: Template,
    data: function() {
        return {
            form: {
                first_name: '',
                last_name: '',
                email: '',
                password: '',
                password_r: '',
                group: {
                    type: "student",
                    name: "Öğrenci"
                },
                validate: {
                    password: [false, false, false]
                }
            }
        }
    },
    mounted: function () {
        var choosenUser = localStorage.getItem("choosenUser");
        if(choosenUser == undefined)
            localStorage.setItem("choosenUser", JSON.stringify(this.form.group), 365);
        else
            this.form.group = JSON.parse(choosenUser);
        this.animatePerson(this.form.group.type);
    },
    watch: {
        'form.password': function() {           
            const lengthRegex = new RegExp("(?=.{8,})");

            const passwordLength = document.querySelectorAll('.password-length');
            const passwordMustContains = document.querySelectorAll('.password-must-contains');
            const passwordSimilarity = document.querySelectorAll('.password-similarity');

            if(lengthRegex.test(this.form.password)){
                passwordLength[0].classList.remove('d-none');
                passwordLength[1].classList.add('d-none');
                this.form.validate.password[0] = true;
            }else {
                passwordLength[0].classList.add('d-none');
                passwordLength[1].classList.remove('d-none');
                this.form.validate.password[0] = false;
            }

            const mustContainRegex = new RegExp("(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[-\[\\]\"!'\^\+%&\/\(\)\=\?£#\$\{\}|\\_\*\,;:\.@])");

            if(mustContainRegex.test(this.form.password)){
                passwordMustContains[0].classList.remove('d-none');
                passwordMustContains[1].classList.add('d-none');
                this.form.validate.password[1] = true;
            }else {
                passwordMustContains[0].classList.add('d-none');
                passwordMustContains[1].classList.remove('d-none');
                this.form.validate.password[1] = false;
            }

            if(this.form.password_r.length > 0 && [this.form.password].includes(this.form.password_r)){
                passwordSimilarity[0].classList.remove('d-none');
                passwordSimilarity[1].classList.add('d-none');
                this.form.validate.password[2] = true;
            }else {
                passwordSimilarity[0].classList.add('d-none');
                passwordSimilarity[1].classList.remove('d-none');
                this.form.validate.password[2] = false;
            }
        },
        'form.password_r': function () {
            
            const passwordSimilarity = document.querySelectorAll('.password-similarity');

            if(this.form.password_r.length > 0 && [this.form.password].includes(this.form.password_r)){
                passwordSimilarity[0].classList.remove('d-none');
                passwordSimilarity[1].classList.add('d-none');
                this.form.validate.password[2] = true;
            }else {
                passwordSimilarity[0].classList.add('d-none');
                passwordSimilarity[1].classList.remove('d-none');
                this.form.validate.password[2] = false;
            }

        }
    },
    methods: {
        changePerson(obj){
            this.form.group = obj;

            this.animatePerson(obj.type);

            localStorage.setItem("choosenUser", JSON.stringify(obj), 365);
        },
        animatePerson(person){
            var hidePerson = {
                teacher: "student",
                student: "teacher"
            };

            var animate = {
                teacher: function(){
                    document.querySelector('#signup-form').classList.add("btn-slider-teacher");
                },
                student: function(){
                    document.querySelector('#signup-form').classList.remove("btn-slider-teacher");
                },
            };

            animate[person]();

            document.querySelector('#person-' + person + '-toggle').classList.add("person-" + person + "-button-hide");
            document.querySelector('#person-' + hidePerson[person] + '-toggle').classList.remove("person-" + hidePerson[person] + "-button-hide");

        },
        signup() {
            try {
                if (!document.querySelector('#signup-form').checkValidity()) 
                    return -1;
            
                if(this.form.validate.password.includes(false)){
                    $("#error-toast").children('.toast-body').text("Şifre istenen formatta değil, lütfen uygun bir şifre giriniz.")
                    $('#error-toast').toast('show');     
                    return -1;
                }
                
                const { first_name, last_name, email, password, group } = this.form;

                const data = {
                    email: email,
                    user_fullname: first_name + ' ' + last_name,
                    password: password,
                    group: group.type,
                    logging: false
                };

                $.ajax({
                    type: "post",
                    data: data,
                    url: "/api/user/signup",
                    timeout: 30000,
                })
                    .done(function (res) {
                        try {
                            if(res.ok)
                                showSuccessToast(res.result.message);
                            else
                                showErrorToast("Bilinmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.");
                        } catch (error) {
                            $("#error-toast").children('.toast-body').text("Bilinmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyiniz. Err-Login-1")
                            $('#error-toast').toast('show');         
                        }  
                    })
                    .fail(function(xhr, status, error) {
                        try {
                            console.log(xhr);
                            var err = eval("(" + xhr.responseText + ")");
                            
                            if(!err.ok)
                                showErrorToast(err.description);
                            else
                                showErrorToast("Sunucuda bir hata oluştu, daha sonra tekrar deneyiniz.")
                                
                        } catch (error) {
                            console.log(error);
                            showErrorToast("Bilinmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyiniz. Err-Login-1")
                        }    
                    });
                
                return 0;
            } catch (error) {
                var err = eval("(" + xhr.responseText + ")");
                showErrorToast("Şu anda servise erişilemiyor, lütfen daha sonra tekrar deneyiniz.")
            }
            
        }
    },
    
};


Vue.component('Signup', Signup)

const App = new Vue({
    el: "#app",
}).$mount('#app');

export default App;