import Sidebar from './Sidebar.js'

const Template = `
    <div class="container p-0 m-0 d-flex mw-100">
        <Sidebar></Sidebar>
        <div class="p-md-5 p-3 w-100 overflow-hidden">   
            <router-view></router-view>
        </div>
    </div>
`;

const Content = {
    template: Template,
    data: function() {
        return {
            test: '',
        }
    }
};


Vue.component('Content', Content)

export default Content;