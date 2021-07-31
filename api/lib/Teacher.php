<?php

namespace Lib\Teacher {

  use function Lib\UUID\uuidv4;
  use function Lib\Auth\isLogin;
  use function Lib\Auth\isActive;
  use function Lib\Auth\verifyToken;
  use \PDO;

  use DateTime;
  use Lib\File\Download;
  use Lib\Token\JWT;
  use Lib\HTTP\ErrorResponse;
  use Lib\HTTP\SuccessResponse;
  use Lib\Database\MySQL;
  use \Exception;

  use PHPMailer\PHPMailer\PHPMailer;
  use PHPMailer\PHPMailer\SMTP;

  function isTeacher()
  {
    $user = isLogin();
    $active = isActive(NULL, $user->id, $user->mac_address);

    if ($user->group_id != 2 && $user->group_id != 6)
      throw new Exception("Yalnızca öğretmen yetkilerine sahip kullanıcılar bu işlemi gerçekleştirebilir.");

    return $user;
  }

  class Announcement
  {

    public static function Controller($limit = 5)
    {
      try {
        if ($_SERVER['REQUEST_METHOD'] != 'POST') {
          $response = new ErrorResponse(405);
          $response = $response->createErrorResponse();
          echo json_encode($response, JSON_UNESCAPED_UNICODE);
        } else
          self::getAnnouncements($limit);
      } catch (Exception $e) {
        $response = new ErrorResponse(500, $e->getMessage());
        $response = $response->createErrorResponse();
        echo json_encode($response, JSON_UNESCAPED_UNICODE);
      }
    }

    public static function getAnnouncements($limit)
    {
      $user = isTeacher();

      $db = MySQL::connect();

      $query = "SELECT COUNT(*) as total FROM assignments WHERE (assignments.comment = NULL OR assignments.comment = '' OR assignments.grade = '' OR assignments.grade = NULL) AND assignments.teacher_id = :teacher_id";
      $prepare = $db->prepare($query);
      $prepare->execute([
        ':teacher_id' => $user->id
      ]);
      $fetch = $prepare->fetch(PDO::FETCH_ASSOC);
      if (!$fetch)
        throw new Exception("Uzak sunucuyla ilgili bir sorun oluştu.");

      $query = "SELECT assignments.id, all_students.user_fullname, all_students.user_uuid, log_files.file_name, institutions.institution_name, assignments.created_date as date FROM assignments 
                RIGHT JOIN log_files ON log_files.id = assignments.file_log_id
                RIGHT JOIN all_students ON all_students.id = assignments.student_id
                RIGHT JOIN users_bind_institutions ON users_bind_institutions.user_id = all_students.id
                RIGHT JOIN institutions ON institutions.id = users_bind_institutions.institution_id
                WHERE (assignments.comment = NULL OR assignments.comment = '' OR assignments.grade = '' OR assignments.grade = NULL) AND assignments.teacher_id = :teacher_id ORDER BY assignments.id DESC LIMIT $limit";
      $prepare = $db->prepare($query);
      $prepare->execute([
        ':teacher_id' => $user->id
      ]);
      $fetchAssignments = $prepare->fetchAll(PDO::FETCH_ASSOC);

      $response = new SuccessResponse([
        'data' => $fetchAssignments,
        'user_fullname' => $user->user_fullname,
        'total' => $fetch['total']
      ]);
      $response = $response->createSuccessResponse();
      echo json_encode($response, JSON_UNESCAPED_UNICODE);
    }
  }

  class Student
  {

