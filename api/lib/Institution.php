<?php
namespace Lib\Institution{

    use Lib\HTTP\ErrorResponse;
    use Lib\HTTP\SuccessResponse;
    use Lib\Database\MySQL;
    use function Lib\Auth\verifyToken;
    use function Lib\Auth\isLogin;

    use \Exception;
    use \PDO;

    class Institute {
        
        private static $yandexSearchURL = 'https://www.yandex.com.tr/search/?';

        public static function getInstitutes(){
                   
            $db = MySQL::connect();
            $query = "SELECT id, web_address, institution_name FROM institutions WHERE city = :city and institution_type = :institution_type LIMIT 100000";
            $prepare = $db->prepare($query);
            $prepare->execute([
                ':city' => $_POST['city'],
                ':institution_type' => $_POST['institution_type']
            ]);
            $fetch = $prepare->fetchAll(PDO::FETCH_ASSOC);
            if(!$fetch)
                throw new Exception("Veri tabanında kullanıcı bulunamadı.");

            return $fetch;

        }

        public static function getAndSendResponseInstitutes(){

            $fetch = self::getInstitutes();
            $response = new SuccessResponse(['data' => $fetch]); 
            $response = $response->createSuccessResponse();
            echo json_encode($response, JSON_UNESCAPED_UNICODE);

        }

        public static function activateTeacher(){

            $db = MySQL::connect();

            $user = verifyToken($_POST['token']);
            if(empty($_POST['institution_id'])){
                throw new Exception("'teacher_id' parametresi gereklidir.");
            }

            $query = "SELECT web_address FROM institutions WHERE id = :institution_id LIMIT 1";
            $prepare = $db->prepare($query);
            $prepare->execute([
                ':institution_id' => $_POST['institution_id'],
            ]);
            $fetch = $prepare->fetch(PDO::FETCH_ASSOC);
            if(!$fetch)
                throw new Exception("Okul ile web adresi uyuşmuor, lütfen yöneticinize başvurunuz.");
            else if($fetch['web_address'] != $_POST['web_address'])
                throw new Exception("Hesabınız aktif edilemedi, lütfen yöneticinize başvurunuz.");

            $ch = curl_init();

            $query = 'text="' . $user->user_fullname . '" site:' . $_POST['web_address'];
            $query = str_replace(' ', '%20', $query);
            
            // set url
            curl_setopt($ch, CURLOPT_URL, self::$yandexSearchURL . $query);

            //return the transfer as a string
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($ch,CURLOPT_USERAGENT,'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:84.0) Gecko/20100101 Firefox/84.0');

            // $output contains the output string
            $result = curl_exec($ch);

            // close curl resource to free up system resources
            curl_close($ch); 

            if($result === false)
                throw new Exception("Üzgünüm, öğretmen listesine şu anda erişilemiyor. Hesabınız kaydedildi ancak aktif hale getirilemedi.");

            if (strpos($result, 'alıntısının tam karşılığı bulunamadı') !== false)
                throw new Exception("Üzgünüm, listede adınız mevcut değil. Lütfen yöneticinize başvurunuz.");

            $query = "UPDATE users SET user_status = :user_status WHERE email = :email and group_id = :group_id LIMIT 1";
            $prepare = $db->prepare($query);
            $prepare = $prepare->execute([
                ':user_status' => 1,
                ':email' => $user->email,
                ':group_id' => 2
            ]);
            if(!$prepare)
                throw new Exception("Hesabınız aktif edilemedi, lütfen yöneticinize başvurunuz.");
            
            $query = "INSERT INTO users_bind_institutions (user_id, institution_id) VALUES ((SELECT id FROM users WHERE email = :email), :institution_id)";
            $prepare = $db->prepare($query);
            $prepare = $prepare->execute([
                ':email' => $user->email,
                ':institution_id' => $_POST['institution_id']
            ]);
            if(!$prepare)
                throw new Exception("Hesabınız aktif edildi, ancak okulunuz seçilemedi. Lütfen yöneticinize başvurunuz.");

            $response = new SuccessResponse(['message' => 'Başarılı! Hesabınız aktif edildi.']); 
            $response = $response->createSuccessResponse();
            echo json_encode($response, JSON_UNESCAPED_UNICODE);

        } 

