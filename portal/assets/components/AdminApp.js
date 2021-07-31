import Layout from './admin/Layout.js';

import AdminHome from './pages/admin/index.js';

import AdminStudents from './pages/admin/student/index.js';
import AdminStudent from './pages/admin/student/Student.js';
import AdminStudentAdd from './pages/admin/student/Add.js';

import AdminTeachers from './pages/admin/teacher/index.js';
import AdminTeacher from './pages/admin/teacher/Teacher.js';
import AdminTeacherAdd from './pages/admin/teacher/Add.js';

var routes = [
    { path: '/admin', component: AdminHome },
    { path: '/admin/students', component: AdminStudents },
    { path: '/admin/students/add', component: AdminStudentAdd },
    { path: '/admin/students/:student', component: AdminStudent },
    { path: '/admin/teachers', component: AdminTeachers },
    { path: '/admin/teachers/add', component: AdminTeacherAdd },
    { path: '/admin/teachers/:teacher', component: AdminTeacher },

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