    public static function Controller()
    {
      try {
        if ($_SERVER['REQUEST_METHOD'] != 'POST') {
          $response = new ErrorResponse(405);
          $response = $response->createErrorResponse();
          echo json_encode($response, JSON_UNESCAPED_UNICODE);
        } else if (!empty($_POST['constraints']) && $_POST['constraints'] == "true") {
          if (empty($_POST['institution'])) {
            $response = new ErrorResponse(404, "'university' parametresi gereklidir.");
            $response = $response->createErrorResponse();
            echo json_encode($response, JSON_UNESCAPED_UNICODE);
          } else if (empty($_POST['class'])) {
            $response = new ErrorResponse(404, "'class' parametresi gereklidir.");
            $response = $response->createErrorResponse();
            echo json_encode($response, JSON_UNESCAPED_UNICODE);
          } else if (empty($_POST['branch'])) {
            $response = new ErrorResponse(404, "'branch' parametresi gereklidir.");
            $response = $response->createErrorResponse();
            echo json_encode($response, JSON_UNESCAPED_UNICODE);
          } else
            self::getAllStudentsWithConstraints();
        } else
          self::getAllStudents();
      } catch (Exception $e) {
        $response = new ErrorResponse(500, $e->getMessage());
        $response = $response->createErrorResponse();
        echo json_encode($response, JSON_UNESCAPED_UNICODE);
      }
    }

    public static function getAllStudents()
    {

      $user = isTeacher();

      $db = MySQL::connect();

      $query = "SELECT COUNT(student_id) as total FROM students_bind_teachers WHERE teacher_id = :teacher_id LIMIT 1";
      $prepare = $db->prepare($query);
      $prepare->execute([
        ':teacher_id' => $user->id
      ]);
      $fetch = $prepare->fetch(PDO::FETCH_ASSOC);
      if (!$fetch)
        throw new Exception("Uzak sunucuyla ilgili bir sorun ouştu.");

      $total = $fetch['total'];
      if ($total <= 0)
        throw new Exception("Veritabanında kayıtlı herhangi bir öğrenci bulunamadı.");

      $query = "SELECT institutions.institution_name, institutions.id as institution_id, classes.class, class_branches.class_branch FROM active_students 
                      RIGHT JOIN students_bind_teachers ON active_students.id = students_bind_teachers.student_id AND teacher_id = :teacher_id
                      LEFT JOIN users_bind_institutions ON users_bind_institutions.user_id = active_students.id
                      LEFT JOIN students_bind_classes ON students_bind_classes.student_id = active_students.id
                      LEFT JOIN classes ON classes.id = students_bind_classes.class
                      LEFT JOIN class_branches ON class_branches.id = students_bind_classes.class_branch
                      LEFT JOIN institutions ON institutions.id = users_bind_institutions.institution_id";

      $prepare = $db->prepare($query);
      $prepare->bindParam(':teacher_id', $user->id, PDO::PARAM_INT);

      $prepare->execute();
      $fetch = $prepare->fetchAll(PDO::FETCH_ASSOC);
      if (!$fetch)
        throw new Exception("Öğrenciler veritabanından getirilirken bir hata oluştu.");

      $response = new SuccessResponse([
        'data' => $fetch,
        'total' => $total
      ]);
      $response = $response->createSuccessResponse();
      echo json_encode($response, JSON_UNESCAPED_UNICODE);
    }

    public static function getAllStudentsWithConstraints()
    {

      $user = isTeacher();

      $db = MySQL::connect();

      $query = "SELECT COUNT(student_id) as total FROM students_bind_teachers WHERE teacher_id = :teacher_id LIMIT 1";
      $prepare = $db->prepare($query);
      $prepare->execute([
        ':teacher_id' => $user->id
      ]);
      $fetch = $prepare->fetch(PDO::FETCH_ASSOC);
      if (!$fetch)
        throw new Exception("Uzak sunucuyla ilgili bir sorun ouştu.");

      $total = $fetch['total'];
      if ($total <= 0)
        throw new Exception("Veritabanında kayıtlı herhangi bir öğrenci bulunamadı.");

      $query = "SELECT active_students.user_uuid, active_students.avatar, active_students.user_fullname, active_students.email FROM active_students  
                  RIGHT JOIN students_bind_teachers ON active_students.id = students_bind_teachers.student_id AND teacher_id = :teacher_id
                  LEFT JOIN users_bind_institutions ON users_bind_institutions.user_id = students_bind_teachers.student_id
                  INNER JOIN institutions ON institutions.id = users_bind_institutions.institution_id AND institutions.institution_name = :institution_name
                  INNER JOIN students_bind_classes ON students_bind_classes.student_id = active_students.id
                  INNER JOIN classes ON classes.id = students_bind_classes.class AND classes.class = :class
                  INNER JOIN class_branches ON class_branches.id = students_bind_classes.class_branch AND class_branches.class_branch = :branch LIMIT 10000";

      $prepare = $db->prepare($query);
      $prepare->execute([
        ':teacher_id' => $user->id,
        ':institution_name' => $_POST['institution'],
        ':class' => $_POST['class'],
        ':branch' => $_POST['branch']
      ]);
      $fetch = $prepare->fetchAll(PDO::FETCH_ASSOC);
      if (!$fetch)
        throw new Exception("Öğrenciler veritabanından getirilirken bir hata oluştu.");

      $response = new SuccessResponse([
        'data' => $fetch,
        'total' => $total
      ]);
      $response = $response->createSuccessResponse();
      echo json_encode($response, JSON_UNESCAPED_UNICODE);
    }
  }