        public static function getTeachers(){

            $user = isLogin();
            $db = MySQL::connect();
            $query = "SELECT users.id, users.user_fullname FROM users_bind_institutions
                    RIGHT JOIN users ON users.id = users_bind_institutions.user_id AND users.group_id = :group_id
                    WHERE institution_id = :institution_id LIMIT 20000";
            $prepare = $db->prepare($query);
            $prepare->execute([
                ':institution_id' => $_POST['institution_id'],
                ':group_id' => 2
            ]);
            $data = [];
            $fetch = $prepare->fetchAll(PDO::FETCH_ASSOC);
            
            return $fetch;
        }

        public static function getAndSendResponseTeachers(){

            $fetch = self::getTeachers();
            $response = new SuccessResponse(['data' => $fetch]); 
            $response = $response->createSuccessResponse();
            echo json_encode($response, JSON_UNESCAPED_UNICODE);

        }

        public static function Steps(){
            switch ($_POST['step']) {
                case "1":
                    self::getAndSendResponseInstitutes();
                    break;
                case "2":
                    self::activateTeacher();
                    break;
                case "3":
                    self::getAndSendResponseTeachers();
                    break;
                default:
                    throw new Exception("Step parametresi 1 veya 2 değerini alabilir.");
                    break;
            }
        }

        public static function Controller(){
            try {
                if($_SERVER['REQUEST_METHOD'] != 'POST'){
                    $response = new ErrorResponse(405);
                    $response = $response->createErrorResponse();
                    echo json_encode($response, JSON_UNESCAPED_UNICODE);
                } else if (empty($_POST['step'])){
                    $response = new ErrorResponse(404, "'step' parametresi gereklidir.");
                    $response = $response->createErrorResponse();
                    echo json_encode($response, JSON_UNESCAPED_UNICODE);
                }           
                else
                    self::Steps();
            }
            catch(Exception $e){
                error_log($e->getMessage());
                $response = new ErrorResponse(500, $e->getMessage()); 
                $response = $response->createErrorResponse();
                echo json_encode($response, JSON_UNESCAPED_UNICODE);
            }          
            
        }

    }

    class Student {
        public static function getInfo(){
            
            $user = isLogin();
            
            $db = MySQL::connect();
            $query = "SELECT users_bind_institutions.institution_id, institutions.city, institutions.institution_type, institutions.institution_name, students_bind_classes.class, students_bind_classes.class_branch, class_branches.class_branch as class_branch_name, users.id as teacher_id, users.user_fullname as teacher_fullname
                    FROM users_bind_institutions 
                    LEFT JOIN institutions ON users_bind_institutions.institution_id = institutions.id
                    LEFT JOIN students_bind_teachers ON students_bind_teachers.student_id = users_bind_institutions.user_id
                    LEFT JOIN students_bind_classes ON students_bind_classes.student_id = users_bind_institutions.user_id
                    LEFT JOIN classes ON classes.id = students_bind_classes.class
                    LEFT JOIN class_branches ON class_branches.id = students_bind_classes.class_branch
                    LEFT JOIN users ON users.id = students_bind_teachers.teacher_id
                    WHERE users_bind_institutions.user_id = :student_id";
            $prepare = $db->prepare($query);
            $prepare->execute([
                ':student_id' => $user->id            
            ]);
            $fetch = $prepare->fetch(PDO::FETCH_ASSOC);
            if(!$fetch)
                throw new Exception("Kullanıcının kayıtlı olduğu bir kurum bulunamadı.");
                       
            $response = new SuccessResponse([
                'message' => 'Kullanıcının kurum bilgileri başarıyla getirildi.',
                'data' => $fetch
            ]); 
            
            $response = $response->createSuccessResponse();
            echo json_encode($response, JSON_UNESCAPED_UNICODE);
        }

        public static function Controller(){
            try {
                if($_SERVER['REQUEST_METHOD'] != 'POST'){
                    $response = new ErrorResponse(405);
                    $response = $response->createErrorResponse();
                    echo json_encode($response, JSON_UNESCAPED_UNICODE);
                }        
                else if (!empty($_POST['institution_id']) || !empty($_POST['teacher_id']) || !empty($_POST['class']) || !empty($_POST['class_branch'])){
                    self::update();
                }   
                else
                    self::getInfo();
            }
            catch(Exception $e){
                $response = new ErrorResponse(500, $e->getMessage()); 
                $response = $response->createErrorResponse();
                echo json_encode($response, JSON_UNESCAPED_UNICODE);
            }               
        }

