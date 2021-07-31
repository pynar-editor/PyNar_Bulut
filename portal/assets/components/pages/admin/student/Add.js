import Code from '../../../code/Code.js'

const Template = `
    <div>
        <div class="header bg-primary pb-6">
            <div class="container-fluid">
                <div class="header-body">
                    <div class="row align-items-center py-4">
                        <div class="col-lg-6 col-7">
                            <h6 class="h2 text-white d-inline-block mb-0">Öğrenci</h6>
                            <nav aria-label="breadcrumb" class="d-none d-md-inline-block ml-md-4">
                            <ol class="breadcrumb breadcrumb-links breadcrumb-dark">
                                <li class="breadcrumb-item"><a href="admin"><i class="fas fa-home"></i></a></li>
                                <li class="breadcrumb-item active" aria-current="page"><a href="admin/students">Öğrenciler</a></li>
                                <li class="breadcrumb-item active" aria-current="page">Öğrenci Ekle</li>
                            </ol>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="mh-100 w-100 mw-100 d-table mb-3 mt--6 px-md-5 pe-0">
            <form id="form-student-add" class="needs-validation col-12 m-0 p-0" novalidate>
                <div class="d-xl-flex mh-100 w-100 mw-100" >          
                    <div class="col-12 d-lg-flex justify-content-center mh-100 w-100 mw-100">
                        <div class="card col-lg-6 col-12 p-0 d-table h-100">    
                            <div class="card-header">
                                Kişisel Bilgiler
                            </div>
                            <div class="card-body">     
                                <div class="form-group col-lg-6 col-12 p-md-2 p-1 validate-me">
                                    <label class="form-label">Öğrenci Adı*</label>
                                    <div class="col-sm-12 pb-2">
                                        <div class="input-group has-validation">
                                            <input id="user_firstname" class="form-control" v-model="form.user_firstname" type="text" placeholder="Ad giriniz..." required>
                                            <div id="grade-feedback" class="invalid-feedback">
                                                Lütfen geçerli bir ad giriniz.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="form-group col-lg-6 col-12 p-md-2 p-1 validate-me">
                                    <label class="form-label">Öğrenci Soyadı*</label>
                                    <div class="col-sm-12 pb-2">
                                        <div class="input-group has-validation">
                                            <input id="user_lastname" class="form-control" v-model="form.user_lastname" type="text" placeholder="Soyad giriniz..." required>
                                            <div id="grade-feedback" class="invalid-feedback">
                                                Lütfen geçerli bir soyad giriniz.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="form-group col-lg-6 col-12 p-md-2 p-1 validate-me">
                                    <label for="email" class="form-label">E-posta*</label>
                                    <div class="col-sm-12 pb-2">
                                        <div class="input-group has-validation">
                                            <input id="email" class="form-control" v-model="form.email" placeholder="E-posta giriniz..." required>
                                            <div id="grade-feedback" class="invalid-feedback">
                                                Lütfen geçerli bir e-posta giriniz.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="form-group col-lg-6 col-12 p-md-2 p-1">
                                    <div class="col-sm-12 pb-2">
                                        <div class="input-group">
                                            <input id="user_status" type="checkbox" class="custom-control-input position-relative" v-model="form.user_status">
                                            <label for="user_status" class="custom-control-label">Hesap Durumu ({{ form.user_status == true ? 'Aktif':'Pasif' }})</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="card col-lg-6 col-12 ms-lg-3 p-0 d-table h-100">    
                            <div class="card-header">
                                Okul Bilgileri
                            </div>   
                            <div class="card-body">     
                                <div class="py-3">
                                    <label class="form-label">Kurum Türü</label>
                                    <div class="input-group has-validation">
                                        <span class="input-group-text bg-white">
                                            <i class="fa fa-university"></i>
                                        </span>
                                        <select class="form-control" name="cmbKurumTuru" id="cmbKurumTuru_I"></select>                        
                                    </div>
                                </div>
                                <div class="py-3">
                                    <label class="form-label">İl</label>
                                    <div class="input-group has-validation">
                                        <span class="input-group-text bg-white">
                                            <i class="fa fa-university"></i>
                                        </span>
                                        <select class="form-control" name="cmbil" id="cmbil_I"></select>                        
                                    </div>
                                </div>
                                <div class="py-3">
                                    <label class="form-label">Okul</label>
                                    <div class="input-group has-validation">
                                        <span class="input-group-text bg-white">
                                            <i class="fa fa-university"></i>
                                        </span>
                                        <select class="form-control" name="cmbokul" id="cmbokul_I"></select>                        
                                    </div>
                                </div>
                                <div class="py-3">
                                    <label class="form-label">Öğretmen</label>
                                    <div class="input-group has-validation">
                                        <span class="input-group-text bg-white">
                                            <i class="fa fa-university"></i>
                                        </span>
                                        <select class="form-control" name="cmbteacher" id="cmbteacher_I"></select>                        
                                    </div>
                                </div>
                                <div class="py-3">
                                    <label class="form-label">Sınıf</label>
                                    <div class="input-group has-validation">
                                        <span class="input-group-text bg-white">
                                            <i class="fa fa-university"></i>
                                        </span>
                                        <select class="form-control" name="cmbclass" id="cmbclass_I"></select>                        
                                    </div>
                                </div>
                                <div class="py-3">
                                    <label class="form-label">Şube</label>
                                    <div class="input-group has-validation">
                                        <span class="input-group-text bg-white">
                                            <i class="fa fa-university"></i>
                                        </span>
                                        <select class="form-control" name="cmbbranch" id="cmbbranch_I"></select>                        
                                    </div>
                                </div>
                            </div>
                        </div>          
                    </div>             
                </div>
                <div class="p-5 float-right">
                    <button class="btn btn-primary" @click="addStudent">Öğrenciyi Ekle</button>
                </div>
            </form>
        </div>
    </div>
`;


