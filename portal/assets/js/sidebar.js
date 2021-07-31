document.querySelector('#sidebarCollapse').addEventListener("click", function(event) {

    document.querySelector('.sidebar').classList.toggle('sidebar-show');
    document.body.classList.toggle('overflow-hidden-sidebar');
    document.querySelector('#sidebarCollapseContainer').classList.toggle('show');
});

document.querySelector('#sidebarCollapseContainer').addEventListener("click", function(event) {

    document.querySelector('.sidebar').classList.toggle('sidebar-show');
    document.body.classList.toggle('overflow-hidden-sidebar');
    this.classList.toggle('show');

});