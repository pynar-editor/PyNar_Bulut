const Template = `
<div>
    <div class="header bg-primary pb-6">
        <div class="container-fluid">
            <div class="header-body">
                <div class="row align-items-center py-4">
                    <div class="col-lg-6 col-7">
                        <h6 class="h2 text-white d-inline-block mb-0">Öğrenciler</h6>
                        <nav aria-label="breadcrumb" class="d-none d-md-inline-block ml-md-4">
                        <ol class="breadcrumb breadcrumb-links breadcrumb-dark">
                            <li class="breadcrumb-item"><a href="admin"><i class="fas fa-home"></i></a></li>
                            <li class="breadcrumb-item active" aria-current="page">Öğrenciler</li>
                        </ol>
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="container mt--6 mb-3 mh-100 px-md-5 pe-0 w-100 mw-100 position-relative">
        <div class="card shadow-sm bg-white p-4 rounded-5">
            <table class="data-table table table-striped table-hover display responsive nowrap"></table>
            <div id="update-modal" class="modal h-100 p-0" tabindex="-1">
                <div class="modal-dialog mw-100 mh-100 h-100 m-0 modal-dialog-scrollable">
                    <div class="modal-content mh-100 h-100 rounded-0">
                        <div class="modal-header shadow-lg">
                            <h3>Öğrenci Güncelle</h3>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="col-12 d-lg-flex justify-content-center">    
                                <div class="card col-lg-6 col-12 p-0 d-table">    
                                    <div class="card-header bg-primary text-white">
                                        Kişisel Bilgiler
                                    </div>
                                    <div class="card-body">     
                                        <form id="form-student-update" class="needs-validation" novalidate>
                                            <div class="form-group col-lg-6 col-12 p-md-2 p-1 validate-me">
                                                <label class="form-label">Öğrenci Adı*</label>
                                                <div class="col-sm-12 pb-2">
                                                    <div class="input-group has-validation">
                                                        <input id="user_firstname" class="form-control" v-model="updateForm.user_firstname" type="text" placeholder="Ad giriniz..." required>
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
                                                        <input id="user_lastname" class="form-control" v-model="updateForm.user_lastname" type="text" placeholder="Soyad giriniz..." required>
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
                                                        <input id="email" class="form-control" v-model="updateForm.email" placeholder="E-posta giriniz..." required>
                                                        <div id="grade-feedback" class="invalid-feedback">
                                                            Lütfen geçerli bir e-posta giriniz.
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="form-group col-lg-6 col-12 p-md-2 p-1">
                                                <div class="col-sm-12 pb-2">
                                                    <div class="input-group">
                                                        <input id="user_status" type="checkbox" class="custom-control-input position-relative" v-model="updateForm.user_status">
                                                        <label for="user_status" class="custom-control-label">Hesap Durumu ({{ updateForm.user_status == true ? 'Aktif':'Pasif' }})</label>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="form-group d-grid gap-2 d-md-flex justify-content-md-end p-md-2 p-1">
                                                <button id="save" type="submit" class="btn btn-primary" @click="updateStudentPrivateInformations()">Kaydet</button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                                <div class="card col-lg-6 col-12 ms-lg-3 p-0 d-table">    
                                    <div class="card-header bg-warning text-white">
                                        Okul Bilgileri
                                    </div>   
                                    <div class="card-body">     
                                        <form id="form-student-update-institute" class="needs-validation" novalidate>
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
                                            <div class="form-group d-grid gap-2 d-md-flex justify-content-md-end p-md-2 p-1">
                                                <button id="save" type="submit" class="btn btn-warning" @click="updateStudentInstituteInformations()">Kaydet</button>
                                            </div>
                                        </form> 
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>       
    </div>
</div>
`;


