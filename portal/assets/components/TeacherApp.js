import Layout from './Layout.js';

import Home from './pages/index.js';

import PersonalInformation from './personal/Information.js';

import Students from './pages/student/index.js';
import Announcements from './pages/announcement/index.js';
import Student from './pages/student/Student.js';

var routes = [
    { path: '/(teacher)*', component: Home },
    { path: 'defaultview', name: 'defaultview', component: Home },
    { path: '/my', component: PersonalInformation },
    { path: '/students/:institution/:class/:branch', component: Students },
    { path: '/students/:student', component: Student },
    { path: '/students/:student/:assignment', component: Student },
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