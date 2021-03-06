import AdminHeader from './Header.js';
import AdminContent from './Content.js';
import Toasts from '../alerts/Toasts.js';

const Template = `
<div>
    <AdminContent>  
    </AdminContent>
    <Toasts/>
</div>
    `;

const AdminLayout = {
    template: Template,
    data: function() {
        return {
            loggedUser: getCookie('loggedUser'),
            user_fullname: '',
            announcement: '',
            announcements: '',
        }
    },
    created(){
        const self = this;
        var data = {
            logging: false
        };
       
        /*if(self.loggedUser == 'student')
            data.inspected_id = self.$route.params.assignment;

        $.ajax({
            type: "post",
            data: data,
            url: "/api/user/" + self.loggedUser + '/header',
            async: false,
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + getCookie('token'));
            }, 
            timeout: 30000,
        })
            .done(function (res) {
                self.user_fullname = res.result.user_fullname
                
                self.announcement = parseInt(res.result.total) > 99 ? '99+' : res.result.total
                
                var announcements = '<div class="list-group announcement">';
                if(res.result.total > 0){
                    var i = 0;
                    
                    for (const el of res.result.data) {
                                           
                        var date = new Date(el.date);
                        var today =  new Date();
                        var diff = Math.abs(today.getTime() - date.getTime());
                                    
                        var since_by_date = Math.round(diff / (1000 * 3600 * 24));
                        if(self.loggedUser == "teacher")
                            announcements += `
                                    <a href="students/${el.user_uuid}/${el.id}" class="list-group-item list-group-item-action link-dark border-0 border-bottom">
                                        <div class="d-flex w-100 justify-content-between">
                                        <h5 class="mb-1"><strong>Yeni ??dev</strong></h5>
                                        <small>${since_by_date} g??n ??nce</small>
                                        </div>
                                        <p class="mb-1">${el.user_fullname} yeni bir ??dev g??nderdi.</p>
                                        <small>${el.institution_name}.</small>
                                    </a>`
                        else if (self.loggedUser == "student")       
                            announcements += `
                                    <a href="assignments/${el.id}" class="list-group-item list-group-item-action link-dark border-0 border-bottom">
                                        <div class="d-flex w-100 justify-content-between">
                                        <h5 class="mb-1"><strong>Yeni ??dev</strong></h5>
                                        <small>${since_by_date} g??n ??nce</small>
                                        </div>
                                        <p class="mb-1">${el.user_fullname} yeni bir ??dev g??nderdi.</p>
                                        <small>${el.institution_name}.</small>
                                    </a>`                       
                        i++;
                        if(i == 5)
                            break;
                    }
                    if(res.result.total > 5)
                        announcements += `
                                <a href="announcements" class="list-group-item list-group-item-action border-0 border-bottom">
                                    <p class="mb-1 text-center">Daha fazla...</p>
                                </a>`;    
                }
                else
                    announcements += `
                        <a class="list-group-item list-group-item-action link-dark border-0 border-bottom">
                            <div class="d-flex w-100 justify-content-between">
                                <h6 class="mb-1">Yeni bir bildiriminiz bulunmuyor.</h6>
                            </div>
                        </a>`;  
                announcements += '</div>';
                self.announcements = announcements;
                
            })
            .fail(function(xhr, status, error) {
                console.log(xhr);
            });*/
    },
}

Vue.component('AdminLayout', AdminLayout)

export default AdminLayout