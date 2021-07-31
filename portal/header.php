<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>PyNar <?php if(!empty($title)) echo " | $title";  ?></title>

        <?php if(!empty($add_preload)) echo $add_preload; ?>

        <base href="<?php echo $_SERVER['REQUEST_SCHEME'].'://'.$_SERVER['HTTP_HOST'].'/portal/' ?>">

        <link rel="icon" type="image/png" href="assets/img/favicon.png">
        <link rel="preconnect" href="assets/lib/font-awesome/webfonts/fa-solid-900.woff2" crossorigin="">
        <link rel="preconnect" href="assets/lib/font-awesome/webfonts/fa-solid-900.woff" crossorigin="">        
        <link rel="preconnect" href="assets/lib/font-awesome/webfonts/fa-solid-900.ttf" crossorigin="">
        
        <!-- CSS Animations -->
        <link type="text/css" rel="stylesheet" href="assets/lib/animate/animate-4.1.1.min.css" />

        <!-- CSS Font Awesome -->
        <link type="text/css" rel="stylesheet" href="assets/lib/font-awesome/css/all-5.15.2.min.css">

        <!-- CSS Main -->
        <link type="text/css" rel="stylesheet" href="assets/css/main.css">

        <!-- CSS Specials -->
        <?php if(!empty($add_css)) echo $add_css; ?>

        
    </head>
    <body class="bg-light overflow-hidden">
