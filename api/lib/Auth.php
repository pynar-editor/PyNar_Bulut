<?php 
namespace Lib\Auth {

    use function Lib\UUID\uuidv4;  
    use Lib\Token\JWT; 
    use Lib\HTTP\ErrorResponse;
    use Lib\HTTP\SuccessResponse;
    use Lib\Database\MySQL;
    use \Exception;
    use \PDOException;
    use \DateTime;

    use PHPMailer\PHPMailer\PHPMailer;
    use PHPMailer\PHPMailer\SMTP;

    function isLogin(){
        $headers = apache_request_headers();

        if (empty($headers['Authorization']))
            throw new Exception("Bir yetki başlığı bulunamadı.");

        list($tokenType, $token) = explode(' ', $headers['Authorization']);
        
        if ($tokenType != "Bearer")
            throw new Exception("Jeton türü 'Bearer' olmalıdır.");
        else if (empty($token))
            throw new Exception("Gönderilen doğrulama jetonu istenen formatta değil. Jeton şu formatta olmalıdır: (header.payload.sign).");
        
        
        $decoded = verifyToken($token);

        $auth_file = SESSIONS_DIR.$decoded->user_uuid.'/'.$decoded->mac_address;
        
        if(!file_exists($auth_file))
            throw new Exception("Geçerli cihaza ait bir oturum verisi bulunamadı.");
        
        $file = fopen($auth_file, "r");
        $fetch_token = fgets($file);
        fclose($file);
        
        if ($fetch_token != $token)
            throw new Exception("Gönderilen jeton sunucudaki jeton ile bağdaştırılamadı.");
        
        if (!empty($_POST['mac_address']) && $decoded->mac_address != $_POST['mac_address'])
            throw new Exception("Jeton geçerli cihazdan farklı bir cihazda oluşturulmuş, yeniden giriş yapınız.");

        return $decoded;
    }

    function verifyToken($token){
        
        JWT::$leeway = 60; // gecikme süresi
        $decoded = JWT::decode($token, JWT_SECRET, array('HS512'));
        
        return $decoded;
    }

    function passwordVerify($password){
        $pattern = "/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[-\[\\]\"!'\^\+%&\/\(\)\=\?£#\$\{\}|\\_\*\,;:\.@])(?=.{8,})/i";
        if(!preg_match($pattern, $password))
            throw new Exception("Şifreniz istenen formatta değil. Şifreniz en az 8 karakter, en az bir büyük harf, ". 
            "en az bir küçük harf, en az bir sayı ve en az bir özel karakter içermelidir.");

        return true;
    }

    function isActive($control, $id, $mac_address=NULL){
        if($control != NULL){
            if($control == 1)
                return true;
        }else {
            $db = MySQL::connect();
            $query = "SELECT user_status FROM all_users WHERE id = :id LIMIT 1";
            $prepare = $db->prepare($query);
            $prepare->execute([
                ':id' => $id,
            ]);
            $fetch = $prepare->fetch();
            if(!$fetch)
                throw new Exception("Veri tabanında kullanıcı bulunamadı.");
            else 
                if($fetch['user_status'] == 1)
                    return true;              
            if(!empty($mac_address))
                Logout::Logout($mac_address, false);
        }
        throw new Exception("Kullanıcı kaydınız aktif değil, lütfen yöneticinize başvurunuz."); 
    }

    function getGroup($group_name, $isAdmin = false){
        $groups = [
            'student' => 1,
            'teacher' => 2,            
        ];
        if($isAdmin){
            $groups['manager'] = 4;
            $groups['teacher&manager'] = 6;
            $groups['admin'] = 8;
        }
            
        if(empty($groups[$group_name]))
            return -1;

        return $groups[$group_name];
    }

    function getInfo(){
        try {            
            
            if ((empty($_POST['logging']) || boolval($_POST['logging']) != "false") && empty($_POST['mac_address'])){
                $response = new ErrorResponse(404, "Gerekli bir parametre bulunamadı. Error: Parameter-SYS1");
                $response = $response->createErrorResponse();
                echo json_encode($response, JSON_UNESCAPED_UNICODE);
                return 0;
            }

            $user = isLogin();

            $response = new SuccessResponse($user); 
            $response = $response->createSuccessResponse();
            echo json_encode($response, JSON_UNESCAPED_UNICODE);
        }
        catch(Exception $e){
            $response = new ErrorResponse(500, $e->getMessage()); 
            $response = $response->createErrorResponse();
            echo json_encode($response, JSON_UNESCAPED_UNICODE);
        }
    }