  class Statistics
  {
    public static function Controller()
    {
      try {
        if ($_SERVER['REQUEST_METHOD'] != 'POST') {
          $response = new ErrorResponse(405);
          $response = $response->createErrorResponse();
          echo json_encode($response, JSON_UNESCAPED_UNICODE);
        } else
          self::getStatistics();
      } catch (Exception $e) {
        $response = new ErrorResponse(500, $e->getMessage());
        $response = $response->createErrorResponse();
        echo json_encode($response, JSON_UNESCAPED_UNICODE);
      }
    }

    public static function getStatistics() 
    {

      $user = isTeacher();

      $db = MySQL::connect();

      // Öğrenci sayısı
      $query = "SELECT COUNT( * ) as total_student_count FROM students_bind_teachers WHERE teacher_id = :teacher_id";
      $prepare = $db->prepare($query);
      $prepare->execute([
        ':teacher_id' => $user->id
      ]);
      $fetch = $prepare->fetch(PDO::FETCH_ASSOC);
      if ($fetch != 0 && !$fetch)
        throw new Exception("Uzak sunucuyla ilgili bir sorun ouştu.");

      $total_student_count = $fetch['total_student_count'];


      // Ödev sayısı
      $query = "SELECT COUNT( * ) as total_assignment_count FROM assignments WHERE teacher_id = :teacher_id";
      $prepare = $db->prepare($query);
      $prepare->execute([
        ':teacher_id' => $user->id
      ]);
      $fetch = $prepare->fetch(PDO::FETCH_ASSOC);
      if ($fetch != 0 && !$fetch)
        throw new Exception("Uzak sunucuyla ilgili bir sorun ouştu.");

      $total_assignment_count = $fetch['total_assignment_count'];


      // Ödev gönderenler lider tablosu
      $query = "SELECT user_fullname, user_uuid, COUNT(*) as countOfAssignments FROM assignments 
              INNER JOIN users on assignments.student_id = users.id WHERE teacher_id = :teacher_id 
              GROUP BY assignments.student_id ORDER BY countOfAssignments DESC LIMIT 5";       
      $prepare = $db->prepare($query);
      $prepare->execute([
        ':teacher_id' => $user->id
      ]);
      $fetch = $prepare->fetchAll(PDO::FETCH_ASSOC);
      if ($fetch != [] && !$fetch)
        throw new Exception("Uzak sunucuyla ilgili bir sorun ouştu.");

      $assignment_leader_table = $fetch;


      // Bir yıllık göderilen ödevlerin periyodik tablosu
      $query = "SELECT EXTRACT(YEAR_MONTH FROM assignments.created_date) Month, count(*) as total FROM assignments 
              WHERE EXTRACT(YEAR FROM assignments.created_date) = YEAR(CURRENT_DATE) AND (YEAR(CURRENT_DATE) - 1) AND assignments.teacher_id = :teacher_id
              GROUP BY EXTRACT(YEAR_MONTH FROM assignments.created_date) ORDER BY EXTRACT(YEAR_MONTH FROM assignments.created_date)";       
      $prepare = $db->prepare($query);
      $prepare->execute([
        ':teacher_id' => $user->id
      ]);
      $fetch = $prepare->fetchAll(PDO::FETCH_ASSOC);
      if ($fetch != [] && !$fetch)
        throw new Exception("Uzak sunucuyla ilgili bir sorun ouştu.");

      $one_year_period = $fetch;

      $response = new SuccessResponse([
        'total_student_count' => $total_student_count,
        'total_assignment_count' => $total_assignment_count,
        'assignment_leader_table' => $assignment_leader_table,
        'one_year_period' => $one_year_period
      ]);
      $response = $response->createSuccessResponse();
      echo json_encode($response, JSON_UNESCAPED_UNICODE);
    }
  }

