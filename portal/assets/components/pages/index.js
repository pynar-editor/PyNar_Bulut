const Template = `
    <div>
        <div class="container my-3 mh-100 shadow-sm bg-white p-md-5 p-3 w-100 mw-100">
            <div class="d-xxl-flex d-block">
                <div class="col-xxl-7 col-12 pt-3 pe-xxl-5">
                    <div class="alert alert-info" role="alert">
                        <h4 class="alert-heading">
                            <i class="fa fa-info-circle fa-1x" /> Şuan Ana Sayfadasınız
                        </h4>
                        <p>Burada size gönderilen ödevleri, en çok ödev gönderenleri ve periyodik olarak ödev gönderilme ağırlıklarını görebilirsiniz..</p>
                    </div>
                </div>       
                <div class="col-xxl-5 col-12 d-flex pt-3">
                    <div class="col-6 pe-1">
                        <div class="card rounded text-white bg-success mb-3">
                            <div class="card-body p-3">
                                <i class="fa fa-calendar-check fa-5x" />
                                <span class="float-end fs-41">{{data.total_assignment_count}}</span>
                                <div class="text-end">Ödev</div>
                            </div>
                        </div>
                    </div>
                    <div class="col-6 ps-1">
                        <div class="card rounded text-white bg-info mb-3">
                            <div class="card-body p-3">
                                <i class="fa fa-child fa-5x" />
                                <span class="float-end fs-41">{{data.total_student_count}}</span>
                                <div class="text-end">Öğrenci</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>  
            <div class="d-xxl-flex d-block">
                <div class="col-xxl-7 col-12 pt-3 pe-xxl-5" style="max-height:350px; height:350px">
                    <canvas id="chart"></canvas>
                </div>       
                <div class="col-xxl-5 col-12 d-flex pt-3">
                    <div class="card col-12 shadow-sm rounded bg-white mb-3">
                        <div class="card-header">En Çok Ödev Gönderenler</div>
                        <div class="">
                            <ul class="list-group list-group-flush">
                                <li v-for="(student, index) in data.assignment_leader_table" class="p-0 list-group-item d-flex justify-content-between align-items-start">
                                    <a :href="'students/' + student.user_uuid" class="text-dark p-4 border-0 list-group-item d-flex justify-content-between align-items-start w-100">
                                        <div class="ms-2 me-auto">
                                            <div class="d-flex justify-content-center align-items-center">
                                                <i :class="'fa fa-award fa-2x text-' + student.color + ' me-3'" ></i>
                                                <span class="me-3" v-html="student.avatar"></span>{{student.user_fullname}}
                                            </div>
                                        </div>
                                        <span class="badge bg-success rounded-pill">{{student.countOfAssignments}} ödev</span>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div> 
        </div>
    </div>
`;


const Home = {
    template: Template,
    data: function(){
        return {
            data: {
                assignment_leader_table: [],
                one_year_period: [],
                total_assignment_count: 0,
                total_student_count: 0
            }
        }
    },
 
    mounted: function() {

        var self = this;

        $.ajax({
            type: "post",
            url: "/api/user/teacher/statistics",
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + getCookie('token'));
            }, 
            timeout: 30000
        })
            .done(function (res) {
                try {
                    if(res.ok){
                        self.data = res.result
                        self.data.assignment_leader_table = self.data.assignment_leader_table.map(function (el, index) {
                            el.avatar = avatar(el.user_fullname, 0).outerHTML
                            el.color = index == 0 ? 'golden': index == 1 ? 'silver': index == 2 ? 'bronze': ''
                            return el
                        })
                        self.data.one_year_period = self.data.one_year_period.map(function (el) {
                            el.Month = el.Month.splice(4, 0, "-")
                            return el
                        }) 

                        var date = new Date()
                        var month = date.getMonth() + 1
                        var year = date.getFullYear()

                        for (let i = 0; i < 12; i++) {                  
                            let m = (month + i) % 13
                            var formattedDate = (m < month ? year : year - 1) + '-' + (m < month ? formattedMonth(m + 1) : formattedMonth(m) )
                            if(self.data.one_year_period.filter(function(el){ return el.Month == formattedDate}).length == 0) 
                                self.data.one_year_period.push({
                                    Month: formattedDate,
                                    total: 0
                                })
                        }
                        var nowFormattedDate = year + '-' + formattedMonth(month)
                        if(self.data.one_year_period.filter(function(el){ return el.Month == nowFormattedDate}).length == 0) 
                            self.data.one_year_period.push({
                                Month: nowFormattedDate,
                                total: 0
                            })

                        self.data.one_year_period = self.data.one_year_period.sort(function(a, b){
                            return parseInt(a.Month.replace('-','')) > parseInt(b.Month.replace('-','')) && 1 || -1
                        });
                        var totals = self.data.one_year_period.map(function(el){ return el.total})
                        
                        jQuery.getScript('assets/lib/chartjs/chart-3.3.2.min.js', function() {
                            var ctx = document.getElementById("chart").getContext('2d');
                            var myChart = new Chart(ctx, {
                                type: 'line',           
                                data: {
                                    labels: self.data.one_year_period.map(function(el, i){ return el.Month }),
                                    datasets: [{
                                        label: 'Gönderilen Ödevler', // Name the series
                                        data: totals, // Specify the data values array
                                        fill: true,
                                        borderColor: '#ff6384',
                                        backgroundColor: '#ffb1c1',
                                        tension: .4
                                    }]
                                },
                                options: {
                                    scales: {
                                        x: {
                                            ticks: {
                                                // For a category axis, the val is the index so the lookup via getLabelForValue is needed
                                                callback: function(val, index) {
                                                // Hide the label of every 2nd dataset
                                                return index % 2 === 0 ? this.getLabelForValue(val) : '';
                                                }
                                            },                                    
                                        },
                                        y: {grid: {
                                            display: false,
                                        },}
                                    },
                                    responsive: true, // Instruct chart js to respond nicely.
                                    maintainAspectRatio: false, // Add to prevent default behaviour of full-width/height 
                                }
                            });
                        });
                        
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
}

Vue.component('Home', Home)

export default Home