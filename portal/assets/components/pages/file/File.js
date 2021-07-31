import Code from '../../code/Code.js'

const Template = `
    <div>
        <div class=" bg-white shadow-sm my-3 p-md-5 p-3 w-100">
            <h2>Dosyalar</h2>
            <hr/>
            <div class="alert alert-info" role="alert">
                <h4 class="alert-heading">Dosya Düzenleme</h4>
                <p>Daha önceden yüklediğiniz dosyalarınızı düzenlemek için masaüstü uygulamasını kullanmalısınız.</p>
                <hr>
                <p class="mb-0">Dosyanızı masaüstü uygulamasına indirmek için: uygulamanın üst panelinde bulunan "buluttan indirme" ikonuna tıklayınız.</p>
            </div>
        </div>
        <div class="d-lg-flex my-3 mh-100 w-100 mw-100" >
            <div class="col-12">
                <div class="bg-white shadow-sm p-lg-4 p-3 overflow-auto">           
                    <h5>Yüklenmiş Dosyalar</h5>
                    <hr>
                    <table id="data-table" class="data-table table table-striped table-hover display responsive nowrap"></table>
                </div>
                <div id="code-modal" class="modal" tabindex="-1">
                    <div class="modal-dialog modal-lg modal-dialog-scrollable">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5>{{selected_file != null ? selected_file.file_name: ''}}</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <Code></Code>
                            </div>
                        </div>
                    </div>
                </div>
            </div>   
        </div>
    </div>
`;

const Files = {
    template: Template,
    data: function() {
        return {
            editor: null,
            selected_file: null,
            form: {
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
            url: "/api/user/student/files",
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + getCookie('token'));
            }, 
            timeout: 30000,
        })
            .done(function (res) {
                try {
                    if(res.ok){
                        self.rows = res.result.data;
                        console.log(self.rows.map(el => { return {file_name: el} }));

                        var table = undefined
                            
                        createDataTable({
                            aaSorting: [],
                            columns: [
                                {data:'file_name', title: 'Dosya Adı'},
                            ],
                            data: self.rows.map(el => { return {file_name: el} }),
                            createdRow: function (row, data, dataIndex) {
                                $(row).attr('role', 'button');
                                $(row).attr('id', 'row_' + data.file_name);
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

                        if(self.$route != undefined && self.$route.params.file > 0){
                            var row = table.row('#row_' + self.$route.params.file);
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
                    url: "/api/user/student/files/" + row.file_name,
                    async: false,
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('Authorization', 'Bearer ' + getCookie('token'));
                    }, 
                    timeout: 30000,
                })
                    .done(function (res) {
                        try {
                            if(res){
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
                            console.log(xhr);
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
            self.selected_file = Object.assign({},row);
            return content;
        }
    }
}

Vue.component('Files', Files)

export default Files