    class Signup {       

        public static function UserSignup(){
            ob_start();

            $db = MySQL::connect();

            passwordVerify($_POST['password']);

            $user_uuid = uuidv4();
            
            $group = getGroup($_POST['group']);
            if($group == -1)
                throw new Exception("Gruplandırma işlemi sırasında bir hata ile karşılaşıldı, lütfen grup değerlerini gözden geçiriniz.");
            
            $mail = new PHPMailer(true); 
            
            $query = "SELECT COUNT(*) as total FROM all_users WHERE email = :email LIMIT 1";
            $prepare = $db->prepare($query);
            $prepare->execute([
                ':email' => $_POST['email'],
            ]);
            $fetch = $prepare->fetch();
            if(!$fetch)
                throw new Exception("Veri tabanıyla ilgili bir sorun oluştu. Lütfen daha sonra tekrar deneyiniz.");
            else if($fetch['total'] == 1)
                throw new Exception("Veri tabanında aynı e-posta ile kayıtlı bir kullanıcı bulunuyor.");

            try {
                //Server settings
                $mail->SMTPDebug = SMTP::DEBUG_SERVER;                      //Enable verbose debug output
                $mail->isSMTP();                                            //Send using SMTP
                $mail->Host       = MAIL_CONFIG['host'];                    //Set the SMTP server to send through
                $mail->SMTPAuth   = true;                                   //Enable SMTP authentication
                $mail->Username   = MAIL_CONFIG['user'];                    //SMTP username
                $mail->Password   = MAIL_CONFIG['pass'];                    //SMTP password
                $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;         //Enable TLS encryption; `PHPMailer::ENCRYPTION_SMTPS` encouraged
                $mail->Port       = 587;                                    //TCP port to connect to, use 465 for `PHPMailer::ENCRYPTION_SMTPS` above
                $mail->CharSet = 'UTF-8';
                $mail->Encoding = 'base64';
                $mail->SetLanguage("tr", "phpmailer/language");

                //Recipients
                $mail->setFrom(MAIL_CONFIG['user'], 'www.pynar.org');

                $mail->addAddress($_POST['email'], $_POST['user_fullname']);

                $date = new DateTime();
                $JWT = JWT::encode([
                    "iss" => "login",
                    "aud" => "/api/user/activate",
                    "iat" => $date->getTimestamp(),
                    'group_id' => $group,
                    'email' => $_POST['email'],
                    'user_fullname' => $_POST['user_fullname'],
                    'user_uuid' => $user_uuid,
                    'password' => password_hash($_POST['password'], PASSWORD_BCRYPT),
                    'exp' => $date->getTimestamp() + 1800, // yarım saat
                ], JWT_SECRET);

                //Content                                              
                $mail->Subject = 'Hesap Onaylama';

                if(isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on')   
                    $url = "https://";   
                else  
                    $url = "http://";   

                $web_address = $url.$_SERVER["HTTP_HOST"];
                
                $mail->Body = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
                <html xmlns="http://www.w3.org/1999/xhtml">
                <head>
                <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
                <!--[if !mso]><!-->
                <meta http-equiv="X-UA-Compatible" content="IE=edge" />
                <!--<![endif]-->
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title></title>
                <style type="text/css">
                * {
                    -webkit-font-smoothing: antialiased;
                }
                body {
                    Margin: 0;
                    padding: 0;
                    min-width: 100%;
                    font-family: Arial, sans-serif;
                    -webkit-font-smoothing: antialiased;
                    mso-line-height-rule: exactly;
                }
                table {
                    border-spacing: 0;
                    color: #333333;
                    font-family: Arial, sans-serif;
                }
                img {
                    border: 0;
                }
                .wrapper {
                    width: 100%;
                    table-layout: fixed;
                    -webkit-text-size-adjust: 100%;
                    -ms-text-size-adjust: 100%;
                }
                .webkit {
                    max-width: 800px;
                }
                .outer {
                    Margin: 0 auto;
                    width: 100%;
                    max-width: 800px;
                }
                .full-width-image img {
                    width: 100%;
                    max-width: 800px;
                    height: auto;
                }
                .inner {
                    padding: 10px;
                }
                p {
                    Margin: 0;
                    padding-bottom: 10px;
                }
                .h1 {
                    font-size: 21px;
                    font-weight: bold;
                    Margin-top: 15px;
                    Margin-bottom: 5px;
                    font-family: Arial, sans-serif;
                    -webkit-font-smoothing: antialiased;
                }
                .h2 {
                    font-size: 18px;
                    font-weight: bold;
                    Margin-top: 10px;
                    Margin-bottom: 5px;
                    font-family: Arial, sans-serif;
                    -webkit-font-smoothing: antialiased;
                }
                .one-column .contents {
                    text-align: left;
                    font-family: Arial, sans-serif;
                    -webkit-font-smoothing: antialiased;
                }
                .one-column p {
                    font-size: 14px;
                    Margin-bottom: 10px;
                    font-family: Arial, sans-serif;
                    -webkit-font-smoothing: antialiased;
                }
                .two-column {
                    text-align: center;
                    font-size: 0;
                }
                .two-column .column {
                    width: 100%;
                    max-width: 300px;
                    display: inline-block;
                    vertical-align: top;
                }
                .contents {
                    width: 100%;
                }
                .two-column .contents {
                    font-size: 14px;
                    text-align: left;
                }
                .two-column img {
                    width: 100%;
                    max-width: 280px;
                    height: auto;
                }
                .two-column .text {
                    padding-top: 10px;
                }
                .three-column {
                    text-align: center;
                    font-size: 0;
                    padding-top: 10px;
                    padding-bottom: 10px;
                }
                .three-column .column {
                    width: 100%;
                    max-width: 200px;
                    display: inline-block;
                    vertical-align: top;
                }
                .three-column .contents {
                    font-size: 14px;
                    text-align: center;
                }
                .three-column img {
                    width: 100%;
                    max-width: 180px;
                    height: auto;
                }
                .three-column .text {
                    padding-top: 10px;
                }
                .img-align-vertical img {
                    display: inline-block;
                    vertical-align: middle;
                }
                @media only screen and (max-device-width: 480px) {
                table[class=hide], img[class=hide], td[class=hide] {
                    display: none !important;
                }
                .contents1 {
                    width: 100%;
                }
                .contents1 {
                    width: 100%;
                }
                </style>
                <!--[if (gte mso 9)|(IE)]>
                    <style type="text/css">
                        table {border-collapse: collapse !important;}
                    </style>
                    <![endif]-->
                </head>
                
                <body style="Margin:0;padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;min-width:100%;background-color:#f3f2f0;">
                <center class="wrapper" style="width:100%;table-layout:fixed;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;background-color:#f3f2f0;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f3f2f0;" bgcolor="#f3f2f0;">
                    <tr>
                      <td width="100%"><div class="webkit" style="max-width:800px;Margin:0 auto;"> 
                          
                          <!--[if (gte mso 9)|(IE)]>
                
                                        <table width="800" align="center" cellpadding="0" cellspacing="0" border="0" style="border-spacing:0" >
                                            <tr>
                                                <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;" >
                                                <![endif]--> 
                          
                          <!-- ======= start main body ======= -->
                          <table class="outer" align="center" cellpadding="0" cellspacing="0" border="0" style="border-spacing:0;Margin:0 auto;width:100%;max-width:800px;">
                            <tr>
                              <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;"><!-- ======= start header ======= -->
                                
                                <table border="0" width="100%" cellpadding="0" cellspacing="0"  >
                                  <tr>
                                    <td><table style="width:100%;" cellpadding="0" cellspacing="0" border="0">
                                        <tbody>
                                          <tr>
                                            <td align="center"><center>
                                                <table border="0" align="center" width="100%" cellpadding="0" cellspacing="0" style="Margin: 0 auto;">
                                                  <tbody>
                                                    <tr>
                                                      <td class="one-column" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;"><table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-spacing:0">
                                                          <tr>
                                                            <td>&nbsp;</td>
                                                          </tr>
                                                        </table></td>
                                                    </tr>
                                                  </tbody>
                                                </table>
                                              </center></td>
                                          </tr>
                                        </tbody>
                                      </table></td>
                                  </tr>
                                </table>
                                <table border="0" width="100%" cellpadding="0" cellspacing="0"  >
                                  <tr>
                                    <td><table style="width:100%;" cellpadding="0" cellspacing="0" border="0">
                                        <tbody>
                                          <tr>
                                            <td align="center"><center>
                                                <table border="0" align="center" width="100%" cellpadding="0" cellspacing="0" style="Margin: 0 auto;">
                                                  <tbody>
                                                    <tr>
                                                      <td class="one-column" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;" bgcolor="#FFFFFF"><!-- ======= start header ======= -->
                                                        
                                                        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-left:1px solid #e8e7e5; border-right:1px solid #e8e7e5; border-top:1px solid #e8e7e5">
                                                          <tr>
                                                            <td>&nbsp;</td>
                                                          </tr>
                                                          <tr>
                                                            <td>&nbsp;</td>
                                                          </tr>
                                                          <tr>
                                                            <td class="two-column" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;text-align:center;font-size:0;" ><!--[if (gte mso 9)|(IE)]>
                                                                    <table width="100%" style="border-spacing:0" >
                                                                    <tr>
                                                                    <td width="20%" valign="top" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:30px;" >
                                                                    <![endif]-->
                                                              
                                                              <div class="column" style="width:100%;max-width:220px;display:inline-block;vertical-align:top;">
                                                                <table class="contents" style="border-spacing:0; width:100%"  >
                                                                  <tr>
                                                                    <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0px;" align="left"><a href="#" target="_blank"><img src="' . $web_address . '/portal/assets/img/logo.png" alt="logo" width="108" height="54" style="border-width:0; max-width:60px;height:auto; display:block" align="left"/></a></td>
                                                                  </tr>
                                                                </table>
                                                              </div>
                                                              
                                                              <!--[if (gte mso 9)|(IE)]>
                                                                    </td><td width="80%" valign="top" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;" >
                                                                    <![endif]-->
                                                              
                                                              <div class="column" style="width:100%;max-width:515px;display:inline-block;vertical-align:top;">
                                                                <table width="100%" style="border-spacing:0">
                                                                  <tr>
                                                                    <td class="inner" style="padding-top:0px;padding-bottom:10px; padding-right:10px;padding-left:10px;"><table class="contents" style="border-spacing:0; width:100%" bgcolor="#FFFFFF">
                                                                        <tr>
                                                                          <td width="57%" align="right" valign="top"></td>
                                                                          <td width="43%" align="left" valign="top"></td>
                                                                        </tr>
                                                                      </table></td>
                                                                  </tr>
                                                                </table>
                                                              </div>
                                                              
                                                              <!--[if (gte mso 9)|(IE)]>
                                                                    </td>
                                                                    </tr>
                                                                    </table>
                                                                    <![endif]--></td>
                                                          </tr>
                                                          <tr>
                                                            <td height="80">&nbsp;</td>
                                                          </tr>
                                                        </table></td>
                                                    </tr>
                                                  </tbody>
                                                </table>
                                              </center></td>
                                          </tr>
                                        </tbody>
                                      </table></td>
                                  </tr>
                                </table>
                                
                                <!-- ======= end header ======= --> 
                                
                                <!-- ======= start hero image ======= --><!-- ======= end hero image ======= --> 
                                
                                <!-- ======= start hero article ======= -->
                                
                                <table class="one-column" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-spacing:0; border-left:1px solid #e8e7e5; border-right:1px solid #e8e7e5; border-bottom:1px solid #e8e7e5" bgcolor="#FFFFFF">
                                  <tr>
                                    <td align="left" style="padding:0px 40px 40px 40px"><p style="color:#262626; font-size:32px; text-align:left; font-family: Verdana, Geneva, sans-serif">Merhaba ' . $_POST['user_fullname'] . ',</p>
                                      <p style="color:#000000; font-size:16px; text-align:left; font-family: Verdana, Geneva, sans-serif; line-height:22px ">PyNar sistemine kaydolabilmek için aşağıdaki linke tıklayınız.<br />
                                        Eğer ki bu mailin size yanlışlıkla geldiğini düşünüyorsanız, dikkate almayınız. 
                                        <br />
                                        <br />
                                        <br />
                                        <a target="_blank" href="' . $web_address . '/portal?t='.$JWT.'&m='.$_POST['email'].'&g='.$_POST['group'].'&e=activation" style="padding: 15px;border: none;font-size: 16px;color: white;background-color: #add33c;text-decoration: none">
                                            Kaydı Tamamla
                                        </a>
                                        <br />
                                        <br />
                                        <br />
                                        Sevgilerimizle, <br />
                                        PyNar Ekibi</p></td>
                                  </tr>
                                </table>
                                
                                <!-- ======= end hero article ======= --> 
                                
                                <!-- ======= start footer ======= -->
                                
                                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                  <tr>
                                    <td height="30">&nbsp;</td>
                                  </tr>
                                  <tr>
                                    <td class="two-column" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;text-align:center;font-size:0;"><!--[if (gte mso 9)|(IE)]>
                                                                    <table width="100%" style="border-spacing:0" >
                                                                    <tr>
                                                                    <td width="50%" valign="top" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;" >
                                                                    <![endif]-->
                                      
                                      <div class="column" style="width:100%;max-width:399px;display:inline-block;vertical-align:top;">
                                        <table class="contents" style="border-spacing:0; width:100%">
                                          <tr>
                                            <td width="39%" align="right" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;"><a href="' . $web_address . '" target="_blank"><img src="' . $web_address . '/portal/assets/img/favicon.png" alt="favicon" title="favicon" width="59" height="59" style="border-width:0; max-width:59px;height:auto; display:block; padding-right:20px" /></a></td>
                                            <td width="61%" align="left" valign="middle" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;"><p style="color:#787777; font-size:13px; text-align:left; font-family: Verdana, Geneva, sans-serif"> PyNar &copy; ' . date("Y") . '<br />
                                                PyNar Editör <a href="' . $web_address . '/tr/gelistirenler/genel-kamu-lisansi-gpl-v3"><strong>GPL V3</strong></a> Lisansı ile dağıtılan bir özgür yazılımdır.<br />
                                                <a href="' . $web_address . '">www.pynar.org</a></p></td>
                                          </tr>
                                        </table>
                                      </div>
                                      
                                      <!--[if (gte mso 9)|(IE)]>
                                                                    </td><td width="50%" valign="top" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;" >
                                                                    <![endif]-->
                                      
                                      <div class="column" style="width:100%;max-width:399px;display:inline-block;vertical-align:top;">
                                        <table width="100%" style="border-spacing:0">
                                          <tr>
                                            <td class="inner" style="padding-top:0px;padding-bottom:10px; padding-right:10px;padding-left:10px;"><table class="contents" style="border-spacing:0; width:100%">
                                                <tr>
                                                  <td width="32%" align="center" valign="top" style="padding-top:10px"><table width="150" border="0" cellspacing="0" cellpadding="0">
                                                      <tr>
                                                        <td width="33" align="center"></td>
                                                        <td width="34" align="center"></td>
                                                        <td width="33" align="center"><a href="' . $web_address . '" target="_blank"><img src="' . $web_address . '/portal/assets/img/mail/link.png" alt="logo" width="36" height="36" border="0" style="border-width:0; max-width:36px;height:auto; display:block; max-height:36px"/></a></td>
                                                      </tr>
                                                    </table></td>
                                                </tr>
                                              </table></td>
                                          </tr>
                                        </table>
                                      </div>
                                      
                                      <!--[if (gte mso 9)|(IE)]>
                                        </td>
                                        </tr>
                                        </table>
                                      <![endif]--></td>
                                  </tr>
                                  <tr>
                                    <td height="30">&nbsp;</td>
                                  </tr>
                                </table>
                                
                                <!-- ======= end footer ======= --></td>
                            </tr>
                          </table>
                          <!--[if (gte mso 9)|(IE)]>
                                    </td>
                                </tr>
                            </table>
                            <![endif]--> 
                        </div></td>
                    </tr>
                  </table>
                </center>
                </body>
                </html>';
                $mail->isHTML(true);  

                $mail->send();
            } catch (Exception $e) {
                throw new Exception($mail->ErrorInfo);
            }
            ob_end_clean();
            $response = new SuccessResponse(['message' => 'Başarılı! E-postanıza gönderilen onay linkine tıklayarak kaydınızı tamamlayabilirsiniz.']); 
            $response = $response->createSuccessResponse();
            echo json_encode($response, JSON_UNESCAPED_UNICODE);
        }

        public static function Controller(){
                      
            try {
                if($_SERVER['REQUEST_METHOD'] != 'POST'){
                    $response = new ErrorResponse(405);
                    $response = $response->createErrorResponse();
                    echo json_encode($response, JSON_UNESCAPED_UNICODE);
                } else if(empty($_POST['email'])){
                    $response = new ErrorResponse(404, "'email' parametresi gereklidir.");
                    $response = $response->createErrorResponse();
                    echo json_encode($response, JSON_UNESCAPED_UNICODE);
                } else if (empty($_POST['password'])){
                    $response = new ErrorResponse(404, "'password' parametresi gereklidir.");
                    $response = $response->createErrorResponse();
                    echo json_encode($response, JSON_UNESCAPED_UNICODE);
                } else if (empty($_POST['user_fullname'])){
                    $response = new ErrorResponse(404, "'user_fullname' parametresi gereklidir.");
                    $response = $response->createErrorResponse();
                    echo json_encode($response, JSON_UNESCAPED_UNICODE);
                } else if (empty($_POST['group'])){
                    $response = new ErrorResponse(404, "'group' parametresi gereklidir.");
                    $response = $response->createErrorResponse();
                    echo json_encode($response, JSON_UNESCAPED_UNICODE);
                } else if (!filter_var($_POST['email'], FILTER_VALIDATE_EMAIL)){
                    $response = new ErrorResponse(404, "'email' parametresi beklenen formatta değil. Format: email@example.com.");
                    $response = $response->createErrorResponse();
                    echo json_encode($response, JSON_UNESCAPED_UNICODE);
                }
                else
                    self::UserSignup();
                    
            }
            catch (PDOException $e) {
                $msg = $e->getMessage();
                if ($e->errorInfo[1] == 1062)
                    $msg = "Geçerli email ile veritabanında kayıtlı bir kullanıcı bulunuyor."; 
                 
                $response = new ErrorResponse(500, $msg); 
                $response = $response->createErrorResponse();
                echo json_encode($response, JSON_UNESCAPED_UNICODE);
            }
            catch(Exception $e){
                $response = new ErrorResponse(500, $e->getMessage()); 
                $response = $response->createErrorResponse();
                echo json_encode($response, JSON_UNESCAPED_UNICODE);
            }
        }
    }

    class Login {
        
        public static function Controller($isAdmin = false){
            
            try {
                if($_SERVER['REQUEST_METHOD'] != 'POST'){
                    $response = new ErrorResponse(405);
                    $response = $response->createErrorResponse();
                    echo json_encode($response, JSON_UNESCAPED_UNICODE);
                } else if(empty($_POST['email'])){
                    $response = new ErrorResponse(404, "'email' parametresi gereklidir.");
                    $response = $response->createErrorResponse();
                    echo json_encode($response, JSON_UNESCAPED_UNICODE);
                } else if (empty($_POST['password'])){
                    $response = new ErrorResponse(404, "'password' parametresi gereklidir.");
                    $response = $response->createErrorResponse();
                    echo json_encode($response, JSON_UNESCAPED_UNICODE);
                } else if (empty($_POST['group'])){
                    $response = new ErrorResponse(404, "'group' parametresi gereklidir.");
                    $response = $response->createErrorResponse();
                    echo json_encode($response, JSON_UNESCAPED_UNICODE);
                } else if (!filter_var($_POST['email'], FILTER_VALIDATE_EMAIL)){
                    $response = new ErrorResponse(404, "'email' parametresi beklenen formatta değil. Format: email@example.com.");
                    $response = $response->createErrorResponse();
                    echo json_encode($response, JSON_UNESCAPED_UNICODE);
                } else if (empty($_POST['logging']) || $_POST['logging'] != "false")
                    if (empty($_POST['mac_address'])){
                        $response = new ErrorResponse(404, "Gerekli bir parametre bulunamadı. Error: Parameter-SYS1");
                        $response = $response->createErrorResponse();
                        echo json_encode($response, JSON_UNESCAPED_UNICODE);
                    } else if (empty($_POST['network_name'])){
                        $response = new ErrorResponse(404, "Gerekli bir parametre bulunamadı. Error: Parameter-SYS2");
                        $response = $response->createErrorResponse();
                        echo json_encode($response, JSON_UNESCAPED_UNICODE);
                    } else if (empty($_POST['os_name'])){
                        $response = new ErrorResponse(404, "Gerekli bir parametre bulunamadı. Error: Parameter-SYS3");
                        $response = $response->createErrorResponse();
                        echo json_encode($response, JSON_UNESCAPED_UNICODE);
                    } else if (empty($_POST['os_version'])){
                        $response = new ErrorResponse(404, "Gerekli bir parametre bulunamadı. Error: Parameter-SYS4");
                        $response = $response->createErrorResponse();
                        echo json_encode($response, JSON_UNESCAPED_UNICODE);
                    } else
                        self::UserLogin();
                else if($isAdmin)
                    self::UserLogin(false, true);
                else
                    self::UserLogin(false);
            }
            catch(Exception $e){
                $response = new ErrorResponse(500, $e->getMessage()); 
                $response = $response->createErrorResponse();
                echo json_encode($response, JSON_UNESCAPED_UNICODE);
            }
        }

        public static function UserLogin($logging=true, $isAdmin = false){
            
            $db = MySQL::connect();

            $views = [
                'student' => 'active_students',
                'teacher' => 'active_teachers',
                'manager_admin' => 'active_managers_admins',
            ];

            if($isAdmin)
                $views['admin'] = 'all_active_users';

            $view = $views[$_POST['group']];

            if(empty($views[$_POST['group']]))
                throw new Exception("Geçerli bir grup bulunamadı.");          

            $query = "SELECT id, group_id, user_uuid, user_fullname, password, user_status, is_inited FROM $view WHERE email = :email LIMIT 1";
            $prepare = $db->prepare($query);
            $prepare->execute([
                ':email' => $_POST['email'],
            ]);
            $fetch = $prepare->fetch();
            if(!$fetch)
                throw new Exception("Veri tabanında kullanıcı bulunamadı. Kullanıcı aktif halde olmayabilir.");
            else {
                if(!password_verify($_POST['password'], $fetch['password'])){
                    $response = new ErrorResponse(401, 'Kullanıcı adı veya şifre yanlış.'); 
                    $response = $response->createErrorResponse();
                    echo json_encode($response, JSON_UNESCAPED_UNICODE);
                    return -1;
                }

                $active = isActive($fetch['user_status'], -1);

                $mac_address = NO_LOGGING_SESSION_FILE;

                if($logging){
                    // USER_LOGS__LOGIN prosedürü çağırılıyor
                    $query = "CALL USER_LOGS__LOGIN(:user_id, :mac_address, :network_name, :os_name, :os_version, :process_name)"; 
                    $prepare = $db->prepare($query);
                    $prepare->execute([
                        ':user_id' => $fetch['id'],                     
                        ':mac_address' => $_POST['mac_address'],
                        ':network_name' => $_POST['network_name'],
                        ':os_name' => $_POST['os_name'],
                        ':os_version' => $_POST['os_version'],
                        ':process_name' => 'Login'
                    ]);
                    if(!$prepare)
                        throw new Exception("Giriş yapılamadı, veriler günlüğe kaydedilemiyor. Sistem yöneticinize başvurunuz.");
                    
                    $mac_address = $_POST['mac_address'];
                }

                $db = MySQL::connect();
            
                $query = "UPDATE users SET is_inited = :is_inited WHERE id = :user_id LIMIT 1";
                $prepare = $db->prepare($query);
                $prepare->execute([
                    ':user_id' => $fetch['id'],
                    ':is_inited' => 1
                ]);

                $date = new DateTime();
                $JWT = JWT::encode([
                    "iss" => "login",
                    "aud" => "/api/user/login",
                    "iat" => $date->getTimestamp(),
                    "nbf" => $date->getTimestamp() - 3600*24, 
                    'id' => $fetch['id'],
                    'group_id' => $fetch['group_id'],
                    'user_uuid' => $fetch['user_uuid'],
                    'user_fullname' => $fetch['user_fullname'],
                    'mac_address' => $mac_address,
                    'exp' => $date->getTimestamp() + 3600*24, // bir günlük key
                ], JWT_SECRET);
                
                                  
                if(!file_exists(SESSIONS_DIR.$fetch['user_uuid']))
                    mkdir(SESSIONS_DIR.$fetch['user_uuid'], 0700);

                $auth_file = fopen(SESSIONS_DIR.$fetch['user_uuid'].'/'.$mac_address, "w+");
                fwrite($auth_file, $JWT);
                fclose($auth_file);
                
                $response = new SuccessResponse([
                    'message' => 'Kullanıcı girişi başarılı.',
                    'token' => $JWT,
                    'user_fullname' => $fetch['user_fullname'],
                    'is_inited' => $fetch['is_inited'],
                ]);
                $response = $response->createSuccessResponse();
                echo json_encode($response, JSON_UNESCAPED_UNICODE);
            }
        }

    }

    class Logout{

        public static function Logout($mac_address=NULL, $isResponseRequire=NULL){
            
            $user = isLogin();
            if(empty($mac_address))
                $mac_address = $_POST['mac_address'];
            
            if(empty($_POST['logging']) || $_POST['logging'] != "false"){
                $db = MySQL::connect();
                $query = "INSERT INTO log_users (user_id, mac_address, process_name) VALUES (:user_id, :mac_address, :process_name)"; 
                $prepare = $db->prepare($query);
                $prepare->execute([
                    ':user_id' => $user->id,
                    ':mac_address' => $mac_address,
                    ':process_name' => 'Logout'
                ]);
    
                if(empty($isResponseRequire) && !$prepare)
                    throw new Exception("Çıkış yapılamadı, veriler günlüğe kaydedilemiyor. Sistem yöneticinize başvurunuz.");

            }
            else
                $mac_address = NO_LOGGING_SESSION_FILE;

            $auth_file = SESSIONS_DIR.$user->user_uuid.'/'.$mac_address;
            if (file_exists($auth_file) && !unlink($auth_file) && empty($isResponseRequire)) 
                throw new Exception("Çıkış yapılamadı, oturum verileri silinemiyor.");  
            
            if(empty($isResponseRequire)){
                $response = new SuccessResponse(['message' => 'Çıkış başarılı.']); 
                $response = $response->createSuccessResponse();
                echo json_encode($response, JSON_UNESCAPED_UNICODE);
            }
        }

        public static function Controller(){
            
            try {
                if($_SERVER['REQUEST_METHOD'] != 'POST'){
                    $response = new ErrorResponse(405);
                    $response = $response->createErrorResponse();
                    echo json_encode($response, JSON_UNESCAPED_UNICODE);
                } else if (empty($_POST['logging']) || $_POST['logging'] != "false"){
                    if (empty($_POST['mac_address'])){
                        $response = new ErrorResponse(404, "Gerekli bir parametre bulunamadı. Error: Parameter-SYS1");
                        $response = $response->createErrorResponse();
                        echo json_encode($response, JSON_UNESCAPED_UNICODE);
                    }
                    else
                        self::Logout();
                }           
                else
                    self::Logout();
            }
            catch(Exception $e){
                $response = new ErrorResponse(500, $e->getMessage()); 
                $response = $response->createErrorResponse();
                echo json_encode($response, JSON_UNESCAPED_UNICODE);
            }

        }
    }

    class Activation {
        public static function Activate(){       
                
            $decoded = verifyToken($_POST['token']);

            $db = MySQL::connect();

            $query = "SELECT COUNT(*) as total FROM all_users WHERE email = :email LIMIT 1";
            $prepare = $db->prepare($query);
            $prepare->execute([
                ':email' => $decoded->email,
            ]);
            $fetch = $prepare->fetch();
            
            if(!$fetch)
                throw new Exception("Veri tabanıyla ilgili bir sorun oluştu. Lütfen daha sonra tekrar deneyiniz.");
            else if($fetch['total'] == 1)
                throw new Exception("E-mail aktivasyonu daha önceden gerçekleştirilmiş.");

            $query = "INSERT INTO users (group_id, user_uuid, user_fullname, email, password, user_status) VALUES (:group_id, :user_uuid, :user_fullname, :email, :password, :user_status)";
            $prepare = $db->prepare($query);
            $prepare = $prepare->execute([
                ':group_id' => $decoded->group_id,
                ':user_uuid' => $decoded->user_uuid,
                ':user_fullname' => $decoded->user_fullname,
                ':email' => $decoded->email,
                ':password' => $decoded->password,
                ':user_status' => $decoded->group_id == 1 ? 1 : 0
            ]);

            if(!$prepare)
                throw new Exception("Kullanıcı kaydedilirken bir sunucu hatasıyla karşılaşıldı.");                      

            if(!file_exists(UPLOADS_DIR.$decoded->user_uuid))
                mkdir(UPLOADS_DIR.$decoded->user_uuid, 0700);
            if(!file_exists(SESSIONS_DIR.$decoded->user_uuid))
                mkdir(SESSIONS_DIR.$decoded->user_uuid, 0700);

            $response = new SuccessResponse(['message' => 'Bilgileriniz sisteme başarıyla kaydedildi!']); 
            $response = $response->createSuccessResponse();
            echo json_encode($response, JSON_UNESCAPED_UNICODE);
        }

        public static function Controller(){
            
            try {
                if($_SERVER['REQUEST_METHOD'] != 'POST'){
                    $response = new ErrorResponse(405);
                    $response = $response->createErrorResponse();
                    echo json_encode($response, JSON_UNESCAPED_UNICODE);
                } else if (empty($_POST['token'])){
                    $response = new ErrorResponse(404, "'token' parametresi gereklidir.");
                    $response = $response->createErrorResponse();
                    echo json_encode($response, JSON_UNESCAPED_UNICODE);
                }           
                else
                    self::Activate();
            }
            catch(Exception $e){
                $response = new ErrorResponse(500, $e->getMessage()); 
                $response = $response->createErrorResponse();
                echo json_encode($response, JSON_UNESCAPED_UNICODE);
            }

        }
    }
 
}
