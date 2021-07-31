const Template = `
    <div>
        <div class=" bg-white shadow-sm my-3 p-md-5 p-3 w-100">
            <h2>Bildirimler</h2>
            <hr/>
        </div>
        <div class="d-lg-flex my-3 mh-100 w-100 mw-100" >
            <div class="col-12">
                <table id="data-table" class="data-table table table-striped table-hover display responsive nowrap"></table>  
            </div>   
        </div>
    </div>
`;


const Announcements = {
    template: Template,
    data: function() {
        return {
            loggedUser: getCookie('loggedUser')
        }
    },
    mounted(){
        var self = this;    
        $.ajax({
            type: "post",
            url: "/api/user/" + self.loggedUser +  "/announcements",
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + getCookie('token'));
            }, 
            timeout: 30000,
        })
            .done(function (res) {
                try {
                    if(res.ok){
                        self.rows = res.result.data;
                        var columns = [
                            {data:'id', title: 'id', visible: false},
                            {data:'user_fullname', title: 'Ad Soyad'},
                            {data:'file_name', title: 'Dosya Adı'},
                            {data:'institution_name', title: 'Okul Adı'},
                            {data:'date', title: 'Tarih'}
                        ];
                        if(self.loggedUser == "teacher")
                            columns.push({data:'user_uuid', title: 'user_uuid', visible: false});
                        
                        var table = undefined
                            
                        createDataTable({
                            columns: columns,
                            data: self.rows,
                            createdRow: function (row, data, dataIndex) {
                                $(row).attr('role', 'button');
                                if(self.loggedUser == "teacher")
                                    $(row).on('click', function () {                    
                                        document.location = `students/${data.user_uuid}/${data.id}`;                        
                                    });
                                else if (self.loggedUser == "student")
                                    $(row).on('click', function () {                    
                                        document.location = `assignments/${data.id}`;                      
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

}

Vue.component('Announcements', Announcements)

export default Announcements