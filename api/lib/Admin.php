<?php
namespace Lib\Admin {

    use function Lib\Auth\isLogin;
    use function Lib\Auth\isActive;
    use function Lib\Auth\passwordVerify;
    use function Lib\UUID\uuidv4;

use \PDO;

    use Lib\File\Download;
    use Lib\File\Upload;
    use Lib\HTTP\ErrorResponse;
    use Lib\HTTP\SuccessResponse;
    use Lib\Database\MySQL;
    use \Exception;
    use Lib\Institution\Institute;

function isAdmin(){
        $user = isLogin();
        $active = isActive(NULL, $user->id, $user->mac_address);
        
        if($user->group_id != 8)
            throw new Exception("Yalnızca admin yetkilerine sahip kullanıcılar bu işlemi gerçekleştirebilir.");
        
        return $user;
    }

    class Student {

        public static function Controller(){
            try {
                if($_SERVER['REQUEST_METHOD'] != 'POST'){
                    $response = new ErrorResponse(405);
                    $response = $response->createErrorResponse();
                    echo json_encode($response, JSON_UNESCAPED_UNICODE);
                } 
                else if(!empty($_POST['assignments_by_student_uuid']))
                    if(!empty($_POST['assignment_id']))
                        self::getAssignmentById();
                    else
                        self::getAllAssignments();
                else if(!empty($_POST['update_student_id']))
                    self::update();
                else if(!empty($_POST['add_student']))
                    self::add();
                else if(!empty($_POST['delete_student_id']))
                    self::delete();
                else if(!empty($_POST['institution_id']))
                    Institute::getAndSendResponseTeachers();
                else if(!empty($_POST['city']) && !empty($_POST['institution_type']))
                    Institute::getAndSendResponseInstitutes();
                else 
                    self::getAll();
            }
            catch(Exception $e){
                $response = new ErrorResponse(500, $e->getMessage()); 
                $response = $response->createErrorResponse();
                echo json_encode($response, JSON_UNESCAPED_UNICODE);
            }
        }

        public static function getAll(){
            
            $user = isAdmin();
            $active = isActive(NULL, $user->id, $user->mac_address);

            $db = MySQL::connect();

            $query = "SELECT all_students.id, all_students.user_uuid, all_students.user_fullname, all_students.email, all_students.user_status, all_students.created_date, all_students.is_inited, institutions.id as institution_id, institutions.institution_name, institutions.city, institutions.institution_type, all_teachers.user_fullname as teacher_fullname, all_teachers.id as teacher_id, classes.class, classes.id as class_id, class_branches.class_branch, class_branches.id as class_branch_id
                        FROM all_students 
                        LEFT JOIN users_bind_institutions ON users_bind_institutions.user_id = all_students.id
                        LEFT JOIN institutions ON users_bind_institutions.institution_id = institutions.id
                        LEFT JOIN students_bind_teachers ON students_bind_teachers.student_id = all_students.id
                        LEFT JOIN all_teachers ON all_teachers.id = students_bind_teachers.teacher_id
                        LEFT JOIN students_bind_classes ON students_bind_classes.student_id = all_students.id
                        LEFT JOIN classes ON classes.id = students_bind_classes.class
                        LEFT JOIN class_branches ON class_branches.id = students_bind_classes.class_branch
                        LIMIT 5000";
            $prepare = $db->prepare($query);
            $prepare->execute();
            $fetch = $prepare->fetchAll(PDO::FETCH_ASSOC);
            if (count($fetch) != 0 && !$fetch)
                throw new Exception("Veritabanıyla ilgili bir sorun oluştu.");

            $response = new SuccessResponse([
                'data' => $fetch
            ]);
            $response = $response->createSuccessResponse();
            echo json_encode($response, JSON_UNESCAPED_UNICODE);           

        }

