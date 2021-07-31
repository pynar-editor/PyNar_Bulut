import Code from '../../../code/Code.js'

const Template = `
    <div>
        <div class="header bg-primary pb-6">
            <div class="container-fluid">
                <div class="header-body">
                    <div class="row align-items-center py-4">
                        <div class="col-lg-6 col-7">
                            <h6 class="h2 text-white d-inline-block mb-0">Öğretmen</h6>
                            <nav aria-label="breadcrumb" class="d-none d-md-inline-block ml-md-4">
                                <ol class="breadcrumb breadcrumb-links breadcrumb-dark">
                                    <li class="breadcrumb-item"><a href="admin"><i class="fas fa-home"></i></a></li>
                                    <li class="breadcrumb-item active" aria-current="page"><a href="admin/teachers">Öğretmenler</a></li>
                                    <li class="breadcrumb-item active" aria-current="page">Öğretmen Önizleme</li>
                                </ol>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="d-xl-flex mb-3 mt--6 px-md-5 pe-0 mh-100 w-100 mw-100" >
            <div class="col-xl-3">
                <div class="text-center card bg-white shadow-sm p-lg-4 p-3 me-lg-3" >
                    <div id="avatar" class="d-flex justify-content-center align-items-center">
                    </div>
                    <p class="mt-3 mb-0">
                        <strong>
                            {{teacher_info.user_fullname}}<br>
                            {{teacher_info.email}}
                        </strong>
                    </p>
                </div>
            </div>
            <div class="col-xl-9">
                <div class="bg-white card shadow-sm p-lg-4 p-3 overflow-auto">           
                    <h2>Öğretmen'e Gönderilen Ödevler</h2>
                    <hr>
                    <table id="data-table" class="data-table table table-striped table-hover display responsive nowrap"></table>
                </div>
                <div id="code-modal" class="modal" tabindex="-1">
                    <div class="modal-dialog modal-lg modal-dialog-scrollable">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5>{{selected_assignment != null ? selected_assignment.file_name: ''}}</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <Code></Code>
                                <form id="form-teacher-assign-result">
                                    <div class="form-group col-lg-3 col-6 p-md-2 p-1">
                                        <label for="password" class="form-label">Not*</label>
                                        <div class="col-sm-12 pb-2">
                                            <div class="input-group has-validation">
                                                <input id="grade" class="form-control" v-model="form.grade" type="number" readonly>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="form-group col-lg-6 col-md-8 p-md-2 p-1">
                                        <label for="password" class="form-label">Açıklama*</label>
                                        <div class="col-sm-12 pb-2">
                                            <div class="input-group has-validation">
                                                <textarea id="explain" class="form-control" v-model="form.comment" rows="3" readonly></textarea>
                                            </div>
                                        </div>
                                    </div>
                                </form> 
                            </div>
                        </div>
                    </div>
                </div>
            </div>   
        </div>
    </div>
`;