        public static function update(){
            $user = isLogin();
            if($user->group_id != 1)
                throw new Exception("Yalnızca öğrenciler okullarını seçebilir.");
            
            $db = MySQL::connect();
            if(isset($_POST['institution_id'])){
                
                $query = "INSERT INTO users_bind_institutions (user_id, institution_id) VALUES (:user_id, :institution_id)
                        ON DUPLICATE KEY UPDATE institution_id = :institution_id";
                $prepare = $db->prepare($query);
                $prepare = $prepare->execute([
                    ':user_id' => $user->id,
                    ':institution_id' => empty($_POST['institution_id']) ? NULL: $_POST['institution_id']
                ]);

                if(!$prepare)
                    throw new Exception("Bilgileriniz güncellenirken bir hata ile karşılaşıldı.");
            }

            if(isset($_POST['teacher_id'])){
                $query = "INSERT INTO students_bind_teachers (student_id, teacher_id) VALUES (:student_id, :teacher_id)
                        ON DUPLICATE KEY UPDATE teacher_id = :teacher_id";
                $prepare = $db->prepare($query);
                $prepare = $prepare->execute([
                    ':student_id' => $user->id,
                    ':teacher_id' => empty($_POST['teacher_id']) ? NULL: $_POST['teacher_id']
                ]);

                if(!$prepare){
                    $db->rollBack();
                    throw new Exception("Öğretmen bilginiz güncellenirken bir sorun oluştu.");
                }
            }
            
            if(isset($_POST['class']) || isset($_POST['class_branch'])){
                $data = [
                    ':student_id' => $user->id,
                ];
                
                $columns = "(student_id";
                $insert_params = "(:student_id";
                $update_columns = "";
                if(!empty($_POST['class'])){
                    $data[':class'] = $_POST['class'];
                    $columns .= ", class";
                    $insert_params .= ", :class";
                    $update_columns .= "class = :class";
                }
                if(!empty($_POST['class_branch'])){
                    $data[':class_branch'] = $_POST['class_branch'];
                    $columns .= ", class_branch";
                    $insert_params .= ", :class_branch";
                    $update_columns .= empty($update_columns) ? "class_branch = :class_branch":", class_branch = :class_branch";
                }
                $columns .= ")";
                $insert_params .= ")";
                
                $query = "INSERT INTO students_bind_classes $columns VALUES $insert_params ON DUPLICATE KEY UPDATE $update_columns";
                //throw new Exception($query);
                $prepare = $db->prepare($query);
                $prepare = $prepare->execute($data);

                if(!$prepare){
                    $db->rollBack();
                    throw new Exception("Sınıf bilgileriniz güncellenirken sorun oluştu.");
                }
            }              
            
            $response = new SuccessResponse(['message' => 'Bilgileriniz başarıyla güncellendi.']); 
            $response = $response->createSuccessResponse();
            echo json_encode($response, JSON_UNESCAPED_UNICODE);
        }
    }

    class Teacher {

        public static function UpdateController(){
            try {
                if($_SERVER['REQUEST_METHOD'] != 'POST'){
                    $response = new ErrorResponse(405);
                    $response = $response->createErrorResponse();
                    echo json_encode($response, JSON_UNESCAPED_UNICODE);
                } else if (empty($_POST['institution_id'])){
                    $response = new ErrorResponse(404, "'instution_id' parametresi gereklidir.'"); 
                    $response = $response->createErrorResponse();
                    echo json_encode($response, JSON_UNESCAPED_UNICODE);
                }      
                else 
                    self::update();
            }
            catch(Exception $e){
                $response = new ErrorResponse(500, $e->getMessage()); 
                $response = $response->createErrorResponse();
                echo json_encode($response, JSON_UNESCAPED_UNICODE);
            }          
            
        }

        public static function update(){
            $user = isLogin();
            if($user->group_id != 2)
                throw new Exception("Yalnızca öğretmenler okullarını seçebilir.");
            
            $db = MySQL::connect();
            if(isset($_POST['institution_id'])){
                
                $query = "INSERT INTO users_bind_institutions (user_id, institution_id) VALUES (:user_id, :institution_id)
                        ON DUPLICATE KEY UPDATE institution_id = :institution_id";
                $prepare = $db->prepare($query);
                $prepare = $prepare->execute([
                    ':user_id' => $user->id,
                    ':institution_id' => empty($_POST['institution_id']) ? NULL: $_POST['institution_id']
                ]);

                if(!$prepare)
                    throw new Exception("Bilgileriniz güncellenirken bir hata ile karşılaşıldı.");
            }          
            
            $response = new SuccessResponse(['message' => 'Bilgileriniz başarıyla güncellendi.']); 
            $response = $response->createSuccessResponse();
            echo json_encode($response, JSON_UNESCAPED_UNICODE);
        }
    }

}
?>