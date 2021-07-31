import Code from '../../code/Code.js'

const Template = `
    <div>
        <div class=" bg-white shadow-sm my-3 p-md-5 p-3 w-100">
            <h2>Ödevler</h2>
            <hr/>
        </div>
        <div class="d-lg-flex my-3 mh-100 w-100 mw-100" >
            <div class="col-12">
                <div class="bg-white shadow-sm p-lg-4 p-3 overflow-auto">           
                    <h5>Gönderilmiş Ödevler</h5>
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
                                    <div v-if="!['', null, undefined].includes(form.grade)" class="form-group col-md-2 p-md-2 p-1">
                                        <label for="grade">Not</label>
                                        <input id="grade" class="form-control" v-model="form.grade" min="0" max="100" type="number" readonly required>
                                    </div>
                                    <div v-if="!['', null, undefined].includes(form.comment)" class="form-group col-md-6 p-md-2 p-1">
                                        <label for="explain">Açıklama</label>
                                        <textarea id="explain" class="form-control" v-model="form.comment" rows="3" readonly></textarea>
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


const Assignments = {
    template: Template,
    data: function() {
        return {
            editor: null,
            selected_assignment: null,
            form: {
                grade: null,
                comment: null,
                file: "",
            },
        }
    },
    mounted(){
        var self = this;    
        
        var code_modal = document.getElementById('code-modal')

        code_modal.addEventListener('shown.bs.modal', function () {
            if(self.editor != null)
                self.editor.refresh()
        })

        createEditor({readOnly: 'nocursor'})
            .then(function(res){
                self.editor = res
            })
            .catch(function(err){
                console.log(err);
            })

        $.ajax({
            type: "post",
            url: "/api/user/student/assignments",
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + getCookie('token'));
            }, 
            timeout: 30000,
        })
            .done(function (res) {
                try {
                    if(res.ok){
                        self.rows = res.result.data;
                        var table = undefined
                            
                        createDataTable({
                            aaSorting: [],
                            columns: [
                                {data:'id', title: 'id', visible: false},
                                {data:'file_name', title: 'Dosya Adı'},
                                {data:'teacher_fullname', title: 'Öğretmen Adı'},
                                {data:'comment', title: 'Comment', visible: false},
                                {data:'grade', title: 'Not', visible:false},
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
                                table = res
                            })
                            .catch(function(err){
                                console.log(err);
                            })
                        if(self.$route != undefined && self.$route.params.assignment > 0){
                            var row = table.row('#row_' + self.$route.params.assignment);
                            if(row.data() != undefined)
                                self.openFile(row.data());
                        }
                    }
                    else
                        showErrorToast("Sunucudan veri çekilemiyor. Bilinmeyen bir sorun oluştu.");  

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
                $.ajax({
                    type: "post",
                    url: "/api/user/student/assignments/" + row.id,
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
            self.selected_assignment = Object.assign({},row);
            return content;
        }
    }
}

Vue.component('Assignments', Assignments)

export default Assignments