        public static function delete(){
            
            $user = isAdmin();
            $active = isActive(NULL, $user->id, $user->mac_address);

            $delete_student_id = $_POST['delete_student_id'];

            $db = MySQL::connect();

            $query = "DELETE FROM users WHERE id = :user_id AND group_id = :group_id LIMIT 1";
            $prepare = $db->prepare($query);
            $result = $prepare->execute([
                ':user_id' => $delete_student_id,
                ':group_id' => 1
            ]);
            
            if(!$prepare->rowCount())
                throw new Exception("Öğrenci veritabanında mevcut değil.");
            else if (!$prepare)
                throw new Exception("Veritabanıyla ilgili bir sorun oluştu.");

            $response = new SuccessResponse([
                'message' => 'Öğrenci sistemden başarıyla silindi.'
            ]);
            $response = $response->createSuccessResponse();
            echo json_encode($response, JSON_UNESCAPED_UNICODE);           

        }

        public static function update(){
            
            $user = isAdmin();
            $active = isActive(NULL, $user->id, $user->mac_address);

            $update_student_id = $_POST['update_student_id'];

            $db = MySQL::connect();

            $query = "SELECT COUNT(*) as total FROM all_users WHERE email = :email LIMIT 1";
            $prepare = $db->prepare($query);
            $prepare->execute([
                ':email' => $_POST['student_email'],
            ]);

            $fetch = $prepare->fetch();
            if(!$fetch)
                throw new Exception("Veri tabanıyla ilgili bir sorun oluştu. Lütfen daha sonra tekrar deneyiniz.");
            else if($fetch['total'] == 1)
                throw new Exception("Veri tabanında aynı e-posta ile kayıtlı bir kullanıcı bulunuyor.");

            $data = [
                ':student_id' => $update_student_id,
                ':group_id' => 1
            ];
            
            $update_columns = "";

            if(!empty($_POST['student_fullname'])){
                $data[':student_fullname'] = $_POST['student_fullname'];
                $update_columns .= "user_fullname = :student_fullname";
            }
            if(!empty($_POST['student_email'])){
                $data[':student_email'] = $_POST['student_email'];
                $update_columns .= empty($update_columns) ? "email = :student_email":", email = :student_email";
            }
            /*if(!empty($_POST['student_password'])){
                passwordVerify($_POST['student_password']);
                $data[':student_password'] = password_hash($_POST['student_password'], PASSWORD_BCRYPT);
                $update_columns .= empty($update_columns) ? "password = :student_password":", password = :student_password";
            }  */    
            if(!empty($_POST['student_status']) || $_POST['student_status'] == "0"){
                $data[':student_status'] = $_POST['student_status'];
                $update_columns .= empty($update_columns) ? "user_status = :student_status":", user_status = :student_status";
            }
            
            if($update_columns != ""){
            
                $query = "UPDATE users SET $update_columns WHERE id = :student_id AND group_id = :group_id";
                $prepare = $db->prepare($query);
                $prepare->execute($data);

                if(!$prepare->rowCount())
                    throw new Exception("Öğrenci veritabanında mevcut değil.");
                else if (!$prepare)
                    throw new Exception("Veritabanıyla ilgili bir sorun oluştu.");    

            }

            
            if(!empty($_POST['institution_id'])){
            
                $query = "INSERT INTO users_bind_institutions (user_id, institution_id) VALUES (:user_id, :institution_id)
                        ON DUPLICATE KEY UPDATE institution_id = :institution_id";
                $prepare = $db->prepare($query);
                $prepare = $prepare->execute([
                    ':user_id' => $update_student_id,
                    ':institution_id' => empty($_POST['institution_id']) ? NULL: $_POST['institution_id']
                ]);

                if(!$prepare)
                    throw new Exception("Bilgiler güncellenirken bir hata ile karşılaşıldı.");

                $query = "INSERT INTO students_bind_teachers (student_id, teacher_id) VALUES (:student_id, :teacher_id)
                        ON DUPLICATE KEY UPDATE teacher_id = :teacher_id";
                $prepare = $db->prepare($query);
                $prepare = $prepare->execute([
                    ':student_id' => $update_student_id,
                    ':teacher_id' => empty($_POST['teacher_id']) ? NULL: $_POST['teacher_id']
                ]);

                if(!$prepare){
                    $db->rollBack();
                    throw new Exception("Öğretmen bilgisi güncellenirken bir sorun oluştu.");
                }
            }
            else if(!empty($_POST['teacher_id'])){
                $query = "INSERT INTO students_bind_teachers (student_id, teacher_id) VALUES (:student_id, :teacher_id)
                        ON DUPLICATE KEY UPDATE teacher_id = :teacher_id";
                $prepare = $db->prepare($query);
                $prepare = $prepare->execute([
                    ':student_id' => $update_student_id,
                    ':teacher_id' => empty($_POST['teacher_id']) ? NULL: $_POST['teacher_id']
                ]);

                if(!$prepare){
                    $db->rollBack();
                    throw new Exception("Öğretmen bilgisi güncellenirken bir sorun oluştu.");
                }
            }            
            
            if(!empty($_POST['class']) || !empty($_POST['class_branch'])){
                $data = [
                    ':student_id' => $update_student_id,
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
                $prepare = $db->prepare($query);
                $prepare = $prepare->execute($data);
                if(!$prepare){
                    $db->rollBack();
                    throw new Exception("Sınıf bilgileri güncellenirken sorun oluştu.");
                }
            } 

            $response = new SuccessResponse([
                'message' => 'Öğrenci bilgileri başarıyla güncellendi.'
            ]);
            $response = $response->createSuccessResponse();
            echo json_encode($response, JSON_UNESCAPED_UNICODE);           

        }

        public static function add(){
            
            if(empty($_POST['student_fullname']))
                throw new Exception("'student_fullname' parametresi gereklidir.");
           
            if(empty($_POST['student_email']))
                throw new Exception("'student_email' parametresi gereklidir.");

            if(empty($_POST['student_status']) && $_POST['student_status'] != "0")
                throw new Exception("'student_status' parametresi gereklidir.");

            $user = isAdmin();
            $active = isActive(NULL, $user->id, $user->mac_address);

            $db = MySQL::connect();
            
            $query = "SELECT COUNT(*) as total FROM all_users WHERE email = :email LIMIT 1";
            $prepare = $db->prepare($query);
            $prepare->execute([
                ':email' => $_POST['student_email'],
            ]);

            $fetch = $prepare->fetch();
            if(!$fetch)
                throw new Exception("Veri tabanıyla ilgili bir sorun oluştu. Lütfen daha sonra tekrar deneyiniz.");
            else if($fetch['total'] == 1)
                throw new Exception("Veri tabanında aynı e-posta ile kayıtlı bir kullanıcı bulunuyor.");

            $query = "INSERT INTO users (user_fullname, email, user_uuid, user_status, password, group_id) VALUES (:user_fullname, :email, :user_uuid, :user_status, :password, :group_id)";
            
            $prepare = $db->prepare($query);
            $prepare->execute([
                ':user_fullname' => $_POST['student_fullname'],
                ':email' => $_POST['student_email'],
                ':user_uuid' => uuidv4(),
                ':user_status' => $_POST['student_status'],
                ':password' => password_hash(USER_DEFAULT_PASSWORD, PASSWORD_BCRYPT),
                ':group_id' => 1
            ]);
           
            $add_student_id = $db->lastInsertId();
            if(!$add_student_id)
                throw new Exception("Öğrenci veritabanına eklenemedi.");
            
            if(!empty($_POST['institution_id'])){
            
                $query = "INSERT INTO users_bind_institutions (user_id, institution_id) VALUES (:user_id, :institution_id)
                        ON DUPLICATE KEY UPDATE institution_id = :institution_id";
                $prepare = $db->prepare($query);
                $prepare = $prepare->execute([
                    ':user_id' => $add_student_id,
                    ':institution_id' => empty($_POST['institution_id']) ? NULL: $_POST['institution_id']
                ]);

                if(!$prepare)
                    throw new Exception("Bilgiler güncellenirken bir hata ile karşılaşıldı.");

                $query = "INSERT INTO students_bind_teachers (student_id, teacher_id) VALUES (:student_id, :teacher_id)
                        ON DUPLICATE KEY UPDATE teacher_id = :teacher_id";
                $prepare = $db->prepare($query);
                $prepare = $prepare->execute([
                    ':student_id' => $add_student_id,
                    ':teacher_id' => empty($_POST['teacher_id']) ? NULL: $_POST['teacher_id']
                ]);

                if(!$prepare){
                    $db->rollBack();
                    throw new Exception("Öğretmen bilgisi güncellenirken bir sorun oluştu.");
                }
            }
            else if(!empty($_POST['teacher_id'])){
                $query = "INSERT INTO students_bind_teachers (student_id, teacher_id) VALUES (:student_id, :teacher_id)
                        ON DUPLICATE KEY UPDATE teacher_id = :teacher_id";
                $prepare = $db->prepare($query);
                $prepare = $prepare->execute([
                    ':student_id' => $add_student_id,
                    ':teacher_id' => empty($_POST['teacher_id']) ? NULL: $_POST['teacher_id']
                ]);

                if(!$prepare){
                    $db->rollBack();
                    throw new Exception("Öğretmen bilgisi güncellenirken bir sorun oluştu.");
                }
            }            
            
            if(!empty($_POST['class']) || !empty($_POST['class_branch'])){
                $data = [
                    ':student_id' => $add_student_id,
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
                    throw new Exception("Sınıf bilgileri güncellenirken sorun oluştu.");
                }
            } 

            $response = new SuccessResponse([
                'message' => 'Öğrenci başarıyla kaydedildi.'
            ]);
            $response = $response->createSuccessResponse();
            echo json_encode($response, JSON_UNESCAPED_UNICODE);           

        }

        public static function getAllAssignments(){
            
            $user = isAdmin();
            $active = isActive(NULL, $user->id, $user->mac_address);

            $student_uuid = $_POST['assignments_by_student_uuid'];

            $db = MySQL::connect();

            $query = "SELECT user_fullname, email, avatar FROM all_students WHERE user_uuid = :student_uuid LIMIT 1";
            $prepare = $db->prepare($query);
            $prepare->execute([
                ':student_uuid' => $student_uuid
            ]);
            $student = $prepare->fetch(PDO::FETCH_ASSOC);
            if (!$student)
                throw new Exception("Veritabanında kayıtlı herhangi bir öğrenci bulunamadı.");

            $query = "SELECT assignments.id, users.user_fullname, log_files.file_name, assignments.created_date, assignments.status, assignments.comment, assignments.grade FROM assignments 
                    INNER JOIN users ON users.id = assignments.teacher_id
                    INNER JOIN log_files ON log_files.id = assignments.file_log_id
                    WHERE assignments.student_id = (SELECT id FROM users WHERE user_uuid = :student_uuid LIMIT 1) LIMIT 5000";
            $prepare = $db->prepare($query);
            $prepare->execute([
                ':student_uuid' => $student_uuid
            ]);

            $fetch = $prepare->fetchAll(PDO::FETCH_ASSOC);

            if(count($fetch) != 0 && !$fetch)
                throw new Exception("Veritabanında kayıtlı bir dosya bulunamadı.");
            
            $response = new SuccessResponse([
                'data' => $fetch,
                'user_fullname' => $student['user_fullname'],
                'email' => $student['email'],
                'avatar' => $student['avatar'],
            ]);
            $response = $response->createSuccessResponse();
            echo json_encode($response, JSON_UNESCAPED_UNICODE);           

        }

        public static function getAssignmentById(){
            
            $user = isAdmin();
            $active = isActive(NULL, $user->id, $user->mac_address);

            $student_uuid = $_POST['assignments_by_student_uuid'];
            $assignment_id = $_POST['assignment_id'];

            $fetch = self::getFileInfoById($student_uuid, $assignment_id);

            $filename = $fetch['file_name'];

            Download::FileDownload(ASSIGNMENTS_DIR . $student_uuid . '/' . $filename);         

        }

        private static function getFileInfoById($student_uuid, $assignment_id)
        {

            $db = MySQL::connect();

            $query = "SELECT log_files.file_name FROM assignments 
                            INNER JOIN users ON users.user_uuid = :student_uuid 
                            INNER JOIN log_files ON log_files.id = assignments.file_log_id
                            WHERE assignments.id = :assignment_id LIMIT 1";
            $prepare = $db->prepare($query);
            $prepare->execute([
                ':student_uuid' => $student_uuid,
                ':assignment_id' => $assignment_id
            ]);

            $fetch = $prepare->fetch(PDO::FETCH_ASSOC);
            if (!$fetch)
                throw new Exception("Veritabanında kayıtlı herhangi bir ödev bulunamadı.");

            return $fetch;
        }

    }