const AdminStudents = {
    template: Template,
    data: function() {
        return {
            table: null,
            selected_student: null,
            updateForm: {
                user_firstname: '',
                user_lastname: '',
                email: '',
                user_status: false
            },
            changedUpdateForm: {
                user_firstname: false,
                user_lastname: false,
                email: false,
                user_status: false
            },
            instituteForm: {
                institution_type: null,
                city: null,
                institution_name: null,
                teacher_fullname: null,
                class: null,
                branch: null
            },
            newInstituteForm: {
                institution_id: null,
                institution_name: null,
                teacher_id: null,
                teacher_fullname: null,
                class_id: null,
                class: null,
                class_branch_id: null,
                class_branch: null
            },
        }
    },
    watch: {
        'updateForm.user_firstname': function(params) {
            if(this.updateForm.user_firstname != this.selected_student.user_firstname)
                this.changedUpdateForm.user_firstname = true
            else
                this.changedUpdateForm.user_firstname = false
        },
        'updateForm.user_lastname': function(params) {
            if(this.updateForm.user_lastname != this.selected_student.user_lastname)
                this.changedUpdateForm.user_lastname = true
            else
                this.changedUpdateForm.user_lastname = false
        },
        'updateForm.email': function(params) {
            if(this.updateForm.email != this.selected_student.email)
                this.changedUpdateForm.email = true
            else
                this.changedUpdateForm.email = false
        },
        'updateForm.user_status': function(params) {
            if(this.updateForm.user_status != this.selected_student.user_status)
                this.changedUpdateForm.user_status = true
            else
                this.changedUpdateForm.user_status = false
        },
    },
    methods: {
        getAllStudents(){
            var self = this;
            $.ajax({
                type: "post",
                url: "/api/user/admin/students",
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Authorization', 'Bearer ' + getCookie('admin_token'));
                }, 
                timeout: 30000,
            })
                .done(function (res) {
                    try {
                        if(res.ok){
                            createDataTable({
                                columns: [
                                    {data:'delete', title: '', width: "15px"},
                                    {data:'update', title: '', width: "15px"},  
                                    {data:'inspect', title: 'İncele', width: "15px"},   
                                    {data:'id', title: 'id', visible: false},   
                                    {data:'user_uuid', title: 'user_uuid', visible: false},   
                                    {data:'user_fullname', title: 'Ad-Soyad'},
                                    {data:'email', title: 'E-posta'},      
                                    {data:'institution_id', title: 'okul_id', visible: false}, 
                                    {data:'institution_name', title: 'Okul'}, 
                                    {data:'teacher_fullname', title: 'Ögretmen Adı'},
                                    {data:'teacher_id', title: 'ogretmen_id', visible: false},
                                    {data:'class', title: 'Sınıf'},
                                    {data:'class_id', title: 'Sınıf_id', visible: false},
                                    {data:'class_branch', title: 'Şube'},
                                    {data:'class_branch_id', title: 'Sube_id', visible: false},
                                    {data:'institution_type', title: 'Kurum Türü', visible: false},
                                    {data:'city', title: 'Il(Okul)', visible: false},                       
                                    {
                                        data:'user_status', 
                                        title: 'Hesap Durumu',
                                        render: function(params) {
                                            if(params == 1)    
                                                return '<span class="badge badge-success">Aktif</span>'
                                            else
                                                return '<span class="badge badge-danger">Askıda</span>'
                                        }
                                    },
                                    {data:'created_date', title: 'Kayıt Tarihi'},
                                    {data:'is_inited', title: '', visible: false}
                                ],
                                data: res.result.data.map(function(row, i) {   
                                    var button = document.createElement('button')
                                    var icon = document.createElement('i')
                                                
                                    button.className = "btn btn-warning btn-sm d-flex justify-content-center align-items-center icon-button-s-1 rounded-circle"
                                    button.id = 'delete_' + row.user_uuid
                                    icon.className = "fa fa-trash text-white"
                                    button.innerHTML = icon.outerHTML
                                    row.delete = button.outerHTML

                                    button.className = "btn btn-success btn-sm d-flex justify-content-center align-items-center icon-button-s-1 rounded-circle"
                                    button.id = 'update_' + row.user_uuid
                                    button.setAttribute('data-bs-toggle', 'modal')
                                    button.setAttribute('href', '#update-modal')
                                    icon.className = "fa fa-pen text-white"
                                    button.innerHTML = icon.outerHTML
                                    row.update = button.outerHTML
                                    
                                    var review = document.createElement('a')
                                    review.className = "btn btn-info btn-sm d-flex justify-content-center align-items-center icon-button-s-1 rounded-circle"
                                    review.href = 'admin/students/' + row.user_uuid
                                    review.id = 'inspect_' + row.user_uuid
                                    icon.className = "fa fa-eye text-white"
                                    review.innerHTML = icon.outerHTML
                                    row.inspect = review.outerHTML

                                    var user_fullname = row.user_fullname.split(' ')

                                    row.user_lastname = user_fullname.length > 1 ? user_fullname.pop(): ''
                                    row.user_firstname = user_fullname.join(' ').toString()
                                    
                                    return row;
                                }),
                                createdRow: function (row, data, dataIndex) {                     
                                    $(row).attr('id', 'row_' + data.id);   
                                    $(row).children('td').children('#delete_' + data.user_uuid).on('click', function () {      
                                        self.deleteStudent(row, data.id)
                                    })
                                    $(row).children('td').children('#update_' + data.user_uuid).on('click', function () {      
                                        
                                        self.updateForm = Object.assign({}, {
                                            user_fullname: data.user_fullname,
                                            user_lastname: data.user_lastname,
                                            user_firstname: data.user_firstname,
                                            email: data.email,
                                            user_status: data.user_status == 1 ? true:false
                                        })

                                        $("#cmbKurumTuru_I").select2().val(data.institution_type != null ? data.institution_type: "-1").trigger("change")
                                        $("#cmbil_I").select2().val(data.city != null ? data.city: "-1").trigger("change")
                                        $("#cmbclass_I").select2().val(data.class_id != null ? data.class_id: "-1").trigger("change")
                                        $("#cmbbranch_I").select2().val(data.class_branch_id != null ? data.class_branch_id: "-1").trigger("change")

                                        self.instituteForm = Object.assign({}, {
                                            institution_id: data.institution_id,
                                            institution_type: data.institution_type,
                                            city: data.city,
                                            institution_name: data.institution_name,
                                            teacher_id: data.teacher_id,
                                            teacher_fullname: data.teacher_fullname,
                                            class: data.class_id,
                                            branch: data.class_branch_id
                                        })

                                        self.newInstituteForm = Object.assign({}, {
                                            institution_id: data.institution_id,
                                            institution_name: data.institution_name,
                                            teacher_id: data.teacher_id,
                                            teacher_fullname: data.teacher_fullname,
                                            class_id: data.class_id,
                                            class: data.class,
                                            class_branch: data.class_branch,
                                            class_branch_id: data.class_branch_id
                                        })

                                        self.getInstitutions()
                                        select2Styles()
                                        self.selected_student = Object.assign({}, data)

                                    })

                                }
                            })
                                .then(function(res){
                                    self.table = res
                                })
                                .catch(function(err){
                                    console.log(err);
                                })
                        }
                        else
                            showErrorToast("Sunucudan veri çekilemiyor. Bilinmeyen bir sorun oluştu.");  

                    } catch (error) {
                        console.log(error);
                        showErrorToast("Bilinmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.");      
                    }
                })
                .fail(function(xhr, status, error) {
                    try {
                        var err = eval("(" + xhr.responseText + ")");
                        
                        if(!err.ok){      
                            var table = undefined
                            createDataTable({
                                data: [{}]
                            })
                                .then(function(res){
                                    table = res
                                })
                                .catch(function(err){
                                    console.log(err);
                                })   

                            showErrorToast(err.description);
                        }
                        else
                            showErrorToast("Sunucuda bir hata oluştu, daha sonra tekrar deneyiniz.")
                    
                        
                    } catch (error) {
                        console.log(error);
                    }      
                });
        },
        deleteStudent(row = null, student_id = 0){
            var self = this
            if(student_id < 1){
                showErrorToast("Öğrenci bilgileri veritabanında yanlış bulunuyor, lütfen yöneticinize başvurunuz.")
                return 0;
            }
            $.ajax({
                type: "post",
                url: "/api/user/admin/students",
                data: {
                    delete_student_id: student_id
                },
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Authorization', 'Bearer ' + getCookie('admin_token'));
                }, 
                timeout: 30000
            })
                .done(function (res) {
                    try {
                        if(res.ok){
                            if(row)
                                self.table.row(row).remove().draw()
                            showSuccessToast("Öğrenci başarıyla silindi.");  
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
        },
        updateStudentPrivateInformations(){
            if (!document.querySelector('#form-student-update').checkValidity()) 
                return -1;
            var self = this;
            var data = {
                update_student_id: self.selected_student.id,
                student_fullname: self.changedUpdateForm.user_firstname || self.changedUpdateForm.user_lastname ? (self.updateForm.user_firstname + ' ' + self.updateForm.user_lastname).trim(): '',
                student_email: self.changedUpdateForm.email ? self.updateForm.email:'',
                student_status: self.changedUpdateForm.user_status ? (self.updateForm.user_status ? 1:0):'',
            }
            if([data.student_fullname, data.student_email].every((el) => el == '') && !self.changedUpdateForm.user_status){
                showErrorToast("Güncelleme yapabilmek için değerler üzerinde değişiklik yapmanız gerekir.")
                return 0;
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
                            var row = $('#row_' + self.selected_student.id)

                            var newRowData = {
                                ...self.selected_student
                            }
                            if (data.student_fullname) 
                                newRowData.user_fullname = data.student_fullname
                            if (data.student_email) 
                                newRowData.email = data.student_email
                            if (data.student_status || data.student_status == 0) 
                                newRowData.user_status = data.student_status
                                
                            self.selected_student = Object.assign({}, newRowData);

                            self.table
                                .row(row)
                                .data(newRowData)
                                .invalidate()
                                .draw()

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
        },
        updateStudentInstituteInformations(){
            if (!document.querySelector('#form-student-update-institute').checkValidity()) 
                return -1;
            
            var self = this;
            var data = {
                update_student_id: self.selected_student.id,
                institution_id: ["-1", self.instituteForm.institution_id].includes(self.newInstituteForm.institution_id) ? "": self.newInstituteForm.institution_id,
                teacher_id: ["-1", self.instituteForm.teacher_id].includes(self.newInstituteForm.teacher_id) ? "": self.newInstituteForm.teacher_id,
                class: ["-1", self.instituteForm.class].includes(self.newInstituteForm.class_id) ? "": self.newInstituteForm.class_id,
                class_branch: ["-1", self.instituteForm.branch].includes(self.newInstituteForm.class_branch_id) ? "": self.newInstituteForm.class_branch_id
            }
            if([data.institution_id, data.teacher_id, data.class, data.class_branch].every((el) => el == '')){
                showErrorToast("Güncelleme yapabilmek için değerler üzerinde değişiklik yapmanız gerekir.")
                return 0;
            }
            console.log(data);
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
                            var row = $('#row_' + self.selected_student.id)

                            var newRowData = {
                                ...self.selected_student
                            }
                            if (data.institution_id){ 
                                newRowData.institution_id = data.institution_id
                                newRowData.institution_name = self.newInstituteForm.institution_name
                            }

                            if (data.teacher_id) {
                                newRowData.teacher_id = data.teacher_id
                                newRowData.teacher_fullname = self.newInstituteForm.teacher_fullname
                            }

                            if (data.class){ 
                                newRowData.class_id = self.newInstituteForm.class_id
                                newRowData.class = self.newInstituteForm.class
                            }

                            if (data.class_branch){ 
                                newRowData.class_branch_id = self.newInstituteForm.class_branch_id
                                newRowData.class_branch = self.newInstituteForm.class_branch
                            }
                            
                            self.selected_student = Object.assign({}, newRowData);

                            self.table
                                .row(row)
                                .data(newRowData)
                                .invalidate()
                                .draw()

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
        },
        getInstitutions(){
            var self = this;
            
            if([self.instituteForm.institution_type, self.instituteForm.city].includes("-1") || [self.instituteForm.institution_type, self.instituteForm.city].includes(null))
                return -1
            var data = {
                institution_type: self.instituteForm.institution_type,
                city: self.instituteForm.city
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
                                self.newInstituteForm.institution_id = e.target.value;
                                self.newInstituteForm.institution_name = e.params.data.text;
                                self.getTeachers();
                            }
                        );
                        
                        $("#cmbokul_I").select2().val(self.instituteForm.institution_id).trigger("change");
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
                institution_id: this.newInstituteForm.institution_id
            };

            if(["-1"].includes(self.newInstituteForm.institution_id))
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
                                self.newInstituteForm.teacher_id = e.target.value;
                                self.newInstituteForm.teacher_fullname = e.params.data.text;
                            }
                        );
                        self.newInstituteForm.teacher_id = self.instituteForm.teacher_id
                        self.newInstituteForm.teacher_fullname = self.newInstituteForm.teacher_fullname
                        $("#cmbteacher_I").select2().val(self.instituteForm.teacher_id).trigger("change");
                        
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
            self.instituteForm[key] = val;
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
                    self.newInstituteForm.institution_id = "-1";
                    self.newInstituteForm.institution_name = null;
                    break;
                case '#cmbteacher_I':
                    self.newInstituteForm.teacher_id = "-1";
                    self.newInstituteForm.teacher_fullname = null;
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
    },
    mounted() {

        var self = this
        self.getAllStudents()

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
                self.newInstituteForm.class_id = e.target.value
                self.newInstituteForm.class = e.params.data.text
            });
    
            $("#cmbbranch_I").select2({
                data: [{id: "-1", text: "Şube Yok"}].concat("ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ".split("").map(function(el, i){ return {id:i+1, text: el}}))
            });
            $('#cmbbranch_I').on('select2:select', function (e) {
                self.newInstituteForm.class_branch_id = e.target.value
                self.newInstituteForm.class_branch = e.params.data.text
            });
        })
    },
        
}

Vue.component('AdminStudents', AdminStudents)

export default AdminStudents