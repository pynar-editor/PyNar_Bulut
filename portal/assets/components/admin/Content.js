import AdminSidebar from './Sidebar.js'

const Template = `
    <div class=" p-0 m-0 w-100">
        <AdminSidebar></AdminSidebar>
        <div id="panel" class="main-content">
            <AdminHeader></AdminHeader>
            <div class="mw-100">
                <router-view></router-view>
            </div>
        </div>
    </div>
`;

const AdminContent = {
    template: Template,
    data: function() {
        return {
            test: '',
        }
    }
};


Vue.component('AdminContent', AdminContent)

export default AdminContent;