    class Teacher {

        public static function Controller(){
            try {
                if($_SERVER['REQUEST_METHOD'] != 'POST'){
                    $response = new ErrorResponse(405);
                    $response = $response->createErrorResponse();
                    echo json_encode($response, JSON_UNESCAPED_UNICODE);
                } 
                else if(!empty($_POST['assignments_by_teacher_uuid']))
                    self::getAllAssignments();
                else if (!empty($_POST['assignments_by_student_id']) && !empty($_POST['assignment_id']))
                    self::getAssignmentById();
                else if(!empty($_POST['add_teacher']))
                    self::add();
                else if(!empty($_POST['update_teacher_id']))
                    self::update();
                else if(!empty($_POST['delete_teacher_id']))
                    self::delete();
                else if(!empty($_POST['city']) && !empty($_POST['institution_type']))
                    Institute::getAndSendResponseInstitutes();
                else 
                    self::getAll();
            }
            catch(Exception $e){
                $response = new ErrorResponse(500, $e->getMessage()); 
                $response = $response->createErrorResponse();
                echo json_encode($response, JSON_UNESCAPED_UNICODE);
            }
        }

        public static function getAll(){
            
            $user = isAdmin();
            $active = isActive(NULL, $user->id, $user->mac_address);

            $db = MySQL::connect();

            $query = "SELECT all_teachers.id, all_teachers.user_uuid, all_teachers.user_fullname, all_teachers.email, all_teachers.user_status, all_teachers.created_date, all_teachers.is_inited, institutions.id as institution_id, institutions.institution_name, institutions.city, institutions.institution_type
                        FROM all_teachers 
                        LEFT JOIN users_bind_institutions ON users_bind_institutions.user_id = all_teachers.id
                        LEFT JOIN institutions ON users_bind_institutions.institution_id = institutions.id
                        LIMIT 5000";

            $prepare = $db->prepare($query);
            $prepare->execute();
            $fetch = $prepare->fetchAll(PDO::FETCH_ASSOC);
            if (count($fetch) != 0 && !$fetch)
                throw new Exception("Veritabanıyla ilgili bir sorun oluştu.");

            $response = new SuccessResponse([
                'data' => $fetch
            ]);
            $response = $response->createSuccessResponse();
            echo json_encode($response, JSON_UNESCAPED_UNICODE);           

        }

