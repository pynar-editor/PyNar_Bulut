<?php 

    function Login(){

        if(empty($_COOKIE['admin_token']))
            return false;
        $data = array(
            'mac_address' => '__no-logging'
        );

        $options = array( 
            'http' => array( 
                'ignore_errors' => true,
                'method' => 'POST',
                'header' => 
                    "Content-Type: application/x-www-form-urlencoded\r\n".
                    'Authorization: Bearer ' . $_COOKIE['admin_token'] . "\n",
                'content' => http_build_query($data)
            ) 
        );

        $stream = stream_context_create($options); 

        $res = file_get_contents('http://localhost/api/user/info', false, $stream); 
        return json_decode($res);

    }

    $res = Login();
    
    if (!$res || !$res->ok){
        $component = '<component is="PanelLogin"></component>';

        $add_css = '
                <link type="text/css" rel="stylesheet" href="assets/css/login.css">
                <link type="text/css" rel="stylesheet" href="assets/css/login-bootstrap.css">
                ';

        $add_js = '<script type="module" type="text/javascript" src="assets/components/auth/PanelLogin.js"></script>';

        $title = "Login";
    }
    else {
        $component = '<component is="AdminLayout"></component>';

        $add_css = '
                <link type="text/css" rel="stylesheet" href="assets/css/panel-bootstrap.css">
                <link type="text/css" rel="stylesheet" href="assets/lib/codemirror/codemirror.min.css">
                <link type="text/css" rel="stylesheet" href="assets/lib/jquery/dataTables.bootstrap5.min.css">
                <link type="text/css" rel="stylesheet" href="assets/lib/jquery/select2.min.css" />';
        
        $add_js = '<script type="module" type="text/javascript" src="assets/components/AdminApp.js"></script>';
        $title = "Panel";
    }

?>
<html>

    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
        <meta name="description" content="Start your development with a Dashboard for Bootstrap 4.">
        <meta name="author" content="Creative Tim">
        <base href="<?php echo $_SERVER['REQUEST_SCHEME'].'://'.$_SERVER['HTTP_HOST'].'/portal/' ?>">

        <title>Pynar Admin</title>
        <!-- Favicon -->
        <link rel="icon" type="image/png" href="assets/img/favicon.png">
        <!-- Fonts -->
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,600,700">
        <!-- Icons -->
        <link rel="stylesheet" href="assets/admin/vendor/nucleo/css/nucleo.css" type="text/css">
        <link rel="stylesheet" href="assets/admin/vendor/@fortawesome/fontawesome-free/css/all.min.css" type="text/css">
        <!-- Page plugins -->
        <!-- Argon CSS -->
        <link type="text/css" rel="stylesheet" href="assets/css/login-bootstrap.css">
        <link rel="stylesheet" href="assets/admin/css/argon.css?v=1.2.0" type="text/css">
        <!-- CSS Main -->
        <link type="text/css" rel="stylesheet" href="assets/css/main.css">
        <link type="text/css" rel="stylesheet" href="assets/lib/jquery/dataTables.bootstrap5.min.css">
        <link type="text/css" rel="stylesheet" href="assets/lib/jquery/select2.min.css" />
        <link type="text/css" rel="stylesheet" href="assets/lib/codemirror/codemirror.min.css">
    </head>

    <body class="overflow-hidden">


        <div class="loader-container bg-white text-light w-100 h-100 fixed-top d-flex justify-content-center z-index-9999 align-items-center">
            <div class="spinner-grow text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
        <div id="overlay" class="w-100 h-100 position-fixed top-0">
            <div class="d-flex justify-content-center align-items-center w-100 h-100">
                <div class="spinner-grow text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        </div>
        <div id="app">
            <?php echo $component; ?>
        </div>
        
        
        <script src="assets/admin/vendor/jquery/dist/jquery.min.js"></script>
        <script src="assets/admin/vendor/bootstrap/dist/js/bootstrap.bundle.min.js"></script>
        <script src="assets/admin/vendor/js-cookie/js.cookie.js"></script>
        <script src="assets/admin/vendor/jquery.scrollbar/jquery.scrollbar.min.js"></script>
        <script src="assets/admin/vendor/jquery-scroll-lock/dist/jquery-scrollLock.min.js"></script>
        <!-- Optional JS -->
        <script src="assets/admin/vendor/chart.js/dist/Chart.min.js"></script>
        <script src="assets/admin/vendor/chart.js/dist/Chart.extension.js"></script>
        <!-- Argon JS -->
        <script src="assets/admin/js/argon.js?v=1.2.0"></script>

        <script type="text/javascript" src="assets/lib/jquery/jquery-3.5.1.min.js"></script>
        
        <!-- JS Font Awesome -->
        <script type="text/javascript" defer src="assets/lib/font-awesome/js/fontawesome.min.js"></script>

        <!-- JS Bootstrap -->
        <script type="text/javascript" src="assets/lib/bootstrap/bootstrap-5.0.0-beta1.bundle.min.js"></script>


        <script type="text/javascript" src="assets/lib/vue/vue-2.6.12.min.js"></script>
        <script type="text/javascript" src="assets/lib/vue/vue-router-3.5.1.min.js"></script>

        <!-- JS Main -->
        <script type="module" type="text/javascript" src="assets/js/main.js"></script>
        <!-- JS Bootstrap -->
        <script type="text/javascript" src="assets/lib/bootstrap/bootstrap-5.0.0-beta1.bundle.min.js"></script>


        <?php echo $add_js; ?>

        <!-- JS Necessaries -->
        <script type="module" type="text/javascript" src="assets/js/loader.js"></script>
        <script type="module" type="text/javascript" src="assets/js/forms.js"></script>
    </body>
</html>