const AdminStudentAdd = {
    template: Template,
    data: function() {
        return {
            editor: null,
            form: {
                user_firstname: '',
                user_lastname: '',
                email: '',
                user_status: false,
                institution_id: "-1",
                institution_type: "-1",
                city: "-1",
                teacher_id: "-1",
                class_id: "-1",
                class_branch_id: "-1",
            },
        }
    },
    methods: {
        getInstitutions(){
            var self = this;
            
            if([self.form.institution_type, self.form.city].includes("-1") || [self.form.institution_type, self.form.city].includes(null))
                return -1
            var data = {
                institution_type: self.form.institution_type,
                city: self.form.city
            };
            $.ajax({
                type: "POST",
                url: "/api/user/admin/students",
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Authorization', 'Bearer ' + getCookie('admin_token'));
                }, 
                data: data,
            })
                .done(function(res) {
                    if(res.ok){
                        self.initializeSelectData('#cmbokul_I', [{'id': "-1", 'institution_name':'Lütfen seçim yapınız.'}].concat(Array.from(res.result.data)).map(function(el) {
                                return {
                                    id: el.id,
                                    text: el.institution_name
                                };
                            }),
                            function (e) {
                                self.form.institution_id = e.target.value;
                                self.getTeachers();
                            }
                        );                       
                        select2Styles();
                        self.getTeachers();
                    }else
                        showErrorToast(res.description)
                })
                .fail(function(xhr, status, error){
                    showErrorToast(error)
                    console.log(error);
                }); 
        },
        getTeachers(){
            var self = this;

            var data = {
                institution_id: this.form.institution_id
            };

            if(["-1"].includes(self.form.institution_id))
                return -1

            $.ajax({
                type: "POST",
                url: "/api/user/admin/students",
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Authorization', 'Bearer ' + getCookie('admin_token'));
                }, 
                data: data,
            })
                .done(function(res) {
                    if(res.ok){
                        self.clearSelect('#cmbteacher_I');
                        self.initializeSelectData('#cmbteacher_I', [{'id': "-1", 'user_fullname':'Lütfen seçim yapınız.'}].concat(Array.from(res.result.data)).filter(function(el){ if(el.user_fullname != null) return el}).map(function(el) {
                                return {
                                    id: el.id,
                                    text: el.user_fullname
                                };
                            }),
                            function (e) {
                                self.form.teacher_id = e.target.value;
                            }
                        );
                        self.form.teacher_id = self.form.teacher_id
                        
                        select2Styles();
                    }else
                        showErrorToast(res.description)
                    
                })
                .fail(function(xhr, status, error){
                    self.clearSelect('#cmbteacher_I')
                    var err = eval("(" + xhr.responseText + ")");
                    console.log(error);
                }); 
        },
        getInstitutionsInitilialization(key, val){
            var self = this;
            self.form[key] = val;
            self.clearSelect('#cmbokul_I');
            self.clearSelect('#cmbteacher_I');
            self.getInstitutions();
        },
        clearSelect(selector){
            var self = this;
            $(selector).empty().trigger("change");
            $(selector).select2({ data: [{id: "-1", text:'Lütfen seçim yapınız.'}] });
            $(selector).select2().val("-1").trigger("change");
            switch (selector) {
                case '#cmbokul_I':
                    self.form.institution_id = "-1";
                    break;
                case '#cmbteacher_I':
                    self.form.teacher_id = "-1";
                    break;
                default:
                    break;
            }
            select2Styles();
        },
        initializeSelectData(selector, data, onChange){
            $(selector).empty().trigger("change");
            $(selector).select2({
                data: data,
                sorter: data => data.sort((a, b) => a.text.localeCompare(b.text)),                    
            });
                                            
            $(selector).on('select2:select', onChange);
        },
        addStudent(){
            if (!document.querySelector('#form-student-add').checkValidity()) 
                return -1

            var self = this

            var data = {
                add_student: true,
                student_fullname: (self.form.user_firstname + ' ' + self.form.user_lastname).trim(),
                student_email: self.form.email,
                student_status: self.form.user_status ? 1:0,
                institution_id: self.form.institution_id == "-1" ? "" : self.form.institution_id,
                teacher_id: self.form.teacher_id == "-1" ? "" : self.form.teacher_id,
                class: self.form.class_id == "-1" ? "" : self.form.class_id,
                class_branch: self.form.class_branch_id == "-1" ? "" : self.form.class_branch_id,
            }
            
            $.ajax({
                type: "post",
                url: "/api/user/admin/students",
                data: data,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Authorization', 'Bearer ' + getCookie('admin_token'));
                }, 
                timeout: 30000
            })
                .done(function (res) {
                    try {
                        if(res.ok){
                            

                            showSuccessToast("Öğrenci bilgileri başarıyla güncellendi.");  
                        }
                        else
                            showErrorToast("Veriler güncellenemedi. Bilinmeyen bir sorun oluştu.");  
    
                    } catch (error) {
                        console.log(error);
                        showErrorToast("Bilinmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.");      
                    }
                })
                .fail(function(xhr, status, error) {
                    try {
                        console.log(xhr);
                        var err = eval("(" + xhr.responseText + ")");
                        if(!err.ok)
                            showErrorToast(err.description)
                        else
                            showErrorToast("Sunucuda bir hata oluştu, daha sonra tekrar deneyiniz.")
                        $('#error-toast').toast('show');                       
                        
                    } catch (error) {
                        console.log(error);
                    }      
                });

        }
    },
    mounted() {

        var self = this

        importSelect2(function(){
            $("#cmbKurumTuru_I").select2({
                data: [{'id': "-1",'text': 'Lütfen seçim yapınız.'},{'id':'resmi','text':'Resmi Kurumlar'},{'id':'ozel_kurum','text':'Özel Kurumlar'},{'id':'meb_disi','text':'MEB Dışı Kurumlar'},{'id':'universite','text':'Üniversiteler'}]
            });
            $('#cmbKurumTuru_I').on('select2:select', function (e) {
                self.getInstitutionsInitilialization('institution_type', e.target.value)
            });
    
            $("#cmbil_I").select2({
                data: [{'id': "-1", 'text':'Lütfen seçim yapınız.'},'ADANA','ADIYAMAN','AFYONKARAHİSAR','AĞRI','AKSARAY','AMASYA','ANKARA','ANTALYA','ARDAHAN','ARTVİN','AYDIN','BALIKESİR','BARTIN','BATMAN','BAYBURT','BİLECİK','BİNGÖL','BİTLİS','BOLU','BURDUR','BURSA','ÇANAKKALE','ÇANKIRI','ÇORUM','DENİZLİ','DİYARBAKIR','DÜZCE','EDİRNE','ELAZIĞ','ERZİNCAN','ERZURUM','ESKİŞEHİR','GAZİANTEP','GİRESUN','GÜMÜŞHANE','HAKKARİ','HATAY','IĞDIR','ISPARTA','İSTANBUL','İZMİR','KAHRAMANMARAŞ','KARABÜK','KARAMAN','KARS','KASTAMONU','KAYSERİ','KIRIKKALE','KIRKLARELİ','KIRŞEHİR','KİLİS','KOCAELİ','KONYA','KÜTAHYA','MALATYA','MANİSA','MARDİN','MERSİN','MUĞLA','MUŞ','NEVŞEHİR','NİĞDE','ORDU','OSMANİYE','RİZE','SAKARYA','SAMSUN','SİİRT','SİNOP','SİVAS','ŞANLIURFA','ŞIRNAK','TEKİRDAĞ','TOKAT','TRABZON','TUNCELİ','UŞAK','VAN','YALOVA','YOZGAT','ZONGULDAK']
            });
            $('#cmbil_I').on('select2:select', function (e) {
                self.getInstitutionsInitilialization('city', e.target.value)
            });
            
            $("#cmbclass_I").select2({
                data: [{'id': "-1", 'text':'Lütfen seçim yapınız.'}].concat(Array.from(Array(12).keys()).map(function(el){ return {id:el+1, text: el+1}}))
            });
            $('#cmbclass_I').on('select2:select', function (e) {
                self.form.class_id = e.target.value
            });
    
            $("#cmbbranch_I").select2({
                data: [{id: "-1", text: "Şube Yok"}].concat("ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ".split("").map(function(el, i){ return {id:i+1, text: el}}))
            });
            $('#cmbbranch_I').on('select2:select', function (e) {
                self.form.class_branch_id = e.target.value
            });
            select2Styles()
        })
    },
}

Vue.component('AdminStudentAdd', AdminStudentAdd)

export default AdminStudentAdd