        public static function delete(){
            
            $user = isAdmin();
            $active = isActive(NULL, $user->id, $user->mac_address);

            $delete_teacher_id = $_POST['delete_teacher_id'];

            $db = MySQL::connect();

            $query = "DELETE FROM users WHERE id = :user_id AND group_id = :group_id LIMIT 1";
            $prepare = $db->prepare($query);
            $reslut = $prepare->execute([
                ':user_id' => $delete_teacher_id,
                ':group_id' => 2
            ]);
            
            if(!$prepare->rowCount())
                throw new Exception("Öğretmen veritabanında mevcut değil.");
            else if (!$prepare)
                throw new Exception("Veritabanıyla ilgili bir sorun oluştu.");

            $response = new SuccessResponse([
                'message' => 'Öğretmen sistemden başarıyla silindi.'
            ]);
            $response = $response->createSuccessResponse();
            echo json_encode($response, JSON_UNESCAPED_UNICODE);           

        }

        public static function update(){
            
            $user = isAdmin();
            $active = isActive(NULL, $user->id, $user->mac_address);

            $update_teacher_id = $_POST['update_teacher_id'];

            $db = MySQL::connect();

            $query = "SELECT COUNT(*) as total FROM all_users WHERE email = :email LIMIT 1";
            $prepare = $db->prepare($query);
            $prepare->execute([
                ':email' => $_POST['teacher_email'],
            ]);

            $fetch = $prepare->fetch();
            if(!$fetch)
                throw new Exception("Veri tabanıyla ilgili bir sorun oluştu. Lütfen daha sonra tekrar deneyiniz.");
            else if($fetch['total'] == 1)
                throw new Exception("Veri tabanında aynı e-posta ile kayıtlı bir kullanıcı bulunuyor.");

            $data = [
                ':teacher_id' => $update_teacher_id,
                ':group_id' => 2
            ];
            
            $update_columns = "";

            if(!empty($_POST['teacher_fullname'])){
                $data[':teacher_fullname'] = $_POST['teacher_fullname'];
                $update_columns .= "user_fullname = :teacher_fullname";
            }
            if(!empty($_POST['teacher_email'])){
                $data[':teacher_email'] = $_POST['teacher_email'];
                $update_columns .= empty($update_columns) ? "email = :teacher_email":", email = :teacher_email";
            }
            /*if(!empty($_POST['teacher_password'])){
                passwordVerify($_POST['teacher_password']);
                $data[':teacher_password'] = password_hash($_POST['teacher_password'], PASSWORD_BCRYPT);
                $update_columns .= empty($update_columns) ? "password = :teacher_password":", password = :teacher_password";
            }  */     
            if(!empty($_POST['teacher_status']) || $_POST['teacher_status'] == "0"){
                $data[':teacher_status'] = $_POST['teacher_status'];
                
                $update_columns .= empty($update_columns) ? "user_status = :teacher_status":", user_status = :teacher_status";
            }
            
            if($update_columns != ""){
            
                $query = "UPDATE users SET $update_columns WHERE id = :teacher_id AND group_id = :group_id ";
                
                $prepare = $db->prepare($query);
                $prepare->execute($data);

                if(!$prepare->rowCount())
                    throw new Exception("Öğretmen veritabanında mevcut değil.");
                else if (!$prepare)
                    throw new Exception("Veritabanıyla ilgili bir sorun oluştu.");   
            }
                 
            
            if(!empty($_POST['institution_id'])){
        
                $query = "INSERT INTO users_bind_institutions (user_id, institution_id) VALUES (:user_id, :institution_id)
                        ON DUPLICATE KEY UPDATE institution_id = :institution_id";
                $prepare = $db->prepare($query);
                $prepare = $prepare->execute([
                    ':user_id' => $update_teacher_id,
                    ':institution_id' => empty($_POST['institution_id']) ? NULL: $_POST['institution_id']
                ]);

                if(!$prepare) {
                    $db->rollBack();
                    throw new Exception("Bilgiler güncellenirken bir hata ile karşılaşıldı.");
                }

            }

            $response = new SuccessResponse([
                'message' => 'Öğretmen bilgileri başarıyla güncellendi.'
            ]);
            $response = $response->createSuccessResponse();
            echo json_encode($response, JSON_UNESCAPED_UNICODE);           

        }

