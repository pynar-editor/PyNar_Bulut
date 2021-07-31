import Header from './Header.js';
import Content from './Content.js';
import Toasts from './alerts/Toasts.js';

const Template = `
<div>
    <Header
        v-bind:logo="false"
        v-bind:logout="true"
        title="PyNar"
        v-bind:username="user_fullname"
        v-bind:announcement="announcement"
        v-bind:announcements="announcements"
        v-bind:collapse="true"
    ></Header>
    <Content></Content>
    <Toasts/>
</div>
    `;

const Layout = {
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
        
        if(self.loggedUser == 'student')
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
                                        <h5 class="mb-1"><strong>Yeni Ödev</strong></h5>
                                        <small>${since_by_date} gün önce</small>
                                        </div>
                                        <p class="mb-1">${el.user_fullname} yeni bir ödev gönderdi.</p>
                                        <small>${el.institution_name}.</small>
                                    </a>`
                        else if (self.loggedUser == "student")       
                            announcements += `
                                    <a href="assignments/${el.id}" class="list-group-item list-group-item-action link-dark border-0 border-bottom">
                                        <div class="d-flex w-100 justify-content-between">
                                        <h5 class="mb-1"><strong>Yeni Ödev</strong></h5>
                                        <small>${since_by_date} gün önce</small>
                                        </div>
                                        <p class="mb-1">${el.user_fullname} yeni bir ödev gönderdi.</p>
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
            });
    },
}

Vue.component('Layout', Layout)

export default Layout