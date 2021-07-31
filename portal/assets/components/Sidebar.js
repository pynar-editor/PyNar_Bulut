var Template = `
    <div>       
        <div id="sidebarCollapseContainer" class="d-lg-none shadow-sm position-fixed h-100 pe-0 fixed-top w-100"></div>   
        <nav class="sidebar sidebar-collapse d-lg-block bg-light position-fixed h-100 pe-0 fixed-top bg-transparent">          
            <div class="sidebar-nav-container position-sticky bg-white z-index-999 h-100">
                <div class="sidebar-title align-items-center d-lg-none d-flex shadow-sm justify-content-center">
                    <strong>PyNar</strong>
                </div>
                <div class="sidebarTitleBaseline d-lg-block d-none bg-transparent"></div>
                <div class="sidebarBottomBaseLine h-100 shadow-sm">
                    <ul id="nav-list" v-html="drawers(links[loggedUser], 0)" class="nav list-group list-group-flush flex-column pt-3 d-block h-100">
                    </ul>
                </div>
            </div>
            <div class="d-lg-none z-index-9 sidebar-custom-menu">
                <button type="button" class="btn btn-secondary shadow-none" id="sidebarCollapse" >
                    <i class="fa fa-bars text-white"></i>
                    <span class="sr-only">Toggle Menu</span>
                </button>
            </div>
        </nav>
        <div class="sidebarCssBaseline d-none d-lg-flex"></div>     
    </div> 
`;

var Sidebar = {
    template: Template,
    data: function() {
        return {
            loggedUser: getCookie('loggedUser'),
            links: {
                teacher: [
                    { title: "Ana sayfa", icon: 'fa fa-home', href: "" },
                    { title: "Bilgilerim", icon: 'fa fa-address-card', href: "my" },
                    { title: "Bilgilerim", icon: 'fa fa-address-card', href: "my" },
                ],
                student: [
                    { title: "Bilgilerim", icon: 'fa fa-address-card', href: "my" },
                    { title: "PyNar Kutu", icon: 'fa fa-box', href: "files" },
                    { title: "Ödevlerim", icon: 'fa fa-tasks', href: "assignments" }
                ]
            },
            list: "",
        }
    },
    methods: {
        getStudents: function(){
            var self = this;
            $.ajax({
                type: "post",
                url: "/api/user/teacher/students",
                async: false,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Authorization', 'Bearer ' + getCookie('token'));
                }, 
                timeout: 30000,
            })
                .done(function (res) {
                    try {
                        if(res.ok){
                            var institutions = {};
                            res.result.data.map(function(el, i){
                                if(!["", null, undefined].includes(el.institution_name) && institutions[el.institution_name] == undefined)
                                    institutions[el.institution_name] = {}
                                if(!["", null, undefined].includes(el.class) && institutions[el.institution_name][el.class] == undefined)
                                    institutions[el.institution_name][el.class + '. Sınıf'] = {}
                                if(!["", null, undefined].includes(el.class_branch) && institutions[el.institution_name][el.class + '. Sınıf'][el.class_branch] == undefined)
                                    institutions[el.institution_name][el.class + '. Sınıf'][el.class_branch] = {}
                            });                     

                            var students = { title: "Öğrenciler", icon: 'fa fa-user-graduate', href: "#", drawer: []}

                            for (var institution_key of Object.keys(institutions)) {
                                var institution = { 
                                    title: institution_key,
                                    icon: 'fa fa-minus',
                                    href: '#',
                                };
                                institution['drawer'] = [];
                                for (var class_key of Object.keys(institutions[institution_key])) {
                                    var class_obj = { 
                                        title: class_key,
                                        icon: 'fa fa-minus',
                                        href: '#',
                                    };
                                    class_obj['drawer'] = [];
                                    for (var branch_key of Object.keys(institutions[institution_key][class_key])) {
                                        var branch = { 
                                            title: branch_key,
                                            icon: 'fa fa-minus',
                                            href: 'students/' + institution_key + '/' + class_key + '/' + branch_key,
                                        };                                       
                                        class_obj['drawer'].push(branch);
                                    } 
                                    institution['drawer'].push(class_obj);
                                } 
                                students.drawer.push(institution);
                            }                   
                            self.links.teacher.push(students);                       
                        }
                        else
                            console.log("Sunucudan veri çekilemiyor. Bilinmeyen bir sorun oluştu.");  

                    } catch (error) {
                        console.log(error);
                    }
                })
                .fail(function(xhr, status, error) {
                    try {
                        console.log(error);
                    
                    } catch (error) {
                        console.log(error);
                    }      
                });
        },
        drawers(items, drawer = 0){ 
            var elements = ''; 
            for (var item of items){
                
                var margin = "";
                var classes = "";
                if(drawer != 0){
                    margin = '<span style="margin-left: ' + (drawer+1)*15 + 'px;"></span>';
                    classes = 'dropdown-item';
                }
                if(item.drawer == undefined){
                    var href = item.href ? item.href: '';
                    var icon = item.icon ? item.icon: '';
                   
                    
                    elements += `
                        <a class="nav-link list-group-item-action link-dark ${classes}" aria-current="page" href="${href}">
                            ${margin}
                            <i class="${icon}" ></i>
                            ${item.title}
                        </a>
                    `;
                }else{
                    
                    var href = item.href ? item.href: '';
                    var icon = item.icon ? item.icon: '';
                    var id = 'side_' + uuidv4();
                    elements += `
                        <a class="nav-link dropdown-toggle list-group-item-action link-dark ${classes}" href="#" data-bs-toggle="collapse" data-bs-target="#${id}" aria-expanded="false" aria-label="Toggle Navigation" aria-controls="${id}">
                            ${margin}    
                            <i class="${icon}" ></i>
                            ${item.title}
                        </a>
                        <ul class="navbar-nav collapse slidedropdown-menu-dark position-relative fixed-top border-0 rounded-0" id="${id}">
                            ${this.drawers(item.drawer, drawer + 1)}
                        </ul>
                    `;
                    
                }
            }
            return elements;
        }
    },
    created(){
        if(this.loggedUser == "teacher")
            this.getStudents();
    }
    
}

Vue.component('Sidebar', Sidebar)

export default Sidebar