        public static function add(){
            
            if(empty($_POST['teacher_fullname']))
                throw new Exception("'teacher_fullname' parametresi gereklidir.");
           
            if(empty($_POST['teacher_email']))
                throw new Exception("'teacher_email' parametresi gereklidir.");

            if(empty($_POST['teacher_status']) && $_POST['teacher_status'] != "0")
                throw new Exception("'teacher_status' parametresi gereklidir.");

            $user = isAdmin();
            $active = isActive(NULL, $user->id, $user->mac_address);

            $db = MySQL::connect();
            
            $query = "SELECT COUNT(*) as total FROM all_users WHERE email = :email LIMIT 1";
            $prepare = $db->prepare($query);
            $prepare->execute([
                ':email' => $_POST['teacher_email'],
            ]);

            $fetch = $prepare->fetch();
            if(!$fetch)
                throw new Exception("Veri tabanıyla ilgili bir sorun oluştu. Lütfen daha sonra tekrar deneyiniz.");
            else if($fetch['total'] == 1)
                throw new Exception("Veri tabanında aynı e-posta ile kayıtlı bir kullanıcı bulunuyor.");

            $query = "INSERT INTO users (user_fullname, email, user_uuid, user_status, password, group_id) VALUES (:user_fullname, :email, :user_uuid, :user_status, :password, :group_id)";
            
            $prepare = $db->prepare($query);
            $prepare->execute([
                ':user_fullname' => $_POST['teacher_fullname'],
                ':email' => $_POST['teacher_email'],
                ':user_uuid' => uuidv4(),
                ':user_status' => $_POST['teacher_status'],
                ':password' => password_hash(USER_DEFAULT_PASSWORD, PASSWORD_BCRYPT),
                ':group_id' => 2
            ]);
           
            $add_teacher_id = $db->lastInsertId();
            if(!$add_teacher_id)
                throw new Exception("Öğretmen veritabanına eklenemedi.");
            
            if(!empty($_POST['institution_id'])){
            
                $query = "INSERT INTO users_bind_institutions (user_id, institution_id) VALUES (:user_id, :institution_id)
                        ON DUPLICATE KEY UPDATE institution_id = :institution_id";
                $prepare = $db->prepare($query);
                $prepare = $prepare->execute([
                    ':user_id' => $add_teacher_id,
                    ':institution_id' => empty($_POST['institution_id']) ? NULL: $_POST['institution_id']
                ]);

                if(!$prepare)
                    throw new Exception("Bilgiler güncellenirken bir hata ile karşılaşıldı.");

            }          

            $response = new SuccessResponse([
                'message' => 'Öğretmen başarıyla kaydedildi.'
            ]);
            $response = $response->createSuccessResponse();
            echo json_encode($response, JSON_UNESCAPED_UNICODE);           

        }