const AdminTeacher = {
    template: Template,
    data: function() {
        return {
            editor: null,
            teacher_info: {
                avatar: null,
                email: '# Bulunamadı',
                user_fullname: "# Bulunamadı"
            },
            selected_assignment: null,
            form: {
                grade: null,
                comment: null,
                file: "",
            },
            table: null
        }
    },
    mounted(){
        var self = this;   
        var code_modal = document.getElementById('code-modal')

        code_modal.addEventListener('shown.bs.modal', function () {
            if(self.editor != null)
                self.editor.refresh()
        })

        createEditor()
            .then(function(res){
                self.editor = res
            })
            .catch(function(err){
                console.log(err);
            })

        var data = {
            assignments_by_teacher_uuid: this.$route.params.teacher
        };     

        $.ajax({
            type: "post",
            data: data,
            async: false,
            url: "/api/user/admin/teachers",
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + getCookie('admin_token'));
            }, 
            timeout: 30000,
        })
            .done(function (res) {
                try {
                    if(res.ok){
                        self.rows = res.result.data;
                        createDataTable({
                            aaSorting: [],
                            columns: [

                                {data:'id', title: 'id', visible: false},
                                {data:'file_name', title: 'Dosya Adı'},
                                {data:'grade', title: 'Grade', visible: false},
                                {data:'comment', title: 'Comment', visible: false},
                                {data:'user_fullname', title: 'Gönderildiği Öğretmen'},   
                                {data:'user_id', title: 'Tekil ad', visible: false},   
                                {
                                    data:'status', 
                                    title: 'Durum',
                                    render: function(params) {
                                        if(params == 1)    
                                            return '<span class="badge badge-success">Öğretmen Okudu</span>'
                                        else
                                            return '<span class="badge badge-danger">Öğretmen Okumadı</span>'
                                    }
                                },
                                {data:'created_date', title: 'Yüklenme Tarihi'},
                            ],
                            data: self.rows.reverse(),
                            createdRow: function (row, data, dataIndex) {
                                $(row).attr('role', 'button'); 
                                $(row).attr('id', 'row_' + data.id);   
                                $(row).attr('data-bs-toggle', 'modal');
                                $(row).attr('href', '#code-modal'); 
                                                            
                                $(row).on('click', function () {                                                       
                                    var content = self.openFile(data)
                                    setEditor(self.editor, content);
                                });
                            }
                        })
                            .then(function(res){
                                self.table = res

                                if(self.$route != undefined && self.$route.params.assignment > 0){
                                    var row = self.table.row('#row_' + self.$route.params.assignment);
                                    if(row.data() != undefined)
                                        self.openFile(row.data());
                                }
                            })
                            .catch(function(err){
                                console.log(err);
                            })                    

                        self.teacher_info = {
                            avatar: res.result.avatar != null ? res.result.avatar: self.teacher_info.avatar,
                            email: res.result.email,
                            user_fullname: res.result.user_fullname,
                        }

                        document.querySelector('#avatar').innerHTML = avatar(self.teacher_info.user_fullname, 5).outerHTML;
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
                    console.log(xhr);
                    var err = eval("(" + xhr.responseText + ")");
                    if(!err.ok)
                        showErrorToast(err.description)
                    else
                        $showErrorToast("Sunucuda bir hata oluştu, daha sonra tekrar deneyiniz.")
                    
                } catch (error) {
                    console.log(error);
                }      
            });
    },
    methods: {
        openFile(row) {
            var self = this;
            var content = "# Dosya açılamıyor...";
            if (document.getElementById('code') == null)
                alert("Bir problem oluştu.")
            else {
                var data = {
                    assignments_by_student_id: row.user_id,
                    assignment_id: row.id
                }
                console.log(data);
                $.ajax({
                    type: "post",
                    url: "/api/user/admin/teachers",
                    data: data,
                    async: false,
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('Authorization', 'Bearer ' + getCookie('admin_token'));
                    }, 
                    timeout: 30000,
                })
                    .done(function (res) {
                        try {
                            if(res){
                                self.form.comment = row.comment;
                                self.form.grade = row.grade;
                                content = res;
                            }
                            else
                                showErrorToast("Sunucudan dosya getirilemedi. Bilinmeyen bir sorun oluştu.");  
        
                        } catch (error) {
                            showErrorToast("Bilinmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.");      
                        }
                    })
                    .fail(function(xhr, status, error) {
                        try {
                            var err = eval("(" + xhr.responseText + ")");
                            if(!err.ok)
                                showErrorToast(err.description)
                            else
                                showErrorToast("Sunucuda bir hata oluştu, daha sonra tekrar deneyiniz.")
                            
                        } catch (error) {
                            console.log(error);
                        }      
                    });
            }
            self.selected_assignment = row;
            return content;
        }
    }
}

Vue.component('AdminTeacher', AdminTeacher)

export default AdminTeacher