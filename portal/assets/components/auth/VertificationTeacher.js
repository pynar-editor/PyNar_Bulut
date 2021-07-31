import Toast from '../alerts/Toast.js'

const Template = `
<div class="teacher-activation d-flex m-0 min-wh-100 min-vh-100 position-absolute p-md-5 p-2 fixed-top justify-content-center align-items-center bg-white d-none">
    <div class="p-md-5">
        <button class="float-end btn btn-default d-flex shadow-none">                        
            Aktifleştirmeden devam et
            <div class="ps-3">
                <i class="fa fa-long-arrow-alt-right" ></i>       
            </div>      
        </button>
        <div class="alert alert-success" role="alert">
            <h4 class="alert-heading">Kayıt Başarılı!</h4>
            <p>Hesabınızın aktifleştirilebilmesi için aşağıdaki kutuları doldurun.</p>
            <hr>
            <p class="mb-0">Eğer kaydınızı şimdi aktifleştirmeyecekseniz, yöneticiniz hesabınızı onayladığında sisteme erişebilirsiniz.</p>
        </div>
        <form novalidate>           
            <div class="py-3">
                <div class="form-group validate-me">
                    <label for="email" class="form-label">Özel/Resmi Kurum*</label>
                    <div class="col-sm-12 pb-2">
                        <div class="input-group has-validation">
                            <span class="input-group-text bg-white">
                                <i class="fa fa-university"></i>
                            </span>
                            <select class="form-control" name="cmbKurumTuru" id="cmbKurumTuru_I"></select>                        
                            <div id="email-feedback" class="invalid-feedback">
                                Lütfen kurum türü seçiniz.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="py-3">
                <div class="form-group validate-me">
                    <label for="email" class="form-label">İl*</label>
                    <div class="col-sm-12 pb-2">
                        <div class="input-group has-validation">
                            <span class="input-group-text bg-white">
                                <i class="fa fa-city"></i>
                            </span>
                            <select class="form-control" name="cmbil" id="cmbil_I"></select>                        
                            <div id="email-feedback" class="invalid-feedback">
                                Lütfen il seçiniz.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="py-3">
                <div class="form-group validate-me">
                    <label for="email" class="form-label">Okul*</label>
                    <div class="col-sm-12 pb-2">
                        <div class="input-group has-validation">
                            <span class="input-group-text bg-white">
                                <i class="fa fa-school"></i>
                            </span>
                            <select class="form-control" name="cmbokul" id="cmbokul_I"></select>                        
                            <div id="email-feedback" class="invalid-feedback">
                                Lütfen okul seçiniz.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="py-3">
                <div class="form-group">
                    <div class="col-sm-12 pb-2">
                        <div class="input-group d-flex justify-content-end">
                            <button class="btn btn-primary" type="button" @click="secondStep">Aktifleştir</button> 
                        </div>
                    </div>
                </div>
            </div>
        </form>
    </div>
</div>
`;
const VertificationTeacher = {
    template: Template,
    beforeCreate: function(){
        importSelect2()
    },
    mounted: function () {
        var self = this;
        $("#cmbKurumTuru_I").select2({
            data: [{'id':'-1','text':'Lütfen seçim yapınız.'},{'id':'resmi','text':'Resmi Kurumlar'},{'id':'ozel_kurum','text':'Özel Kurumlar'},{'id':'meb_disi','text':'MEB Dışı Kurumlar'},{'id':'universite','text':'Üniversiteler'}]
        });
        $('#cmbKurumTuru_I').on('select2:select', function (e) {
            self.firstStep();
        });

        $("#cmbil_I").select2({
            data: [{'id': "-1", 'text':'Lütfen seçim yapınız.'},'ADANA','ADIYAMAN','AFYONKARAHİSAR','AĞRI','AKSARAY','AMASYA','ANKARA','ANTALYA','ARDAHAN','ARTVİN','AYDIN','BALIKESİR','BARTIN','BATMAN','BAYBURT','BİLECİK','BİNGÖL','BİTLİS','BOLU','BURDUR','BURSA','ÇANAKKALE','ÇANKIRI','ÇORUM','DENİZLİ','DİYARBAKIR','DÜZCE','EDİRNE','ELAZIĞ','ERZİNCAN','ERZURUM','ESKİŞEHİR','GAZİANTEP','GİRESUN','GÜMÜŞHANE','HAKKARİ','HATAY','IĞDIR','ISPARTA','İSTANBUL','İZMİR','KAHRAMANMARAŞ','KARABÜK','KARAMAN','KARS','KASTAMONU','KAYSERİ','KIRIKKALE','KIRKLARELİ','KIRŞEHİR','KİLİS','KOCAELİ','KONYA','KÜTAHYA','MALATYA','MANİSA','MARDİN','MERSİN','MUĞLA','MUŞ','NEVŞEHİR','NİĞDE','ORDU','OSMANİYE','RİZE','SAKARYA','SAMSUN','SİİRT','SİNOP','SİVAS','ŞANLIURFA','ŞIRNAK','TEKİRDAĞ','TOKAT','TRABZON','TUNCELİ','UŞAK','VAN','YALOVA','YOZGAT','ZONGULDAK']
        });
        $('#cmbil_I').on('select2:select', function (e) {
            self.firstStep();
        });

        $("#cmbokul_I").select2({
            data: [{ 'id': '-1', 'text': 'Lütfen seçim yapınız.'}]
        });

        select2Styles();
    },
    methods: {
        firstStep(){
            if($('#cmbKurumTuru_I').val() == -1 || $('#cmbil_I').val() == -1)
                return -1
            var self = this;
            var data = {
                institution_type: document.getElementById('cmbKurumTuru_I').value,
                city: document.getElementById('cmbil_I').value,
                step: 1
            };
            $.ajax({
                type: "POST",
                url: "/api/user/institution/vertification",
                data: data,
            })
                .done(function(res) {

                    if(res.ok){
                        $("#cmbokul_I").select2({
                            data: Array.from(res.result.data).map(function(el) {
                                return {
                                    id: el.web_address,
                                    institution_id: el.id,
                                    text: el.institution_name
                                };
                            }),
                            sorter: data => data.sort((a, b) => a.text.localeCompare(b.text)),                    
                        });
                        select2Styles();
                    }
                })
                .fail(function(xhr, status, error){
                    $('.teacher-activation').addClass('d-none');
                    console.log(error);
                }); 
        },
        secondStep(){
            let urlParams = new URLSearchParams(window.location.search);

            if($('#cmbKurumTuru_I').val() == -1 || $('#cmbil_I').val() == -1 || $('#cmbokul_I').val() == -1)
                return -1;
            
            var self = this;
            var data = {
                token: urlParams.get('t'),
                web_address: document.getElementById('cmbokul_I').value,
                institution_id: $('#cmbokul_I').select2('data')[0].institution_id,
                step: 2
            };
            $.ajax({
                type: "POST",
                url: "/api/user/institution/vertification",
                data: data,
            })
                .done(function(res) {
                    if(res.ok)
                        showSuccessToast(res.result.message);
                    else
                        showErrorToast("Bilinmeyen bir hata oluştu, hesabınız aktifleştirilemedi.");
                    $('.teacher-activation').addClass('d-none');
                })
                .fail(function(xhr, status, error) {        
                    var err = eval("(" + xhr.responseText + ")");
                    if(!err.ok)
                        showErrorToast(err.description);
                    else
                        showErrorToast("Bilinmeyen bir hata oluştu, hesabınız aktifleştirilemedi.");
                    $('.teacher-activation').addClass('d-none');
                    console.log(error);
                });
        },
    },
};


Vue.component('VertificationTeacher', VertificationTeacher)

export default VertificationTeacher;