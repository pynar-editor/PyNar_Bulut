import Code from '../../code/Code.js'

const Template = `
    <div>
        <div class=" bg-white shadow-sm my-3 p-md-5 p-3 w-100">
            <h2>Öğrenci</h2>
            <hr/>
        </div>
        <div class="d-xl-flex my-3 mh-100 w-100 mw-100" >
            <div class="col-xl-3">
                <div class="text-center bg-white shadow-sm p-lg-4 p-3 me-lg-3" >
                    <div id="avatar" class="d-flex justify-content-center align-items-center">
                    </div>
                    
                    <p class="mt-3 mb-0">
                        <strong>
                            {{student_info.user_fullname}}<br>
                            {{student_info.email}}
                        </strong>
                    </p>
                </div>
            </div>
            <div class="col-xl-9">
                <div class="bg-white shadow-sm p-lg-4 p-3 overflow-auto">           
                    <h5>Öğrencinin Ödevleri</h5>
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
                                <form id="form-student-assign-result" class="needs-validation" novalidate>
                                    <div class="form-group col-lg-3 col-6 p-md-2 p-1 validate-me">
                                        <label for="password" class="form-label">Not*</label>
                                        <div class="col-sm-12 pb-2">
                                            <div class="input-group has-validation">
                                                <input id="grade" class="form-control p-1" v-model="form.grade" type="number" min="0" max="100" placeholder="Not giriniz..." required>
                                                <div id="grade-feedback" class="invalid-feedback">
                                                    0 ve 100 arasında bir değer giriniz.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="form-group col-lg-6 col-md-8 p-md-2 p-1 validate-me">
                                        <label for="password" class="form-label">Açıklama*</label>
                                        <div class="col-sm-12 pb-2">
                                            <div class="input-group has-validation">
                                                <textarea id="explain" class="form-control" v-model="form.comment" rows="3" required></textarea>
                                                <div id="grade-feedback" class="invalid-feedback">
                                                    Lütfen bir yorum giriniz.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="form-group d-grid gap-2 d-md-flex justify-content-md-end p-md-2 p-1">
                                        <button id="save" type="submit" @click="save(false)" v-bind:class="(changed ? '':'disabled ') + 'btn btn-primary text-light'">Kaydet</button>
                                        <button id="send" type="submit" @click="sendToStudent" v-bind:class="(selected_assignment != null && selected_assignment.status == 'Öğretmen Okudu' ? (changed ? '':'disabled '):'') + 'btn btn-secondary text-light'">Öğrenciye Gönder</button>
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


const Student = {
    template: Template,
    watch: {
        'form.comment': function(params) {
            if(!this.initialize)
                this.changed = true;
        },
        'form.grade': function(params) {
            if(!this.initialize)
                this.changed = true;
            else
                this.initialize = !this.initialize;
        },
    },
    data: function() {
        return {
            editor: null,
            student_info: {
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
            initialize: true,
            changed: false,
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
            student_uuid: this.$route.params.student
        };     

        $.ajax({
            type: "post",
            data: data,
            async: false,
            url: "/api/user/teacher/assignments",
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + getCookie('token'));
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
                                {data:'status', title: 'Durum'},
                            ],
                            data: self.rows.map(function(row) {
                                if(row.status == 0)
                                    row.status = "Öğretmen Okumadı";
                                else if(row.status == 1)
                                    row.status = "Öğretmen Okudu";                          

                                return row;
                            }).reverse(),
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

                        self.student_info = {
                            avatar: res.result.avatar != null ? res.result.avatar: self.student_info.avatar,
                            email: res.result.email,
                            user_fullname: res.result.user_fullname,
                        }

                        document.querySelector('#avatar').innerHTML = avatar(self.student_info.user_fullname, 5).outerHTML;
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
        save(sendToStudent = false){
            var self = this;

            if (!document.querySelector('#form-student-assign-result').checkValidity()) 
                return -1;
            
            if(self.changed == false && !sendToStudent){
                showErrorToast("Değerler üzerinde bir değişiklik algılanmadı.");
                return -1;
            }
            if(['', null, undefined].includes(self.form.grade)){
                showErrorToast("Not girmeden kayıt gerçekleştirilemez.");
                return -1;
            }else if (['', null, undefined].includes(self.form.comment)){
                showErrorToast("Yorum girmeden kayıt gerçekleştirilemez.");
                return -1;
            }

            var data = {
                grade: self.form.grade,
                comment: self.form.comment,
                file: encodeURI(self.form.file),
                sendToStudent: sendToStudent,
                student_uuid: self.$route.params.student
            };
            $.ajax({
                type: "post",
                url: "/api/user/teacher/assignments/update/" + self.selected_assignment.id,
                data: data,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Authorization', 'Bearer ' + getCookie('token'));
                }, 
                timeout: 30000,
            })
                .done(function (res) {
                    try {
                        if(res.ok){
                            location.reload();
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
        sendToStudent(){
            this.save(true);
        },
        openFile(row) {
            var self = this;
            self.initialize = true;
            var content = "# Dosya açılamıyor...";
            if (document.getElementById('code') == null)
                alert("Bir problem oluştu.")
            else {
                $.ajax({
                    type: "post",
                    url: "/api/user/teacher/assignments/" + row.id,
                    async: false,
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('Authorization', 'Bearer ' + getCookie('token'));
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

Vue.component('Student', Student)

export default Student