  class Assignment
  {

    public static function Controller()
    {
      try {
        if ($_SERVER['REQUEST_METHOD'] != 'POST') {
          $response = new ErrorResponse(405);
          $response = $response->createErrorResponse();
          echo json_encode($response, JSON_UNESCAPED_UNICODE);
        } else if (isset($_GET['action']) && $_GET['action'] == 'update') {
          if (!empty($_POST['sendToStudent']) && $_POST['sendToStudent'] == 'true')
            self::sendChangesToStudent();
          else
            self::setParamsToAssignmentById();
        } else if (!empty($_GET['assignment_id']))
          self::getFileById();
        else
          self::getAllAssignmentsById();
      } catch (Exception $e) {
        $response = new ErrorResponse(500, $e->getMessage());
        $response = $response->createErrorResponse();
        echo json_encode($response, JSON_UNESCAPED_UNICODE);
      }
    }

    public static function getAllAssignmentsById()
    {

      if (empty($_POST['student_uuid']))
        throw new Exception("'student_uuid' parametresi gereklidir.");

      $user = isTeacher();

      $db = MySQL::connect();

      $query = "SELECT user_fullname, email, avatar FROM all_students WHERE user_uuid = :student_uuid LIMIT 1";
      $prepare = $db->prepare($query);
      $prepare->execute([
        ':student_uuid' => $_POST['student_uuid']
      ]);
      $student = $prepare->fetch(PDO::FETCH_ASSOC);
      if (!$student)
        throw new Exception("Veritabanında kayıtlı herhangi bir öğrenci bulunamadı.");

      $query = "SELECT log_files.file_name, assignments.id, assignments.grade, assignments.comment, assignments.status FROM assignments 
                    RIGHT JOIN all_students ON all_students.user_uuid = :student_uuid AND assignments.student_id = all_students.id
                    RIGHT JOIN log_files ON log_files.id = assignments.file_log_id WHERE assignments.teacher_id = :teacher_id LIMIT 1000";
      $prepare = $db->prepare($query);
      $prepare->execute([
        ':teacher_id' => $user->id,
        ':student_uuid' => $_POST['student_uuid']
      ]);
      $fetch = $prepare->fetchAll(PDO::FETCH_ASSOC);

      $response = new SuccessResponse([
        'data' => $fetch,
        'user_fullname' => $student['user_fullname'],
        'email' => $student['email'],
        'avatar' => $student['avatar'],
      ]);
      $response = $response->createSuccessResponse();
      echo json_encode($response, JSON_UNESCAPED_UNICODE);
    }

    public static function getFileById()
    {

      if (empty($_GET['assignment_id']))
        throw new Exception("'assignment_id' parametresi gereklidir.");

      $user = isTeacher();

      $fetch = self::getFileInfoById($user->id);

      $student_uuid = $fetch['user_uuid'];
      $filename = $fetch['file_name'];

      Download::FileDownload(ASSIGNMENTS_DIR . $student_uuid . '/' . $filename);
    }

    private static function getFileInfoById($id)
    {
      $db = MySQL::connect();

      $query = "SELECT users.user_uuid, users.email, log_files.file_name FROM assignments 
                    INNER JOIN users ON users.id = assignments.student_id 
                    INNER JOIN log_files ON log_files.id = assignments.file_log_id
                    WHERE assignments.teacher_id = :teacher_id AND assignments.id = :assignment_id LIMIT 1";
      $prepare = $db->prepare($query);
      $prepare->execute([
        ':teacher_id' => $id,
        ':assignment_id' => $_GET['assignment_id']
      ]);

      $fetch = $prepare->fetch(PDO::FETCH_ASSOC);
      if (!$fetch)
        throw new Exception("Veritabanında kayıtlı herhangi bir ödev bulunamadı.");

      return $fetch;
    }

