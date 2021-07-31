

const Template = `
    <div>
        <div class=" bg-white shadow-sm my-3 p-md-5 p-3 w-100">
            <h2>Öğrenciler</h2>
            <hr/>
        </div>
        <div class="container my-3 mh-100 shadow-sm bg-white p-md-5 p-3 w-100 mw-100">
            <table class="data-table table table-striped table-hover display responsive nowrap"></table>              
        </div>
    </div>
`;


const Students = {
    template: Template,
    data: function() {
        return {
            rows: []
        }
    },
    methods: {
        getAllStudents(){
            var self = this;
            var data = {
                constraints: true,
                institution: this.$route.params.institution,
                class: parseInt(this.$route.params.class),
                branch: this.$route.params.branch
            }
            $.ajax({
                type: "post",
                data: data,
                url: "/api/user/teacher/students",
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
                                columns: [
                                    {data:'user_uuid', title: 'id', visible: false},
                                    {data:'avatar', title: ''},
                                    {data:'user_fullname', title: 'Ad-Soyad'},
                                    {data:'email', title: 'E-posta'}
                                ],
                                data: self.rows.map(function(row, i) {                              
                                    row.avatar = avatar(row.user_fullname).outerHTML
                                    return row;
                                }),
                                createdRow: function (row, data, dataIndex) {
                                    
                                    $(row).attr('role', 'button');
                                    $(row).on('click', function () {
                                        var row = table.row($(this)).data();
                                        document.location = 'students/' + row.user_uuid;
                                    });
                                }
                            })
                                .then(function(res){
                                    table = res
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
    },
    created() {

        this.getAllStudents();
      
    }
}

Vue.component('Students', Students)

export default Students