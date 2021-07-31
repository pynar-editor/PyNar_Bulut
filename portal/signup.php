<?php

    $add_css = '
        <link type="text/css" rel="stylesheet" href="assets/css/login.css">
        <link type="text/css" rel="stylesheet" href="assets/css/login-bootstrap.css">
        ';

    $add_js = '<script type="module" type="text/javascript" src="assets/components/auth/Signup.js"></script>';
            
    $title = "Kayıt Ol";

    require_once('header.php');
?>

    <div class="loader-container bg-white text-light w-100 h-100 fixed-top d-flex z-index-9999 align-items-center">
        <div class="loader text-dark"></div>
    </div>
    <div id="overlay" class="w-100 h-100 position-fixed top-0">
        <div class="d-flex justify-content-center align-items-center w-100 h-100">
            <i class="fas fa-cog fa-spin fa-5x fast-animation text-primary"></i>
        </div>
    </div>

    <div id="app">
        <component is="Signup"></component>
    </div>

<?php require_once('footer.php'); ?>