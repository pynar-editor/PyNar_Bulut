<?php
    
    if(!empty($_GET['who']) && ($_GET['who'] == 'teacher' || $_GET['who'] == 'student'))
        setcookie("forceLogin", $_GET['who']);
     
    function Login(){
        if(empty($_COOKIE['token']))
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
                    'Authorization: Bearer ' . $_COOKIE['token'] . "\n",
                'content' => http_build_query($data)
            ) 
        );

        $stream = stream_context_create($options); 
        
        $res = file_get_contents('http://localhost/api/user/info', false, $stream); 
        return json_decode($res);
    }

    $res = empty($_GET['e']) ? Login() : false;
    
    if (!$res || !$res->ok){
        $component = '<component is="Login"></component>';

        $add_preload = '
                <link rel="preload" as="image" href="assets/img/student-login.jpeg" />
                <link rel="preload" as="image" href="assets/img/teacher-login.jpeg" />
                <link rel="preload" as="image" href="assets/img/login-abstract.jpg" />
                ';

        $add_css = '
                <link type="text/css" rel="stylesheet" href="assets/css/login.css">
                <link type="text/css" rel="stylesheet" href="assets/css/login-bootstrap.css">
                ';

        $add_js = '<script type="module" type="text/javascript" src="assets/components/auth/Login.js"></script>';

        $title = "Login";
    }
    else {
        $component = '<component is="Layout"></component>';

        $add_css = '
                <link type="text/css" rel="stylesheet" href="assets/css/panel-bootstrap.css">
                <link type="text/css" rel="stylesheet" href="assets/lib/codemirror/codemirror.min.css">
                <link type="text/css" rel="stylesheet" href="assets/lib/jquery/dataTables.bootstrap5.min.css">
                <link type="text/css" rel="stylesheet" href="assets/lib/jquery/select2.min.css" />';

        $add_js = '
                <script type="module" type="text/javascript" src="assets/components/' . ucfirst($_COOKIE['loggedUser']) . 'App.js"></script>
                <script type="module" type="text/javascript" src="assets/js/sidebar.js"></script>';
                
        $title = "Portal";
    }

    require_once('header.php');
?>

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

<?php require_once('footer.php'); ?>