        public static function getAllAssignments(){
            
            $user = isAdmin();
            $active = isActive(NULL, $user->id, $user->mac_address);

            $teacher_uuid = $_POST['assignments_by_teacher_uuid'];

            $db = MySQL::connect();

            $query = "SELECT user_fullname, email, avatar FROM all_teachers WHERE user_uuid = :teacher_uuid LIMIT 1";
            $prepare = $db->prepare($query);
            $prepare->execute([
                ':teacher_uuid' => $teacher_uuid
            ]);
            $teacher = $prepare->fetch(PDO::FETCH_ASSOC);
            if (!$teacher)
                throw new Exception("Veritabanında kayıtlı herhangi bir öğretmen bulunamadı.");

            $query = "SELECT assignments.id, users.user_fullname, users.id as user_id, log_files.file_name, assignments.created_date, assignments.status, assignments.comment, assignments.grade FROM assignments 
                    INNER JOIN users ON users.id = assignments.student_id
                    INNER JOIN log_files ON log_files.id = assignments.file_log_id
                    WHERE assignments.teacher_id = (SELECT id FROM users WHERE user_uuid = :teacher_uuid LIMIT 1) LIMIT 5000";
            $prepare = $db->prepare($query);
            $prepare->execute([
                ':teacher_uuid' => $teacher_uuid
            ]);

            $fetch = $prepare->fetchAll(PDO::FETCH_ASSOC);

            if(count($fetch) != 0 && !$fetch)
                throw new Exception("Veritabanında kayıtlı bir dosya bulunamadı.");
            
            $response = new SuccessResponse([
                'data' => $fetch,
                'user_fullname' => $teacher['user_fullname'],
                'email' => $teacher['email'],
                'avatar' => $teacher['avatar'],
            ]);
            $response = $response->createSuccessResponse();
            echo json_encode($response, JSON_UNESCAPED_UNICODE);           

        }

