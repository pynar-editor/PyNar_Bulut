var Template = `

    <nav class="sidenav navbar navbar-vertical fixed-left navbar-expand-xs navbar-light bg-white" style="overflow: inherit; width: 250px" id="sidenav-main">     
        <div class="scrollbar-inner bg-white">
            <div class="sidenav-header  align-items-center">
                <a class="navbar-brand" href="/portal">
                <img src="assets/img/logo.png" class="navbar-brand-img" alt="...">
                </a>
            </div>
            <div class="navbar-inner">
                <div class="collapse navbar-collapse" id="sidenav-collapse-main">
                    <ul class="navbar-nav">
                        <li class="nav-item">
                            <a class="nav-link active" href="admin">
                                <i class="ni ni-tv-2 text-primary"></i>
                                <span class="nav-link-text">Ana Sayfa</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="admin/profile">
                                <i class="ni ni-circle-08 text-info"></i>
                                <span class="nav-link-text">Profilim</span>
                            </a>
                        </li>
                    </ul>
                    <hr class="my-3 text-dark">
                    <h6 class="navbar-heading p-0 text-muted">
                        <span class="docs-normal">Öğrenci</span>
                    </h6>
                    <ul class="navbar-nav mb-md-3">
                        <li class="nav-item">
                            <a class="nav-link" href="admin/students">
                                <i class="ni ni-single-02 text-orange"></i>
                                <span class="nav-link-text">Öğrenciler</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="admin/students/add">
                                <i class="ni ni-fat-add text-orange"></i>
                                <span class="nav-link-text">Öğrenci Ekle</span>
                            </a>
                        </li>
                    </ul>
                    <hr class="my-3 text-dark">
                    <h6 class="navbar-heading p-0 text-muted">
                        <span class="docs-normal">Öğretmen</span>
                    </h6>
                    <ul class="navbar-nav mb-md-3">
                        <li class="nav-item">
                            <a class="nav-link" href="admin/teachers">
                                <i class="ni ni-single-02 text-success"></i>
                                <span class="nav-link-text">Öğretmenler</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="admin/teachers/add">
                                <i class="ni ni-fat-add text-success"></i>
                                <span class="nav-link-text">Öğretmen Ekle</span>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="d-xl-none z-index sidebar-admin sidenav-toggler" data-action="sidenav-pin" data-target="#sidenav-main">
            <button type="button" class="btn btn-default shadow-lg rounded-right d-flex justify-content-center" >
                <i class="fa fa-bars text-white m-0 "></i>
                <span class="sr-only">Toggle Menu</span>
            </button>
        </div> 
    </nav>
`;

var AdminSidebar = {
    template: Template,
    data: function() {
        return {
            list: "",
        }
    },
    methods: {
        
    },
    created(){
        /*if(this.loggedUser == "teacher")
            this.getStudents();*/
    }
    
}

Vue.component('AdminSidebar', AdminSidebar)

export default AdminSidebar