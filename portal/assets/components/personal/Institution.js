
var Template = `
<div>
    <div class="card col-lg-6">
        <div class="card-header">
            Okul Bilgileriniz
            <span role="button" @click="setUpdater" class="float-right end-0 me-3 position-absolute pe-auto">
                <span v-show="updater" >
                    <i class="fa fa-check text-success" ></i>
                </span>
                <span v-show="!updater" >
                    <i class="fa fa-edit" ></i>
                </span>
            </span>
        </div>
        <div class="card-body">           
            <div v-show="updater" class="form-group validate-me">                    
                <div class="col-sm-12 pb-2">
                    <div class="py-3">
                        <label class="form-label">Özel/Resmi Kurum*</label>
                        <div class="input-group has-validation">
                            <span class="input-group-text bg-white">
                                <i class="fa fa-university"></i>
                            </span>
                            <select class="form-control" name="cmbKurumTuru" id="cmbKurumTuru_I"></select>                        
                        </div>
                    </div>
                    <div class="py-3">
                        <label class="form-label">İl*</label>
                        <div class="input-group has-validation">
                            <span class="input-group-text bg-white">
                                <i class="fa fa-university"></i>
                            </span>
                            <select class="form-control" name="cmbil" id="cmbil_I"></select>                        
                        </div>
                    </div>
                    <div class="py-3">
                        <label class="form-label">Okul*</label>
                        <div class="input-group has-validation">
                            <span class="input-group-text bg-white">
                                <i class="fa fa-university"></i>
                            </span>
                            <select class="form-control" name="cmbokul" id="cmbokul_I"></select>                        
                        </div>
                    </div>
                    <template v-if="loggedUser != 'teacher'">
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
                    </template>
                    <div class="py-3">
                        <button class="btn btn-primary" @click="setInformation">Güncelle</button>
                    </div>
                </div>
            </div>
            <div v-show="!updater">
                <div class="form-group">                    
                    <div class="col-sm-12 pb-2">
                        <div class="py-3">
                            <label class="form-label"><strong>Okulunuz</strong></label>
                            <input type="text" class="form-control" v-bind:value="[null, '-1'].includes(initialForm.institution_name) ? '# Seçilmedi':initialForm.institution_name" disabled>
                        </div>
                    </div>
                    <template v-if="loggedUser != 'teacher'">
                        <div class="col-sm-12 pb-2">
                            <div class="py-3">
                                <label class="form-label"><strong>Öğretmeniniz</strong></label>
                                <input type="text" class="form-control" v-bind:value="[null, '-1'].includes(initialForm.teacher_fullname) ? '# Seçilmedi':initialForm.teacher_fullname" disabled>
                            </div>
                        </div>
                        <div class="col-sm-12 pb-2">
                            <div class="py-3">
                                <label class="form-label"><strong>Sınıfınız</strong></label>
                                <input type="text" class="form-control" v-bind:value="[null, '-1'].includes(initialForm.class) ? '# Seçilmedi':initialForm.class" disabled>
                            </div>
                        </div>
                        <div class="col-sm-12 pb-2">
                            <div class="py-3">
                                <label class="form-label"><strong>Şubeniz</strong></label>
                                <input type="text" class="form-control" v-bind:value="[null, '-1'].includes(initialForm.class_branch_name) ? '# Seçilmedi':initialForm.class_branch_name" disabled>
                            </div>
                        </div>
                    </template>
                </div>   
            </div>
        </div>
    </div>             
</div>
`;