    public static function setParamsToAssignmentById($status = 0)
    {

      if (empty($_GET['assignment_id']))
        throw new Exception("'assignment_id' parametresi gereklidir.");
      else if (empty($_POST['student_uuid']))
        throw new Exception("'student_uuid' parametresi gereklidir.");

      if ($_POST['grade'] != 0 && empty($_POST['grade']))
        throw new Exception("'grade' parametresi gereklidir.");
      else if ($_POST['grade'] < 0 || $_POST['grade'] > 100)
        throw new Exception("'grade' parametresi [0, 100] aralığında olmalıdır.");
      else if (empty($_POST['comment']))
        throw new Exception("'comment' parametresi gereklidir.");

      $user = isTeacher();
      $db = MySQL::connect();
      $query = "SELECT user_fullname, email, avatar FROM all_students WHERE user_uuid = :student_uuid LIMIT 1";
      $prepare = $db->prepare($query);
      $prepare->execute([
        ':student_uuid' => $_POST['student_uuid']
      ]);
      $student = $prepare->fetch(PDO::FETCH_ASSOC);
      if (!$student)
        throw new Exception("Veritabanında kayıtlı herhangi bir öğrenci bulunamadı.");

      if (!empty($_POST['file'])) {

        $fetch = self::getFileInfoById($user->id);
        $decoded = urldecode($_POST['file']);

        $file = fopen(ASSIGNMENTS_DIR . $fetch['user_uuid'] . '/' . $fetch['file_name'], "w");
        fwrite($file, $decoded);
        fclose($file);
      }

      $query = "UPDATE assignments SET assignments.grade = :grade, assignments.comment = :comment, assignments.status = :status, assignments.is_readed = :is_readed  
                    WHERE assignments.teacher_id = :teacher_id AND assignments.id = :assignment_id LIMIT 1";
      $prepare = $db->prepare($query);
      $prepare->execute([
        ':grade' => $_POST['grade'],
        ':comment' => $_POST['comment'],
        ':status' => $status,
        ':is_readed' => 0,
        ':teacher_id' => $user->id,
        ':assignment_id' => $_GET['assignment_id']
      ]);
      if (!$prepare)
        throw new Exception("Ödev için güncelleme işlemi başarısız oldu.");

      $response = new SuccessResponse(['message' => 'İşlemler başarıyla gerçekleştirildi!']);
      $response = $response->createSuccessResponse();
      echo json_encode($response, JSON_UNESCAPED_UNICODE);

      return $student;
    }

    public static function sendChangesToStudent()
    {
      ob_start();
      $student = self::setParamsToAssignmentById(1);
      try {
        $mail = new PHPMailer(true);
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

        $mail->addAddress($student['email'], $student['user_fullname']);

        //Content                                              
        $mail->Subject = 'Ödev Notu Girildi';
        if (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on')
          $url = "https://";
        else
          $url = "http://";
        $web_address = $url . $_SERVER["HTTP_HOST"];

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
                                    <td align="left" style="padding:0px 40px 40px 40px"><p style="color:#262626; font-size:32px; text-align:left; font-family: Verdana, Geneva, sans-serif">Merhaba ' . $student['user_fullname'] . ',</p>
                                      <p style="color:#000000; font-size:16px; text-align:left; font-family: Verdana, Geneva, sans-serif; line-height:22px ">PyNar sistemi üzerinden göndermiş olduğunuz ödev için not girişi gerçekleştirildi. İncelemek için aşağıdaki linke tıklayınız.<br />
                                        Eğer ki bu mailin size yanlışlıkla geldiğini düşünüyorsanız, dikkate almayınız. 
                                        <br />
                                        <br />
                                        <br />
                                        <a target="_blank" href="' . $web_address . '/portal/assignments/' . $_GET['assignment_id'] .  '" style="padding: 15px;border: none;font-size: 16px;color: white;background-color: #add33c;text-decoration: none">
                                            Sonuçları Gör
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

      $response = new SuccessResponse(['message' => 'İşlemler başarıyla gerçekleştirildi!']);
      $response = $response->createSuccessResponse();
      echo json_encode($response, JSON_UNESCAPED_UNICODE);
    }
  }
}