        public static function getAssignmentById(){
            
            $user = isAdmin();
            $active = isActive(NULL, $user->id, $user->mac_address);

            $student_id = $_POST['assignments_by_student_id'];
            $assignment_id = $_POST['assignment_id'];

            $fetch = self::getFileInfoById($student_id, $assignment_id);

            $teacher_uuid = $fetch['user_uuid'];
            $filename = $fetch['file_name'];

            Download::FileDownload(ASSIGNMENTS_DIR . $teacher_uuid . '/' . $filename);         

        }

        private static function getFileInfoById($student_id, $assignment_id)
        {

            $db = MySQL::connect();

            $query = "SELECT users.user_uuid, log_files.file_name FROM assignments 
                            INNER JOIN users ON users.id = assignments.student_id 
                            INNER JOIN log_files ON log_files.id = assignments.file_log_id
                            WHERE assignments.student_id = :student_id AND assignments.id = :assignment_id LIMIT 1";
            $prepare = $db->prepare($query);
            $prepare->execute([
                ':student_id' => $student_id,
                ':assignment_id' => $assignment_id
            ]);

            $fetch = $prepare->fetch(PDO::FETCH_ASSOC);
            if (!$fetch)
                throw new Exception("Veritabanında kayıtlı herhangi bir ödev bulunamadı.");

            return $fetch;
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

            $user = isAdmin();

            $db = MySQL::connect();

            // Öğrenci sayısı
            $query = "SELECT COUNT( * ) as total_student_count FROM all_students";
            $prepare = $db->prepare($query);
            $prepare->execute();
            $fetch = $prepare->fetch(PDO::FETCH_ASSOC);
            if ($fetch != 0 && !$fetch)
                throw new Exception("Uzak sunucuyla ilgili bir sorun ouştu.");

            $total_student_count = $fetch['total_student_count'];

            // Öğrenci sayısı
            $query = "SELECT COUNT( * ) as total_teacher_count FROM all_teachers";
            $prepare = $db->prepare($query);
            $prepare->execute();
            $fetch = $prepare->fetch(PDO::FETCH_ASSOC);
            if ($fetch != 0 && !$fetch)
                throw new Exception("Uzak sunucuyla ilgili bir sorun ouştu.");

            $total_teacher_count = $fetch['total_teacher_count'];


            // Ödev sayısı
            $query = "SELECT COUNT( * ) as total_assignment_count FROM assignments";
            $prepare = $db->prepare($query);
            $prepare->execute();
            $fetch = $prepare->fetch(PDO::FETCH_ASSOC);
            if ($fetch != 0 && !$fetch)
                throw new Exception("Uzak sunucuyla ilgili bir sorun ouştu.");

            $total_assignment_count = $fetch['total_assignment_count'];


            // Ödev gönderenler lider tablosu
            $query = "SELECT user_fullname, user_uuid, COUNT(*) as countOfAssignments FROM assignments 
                    INNER JOIN users on assignments.student_id = users.id
                    GROUP BY assignments.student_id ORDER BY countOfAssignments DESC LIMIT 5";       
            $prepare = $db->prepare($query);
            $prepare->execute();
            $fetch = $prepare->fetchAll(PDO::FETCH_ASSOC);
            if ($fetch != [] && !$fetch)
                throw new Exception("Uzak sunucuyla ilgili bir sorun ouştu.");

            $assignment_leader_table = $fetch;


            // Bir yıllık göderilen ödevlerin periyodik tablosu
            $query = "SELECT EXTRACT(YEAR_MONTH FROM assignments.created_date) Month, count(*) as total FROM assignments 
                    WHERE EXTRACT(YEAR FROM assignments.created_date) = YEAR(CURRENT_DATE) AND (YEAR(CURRENT_DATE) - 1)
                    GROUP BY EXTRACT(YEAR_MONTH FROM assignments.created_date) ORDER BY EXTRACT(YEAR_MONTH FROM assignments.created_date)";       
            $prepare = $db->prepare($query);
            $prepare->execute();
            $fetch = $prepare->fetchAll(PDO::FETCH_ASSOC);
            if ($fetch != [] && !$fetch)
                throw new Exception("Uzak sunucuyla ilgili bir sorun ouştu.");

            $one_year_period = $fetch;

            $response = new SuccessResponse([
                'total_student_count' => $total_student_count,
                'total_teacher_count' => $total_teacher_count,
                'total_assignment_count' => $total_assignment_count,
                'assignment_leader_table' => $assignment_leader_table,
                'one_year_period' => $one_year_period
            ]);
            $response = $response->createSuccessResponse();
            echo json_encode($response, JSON_UNESCAPED_UNICODE);
        }
    }
}

?>