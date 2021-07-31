import Layout from './Layout.js';

import PersonalInformation from './personal/Information.js';

import Assignment from './pages/assignment/Assignment.js';
import File from './pages/file/File.js';

import Announcements from './pages/announcement/index.js';

var routes = [
    { path: '/', component: Assignment },
    { path: '/my', component: PersonalInformation },
    { path: '/assignments', component: Assignment },
    { path: '/assignments/:assignment', component: Assignment },
    { path: '/files', component: File },
    { path: '/files/:file', component: File },
    { path: '/announcements', component: Announcements },
];

const router = new VueRouter({
    mode: 'history',
    routes
})


const App = new Vue({
    el: "#app",
    router: router
}).$mount('#app');

export default App;