var Institution = {
    template: Template,
    data: function() {
        return {
            choosenUser: localStorage.getItem('choosenUser'),
            updater: false,
            loggedUser: getCookie('loggedUser'),
            initialForm: {
                city: "-1",
                institution_id: "-1",
                institution_name: null,    
                institution_type: "-1",
                class: "-1",
                class_branch: "-1",
                class_branch_name: null,
                teacher_id: "-1",
                teacher_fullname: null,
            },
            form: {
                city: "-1",
                institution_id: "-1",
                institution_name: null,
                institution_type: "-1",
                class: "-1",
                class_branch: "-1",
                class_branch_name: null,
                teacher_id: "-1",
                teacher_fullname: null,
            },
        };       
    },
    methods: {
        institutionSelect2s(){
            var self = this;
            importSelect2(function name(params) {
                $("#cmbKurumTuru_I").select2({
                    data: [{'id': "-1",'text': 'Lütfen seçim yapınız.'},{'id':'resmi','text':'Resmi Kurumlar'},{'id':'ozel_kurum','text':'Özel Kurumlar'},{'id':'meb_disi','text':'MEB Dışı Kurumlar'},{'id':'universite','text':'Üniversiteler'}]
                });
                $('#cmbKurumTuru_I').on('select2:select', function (e) {
                    self.getInstitutionsInitilialization('institution_type', e.target.value);
                });
        
                $("#cmbil_I").select2({
                    data: [{'id': "-1", 'text':'Lütfen seçim yapınız.'},'ADANA','ADIYAMAN','AFYONKARAHİSAR','AĞRI','AKSARAY','AMASYA','ANKARA','ANTALYA','ARDAHAN','ARTVİN','AYDIN','BALIKESİR','BARTIN','BATMAN','BAYBURT','BİLECİK','BİNGÖL','BİTLİS','BOLU','BURDUR','BURSA','ÇANAKKALE','ÇANKIRI','ÇORUM','DENİZLİ','DİYARBAKIR','DÜZCE','EDİRNE','ELAZIĞ','ERZİNCAN','ERZURUM','ESKİŞEHİR','GAZİANTEP','GİRESUN','GÜMÜŞHANE','HAKKARİ','HATAY','IĞDIR','ISPARTA','İSTANBUL','İZMİR','KAHRAMANMARAŞ','KARABÜK','KARAMAN','KARS','KASTAMONU','KAYSERİ','KIRIKKALE','KIRKLARELİ','KIRŞEHİR','KİLİS','KOCAELİ','KONYA','KÜTAHYA','MALATYA','MANİSA','MARDİN','MERSİN','MUĞLA','MUŞ','NEVŞEHİR','NİĞDE','ORDU','OSMANİYE','RİZE','SAKARYA','SAMSUN','SİİRT','SİNOP','SİVAS','ŞANLIURFA','ŞIRNAK','TEKİRDAĞ','TOKAT','TRABZON','TUNCELİ','UŞAK','VAN','YALOVA','YOZGAT','ZONGULDAK']
                });
                $('#cmbil_I').on('select2:select', function (e) {
                    self.getInstitutionsInitilialization('city', e.target.value);
                });
    
                if(self.loggedUser == "student"){
                    $("#cmbclass_I").select2({
                        data: [{'id': "-1", 'text':'Lütfen seçim yapınız.'}].concat(Array.from(Array(12).keys()).map(function(el){ return {id:el+1, text: el+1}}))
                    });
                    $('#cmbclass_I').on('select2:select', function (e) {
                        self.form["class"] = e.target.value;
                    });
    
                    $("#cmbbranch_I").select2({
                        data: [{id: "-1", text: "Şube Yok"}].concat("ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ".split("").map(function(el, i){ return {id:i+1, text: el}}))
                    });
                    $('#cmbbranch_I').on('select2:select', function (e) {
                        self.form["class_branch"] = e.target.value;
                        self.form["class_branch_name"] = e.params.data.text;
                    });
                }
                
                self.clearSelect('#cmbokul_I');
        
                self.clearSelect('#cmbteacher_I')
            })
        },
        clearSelect(selector){
            var self = this;
            $(selector).empty().trigger("change");
            $(selector).select2({ data: [{id: "-1", text:'Lütfen seçim yapınız.'}] });
            $(selector).select2().val("-1").trigger("change");
            switch (selector) {
                case '#cmbokul_I':
                    self.form.institution_id = "-1";
                    self.form.institution_name = null;
                    break;
                case '#cmbteacher_I':
                    self.form.teacher_id = "-1";
                    self.form.teacher_fullname = null;
                    break;
                default:
                    break;
            }
            select2Styles();
        },
        getInstitutionsInitilialization(key, val){
            var self = this;
            self.form[key] = val;
            self.clearSelect('#cmbokul_I');
            self.clearSelect('#cmbteacher_I');
            self.getInstitutions();
        },
        initializeSelectData(selector, data, onChange){
            $(selector).empty().trigger("change");
            $(selector).select2({
                data: data,
                sorter: data => data.sort((a, b) => a.text.localeCompare(b.text)),                    
            });
                                            
            $(selector).on('select2:select', onChange);
        },
        getInstitutions(){
            var self = this;
            
            if([this.form.institution_type, this.form.city].includes("-1"))
                return -1
            var data = {
                institution_type: this.form.institution_type,
                city: this.form.city,
                step: 1
            };
            $.ajax({
                type: "POST",
                url: "/api/user/institution/vertification",
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
                                self.form.institution_name = e.params.data.text;
                                if(self.loggedUser != "teacher")
                                    self.getTeachers();
                            }
                        );
                        if(self.initialForm.institution_type != self.form.institution_type || self.initialForm.city != self.form.city){
                            self.form.institution_id = "-1";
                            self.form.institution_name = null;
                            $("#cmbokul_I").select2().val("-1").trigger("change");
                        }
                        else{
                            self.form.institution_id = self.initialForm.institution_id;
                            self.form.institution_name = self.initialForm.institution_name;
                            $("#cmbokul_I").select2().val(self.initialForm.institution_id).trigger("change");
                        }
                        select2Styles();
                        if(self.loggedUser != "teacher")
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
            
            if(["-1"].includes(self.form.institution_id))
                return -1
            $.ajax({
                type: "POST",
                url: "/api/user/institution/vertification",
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Authorization', 'Bearer ' + getCookie('token'));
                }, 
                data: {
                    institution_id: self.form.institution_id,
                    step: 3
                },
            })
                .done(function(res) {
                    self.clearSelect('#cmbteacher_I');
                    if(res.ok){
                        self.initializeSelectData('#cmbteacher_I', [{'id': "-1", 'user_fullname':'Lütfen seçim yapınız.'}].concat(Array.from(res.result.data)).filter(function(el){ if(el.user_fullname != null) return el}).map(function(el) {
                                return {
                                    id: el.id,
                                    text: el.user_fullname
                                };
                            }),
                            function (e) {
                                self.form.teacher_id = e.target.value;
                                self.form.teacher_fullname = e.params.data.text;
                            }
                        );
                        if(self.initialForm.institution_type != self.form.institution_type || self.initialForm.city != self.form.city || self.initialForm.institution_id != self.form.institution_id){
                            self.form.teacher_id = "-1";
                            self.form.teacher_fullname = null;
                            $("#cmbteacher_I").select2().val("-1").trigger("change");
                        }
                        else{
                            self.form.teacher_id = self.initialForm.teacher_id;
                            self.form.teacher_fullname = self.initialForm.teacher_fullname;
                            $("#cmbteacher_I").select2().val(self.initialForm.teacher_id).trigger("change");
                        }
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
        setUpdater() {
            
            if(!this.updater){
                this.institutionSelect2s();

                $("#cmbil_I").select2().val(this.initialForm.city).trigger("change");
                $("#cmbKurumTuru_I").select2().val(this.initialForm.institution_type).trigger("change");
                $("#cmbclass_I").select2().val(this.initialForm.class).trigger("change");
                $("#cmbbranch_I").select2().val(this.initialForm.class_branch).trigger("change");
                this.getInstitutions();
                
                select2Styles();
               
            }else
                this.setData();
            this.updater = !this.updater; 
        },
        setData(data = {
            institution_id: undefined,
        }){
             
            var self = this;

            if(["-1", self.initialForm.institution_id].includes(self.form.institution_id)){
                if(["-1"].includes(self.form.institution_id)){
                    showErrorToast("Lütfen bir okul adı seçiniz.");
                    return -1;
                }
            }else 
                data.institution_id = self.form.institution_id
            $.ajax({
                type: "POST",
                url: "/api/user/institution/" + self.loggedUser + "/update",
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Authorization', 'Bearer ' + getCookie('token'));
                }, 
                data: data,
            })
                .done(function(res) {
                    if(res.ok){
                        showSuccessToast(res.result.message);
                        if(data.institution_id != undefined){
                            self.initialForm.institution_id = data.institution_id;
                            self.initialForm.institution_name = self.form.institution_name
                        }
                        if(data.teacher_id !== undefined){
                            
                            self.initialForm.teacher_id = data.teacher_id;
                            self.initialForm.teacher_fullname = self.form.teacher_fullname;                                          
                        }
                        if(data.class !== undefined)
                            self.initialForm.class = data.class;
                        if(data.class_branch !== undefined){
                            self.initialForm.class_branch = data.class_branch;
                            self.initialForm.class_branch_name = self.form.class_branch_name;
                        }

                        self.initialForm.city = self.form.city
                        self.initialForm.institution_type = self.form.institution_type
                        self.updater = false;
                    }
                    else
                        showErrorToast(res.description)
                    
                })
                .fail(function(xhr, status, error){
                    var err = eval("(" + xhr.responseText + ")");
                    showErrorToast(err.description)
                }); 

        },
        setInformation(){
            var self = this;
            if(self.loggedUser == "student"){
                var data = {
                    institution_id: undefined,
                    teacher_id: undefined,
                    class: undefined,
                    class_branch: undefined,
                };

                if(["-1", self.initialForm.institution_id].includes(self.form.institution_id)){
                    if(["-1", self.initialForm.teacher_id].includes(self.form.teacher_id)){
                        if(["-1", self.initialForm.class].includes(self.form.class)){
                            if(["-1", self.initialForm.class_branch].includes(self.form.class_branch)){
                                showErrorToast("Güncelleme yapabilmek için farklı bir okul/öğretmen/sınıf/şube seçmelisiniz.");
                                return -1;
                            }
                            else
                                data.class_branch = self.form.class_branch == "-1" ? null:self.form.class_branch;
                        }
                        else {
                            data.class = self.form.class;
                            data.class_branch = self.form.class_branch == "-1" ? null:self.form.class_branch;
                        }
                    }
                    else {
                        data.teacher_id = self.form.teacher_id;
                        data.class = self.form.class == "-1" ? null:self.form.class;
                        data.class_branch = self.form.class_branch == "-1" ? null:self.form.class_branch;
                    }
                }else {
                    data.institution_id = self.form.institution_id;
                    data.teacher_id = self.form.teacher_id == "-1" ? null:self.form.teacher_id;
                    data.class = self.form.class == "-1" ? null:self.form.class;
                    data.class_branch = self.form.class_branch == "-1" ? null:self.form.class_branch;
                }
                
                self.setData(data);
            }
            else if (self.loggedUser == "teacher")
                self.setData();

        },
        
    },
    beforeCreate: function(){
        
    },
    mounted: function () {
        var self = this;
        $.ajax({
            type: "post",
            url: "/api/user/institution/student/info",
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + getCookie('token'));
            },    
            timeout: 30000,
        })
            .done(function (res) {
                try {
                    if(res.ok){
                        self.initialForm = res.result.data;
                        /*if (self.initialForm.institution_id == null)
                            self.initialForm.institution_id = "-1";
                        if (self.initialForm.teacher_id == null)
                            self.initialForm.teacher_id = "-1";*/
                        for (const key of Object.keys(self.initialForm))
                            if (self.initialForm[key] == null)
                                self.initialForm[key] = "-1";
                        self.form = Object.assign({}, self.initialForm);
                    }
                } catch (error) {
                    console.log(error);
                    //showErrorToast("Bilinmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyiniz. ");
                }  
            })
            .fail(function(xhr, status, error) {
                try {
                    console.log(xhr);
                    var err = eval("(" + xhr.responseText + ")");
                    if(err.ok)
                        showErrorToast("Sunucuda bir hata oluştu, daha sonra tekrar deneyiniz.");
                        
                } catch (error) {
                    console.log(error);
                    //showErrorToast("Bilinmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyiniz."); 
                }    
            });
    },
};


Vue.component('Institution', Institution)

export default Institution;