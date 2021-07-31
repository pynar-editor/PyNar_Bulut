<?php
namespace Lib\Student {

    use function Lib\UUID\uuidv4;  
    use function Lib\Auth\isLogin;
    use function Lib\Auth\isActive;
    
	use \PDO;

    use Lib\File\Download;
    use Lib\File\Upload;
    use Lib\HTTP\ErrorResponse;
    use Lib\HTTP\SuccessResponse;
    use Lib\Database\MySQL;
    use \Exception;

    function isStudent(){
        $user = isLogin();
        $active = isActive(NULL, $user->id, $user->mac_address);
        
        if($user->group_id != 1)
            throw new Exception("Yalnızca öğrenci yetkilerine sahip kullanıcılar bu işlemi gerçekleştirebilir.");
        
        return $user;
    }

    class Announcement {

        public static function Controller($limit = 5){
            try {
                if($_SERVER['REQUEST_METHOD'] != 'POST'){
                    $response = new ErrorResponse(405);
                    $response = $response->createErrorResponse();
                    echo json_encode($response, JSON_UNESCAPED_UNICODE);
                } 
                else
                    self::getAnnouncements($limit);
            }
            catch(Exception $e){
                $response = new ErrorResponse(500, $e->getMessage()); 
                $response = $response->createErrorResponse();
                echo json_encode($response, JSON_UNESCAPED_UNICODE);
            }
        }

        public static function getAnnouncements($limit){
            $user = isStudent();

            $inspected_id = 0;
            if(!empty($_POST['inspected_id']))
                $inspected_id = $_POST['inspected_id'];
            
            $db = MySQL::connect();
    
            $query = "SELECT COUNT(*) as total FROM assignments WHERE is_readed = :is_readed AND assignments.status = :status AND assignments.student_id = :student_id AND assignments.id != :inspected_id";
            $prepare = $db->prepare($query);
            $prepare->execute([
                ':is_readed' => 0,
                ':status' => 1,
                ':inspected_id' => $inspected_id,
                ':student_id' => $user->id
            ]);
            $fetch = $prepare->fetch(PDO::FETCH_ASSOC);
            if(!$fetch)
                throw new Exception("Uzak sunucuyla ilgili bir sorun oluştu.");
    
            $query = "SELECT assignments.id, all_teachers.user_fullname, log_files.file_name, institutions.institution_name, assignments.updated_date as date FROM assignments 
                    RIGHT JOIN log_files ON log_files.id = assignments.file_log_id
                    RIGHT JOIN all_teachers ON all_teachers.id = assignments.teacher_id
                    RIGHT JOIN users_bind_institutions ON users_bind_institutions.user_id = all_teachers.id
                    RIGHT JOIN institutions ON institutions.id = users_bind_institutions.institution_id
                    WHERE assignments.is_readed = :is_readed AND assignments.status = :status AND assignments.student_id = :student_id ORDER BY assignments.id DESC LIMIT $limit";
            $prepare = $db->prepare($query);
            $prepare->execute([
                ':is_readed' => 0,
                ':status' => 1,
                ':student_id' => $user->id
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

    class File {

        public static function Controller(){
            try {
                if($_SERVER['REQUEST_METHOD'] != 'POST'){
                    $response = new ErrorResponse(405);
                    $response = $response->createErrorResponse();
                    echo json_encode($response, JSON_UNESCAPED_UNICODE);
                } 
                else if(!empty($_GET['file_name']))
                    self::getFileByFileName();
                else
                    self::getAllFilesById();
            }
            catch(Exception $e){
                $response = new ErrorResponse(500, $e->getMessage()); 
                $response = $response->createErrorResponse();
                echo json_encode($response, JSON_UNESCAPED_UNICODE);
            }
        }

        public static function getAllFilesById(){
            
            $user = isStudent();
            $active = isActive(NULL, $user->id, $user->mac_address);

            $uploadFolder = UPLOADS_DIR.$user->user_uuid;

            if(file_exists($uploadFolder)){
                $scan = scandir($uploadFolder);
                $allFiles = array();
                $i = 0;

                $files = glob($uploadFolder.'/*.py');
                usort($files, function($a, $b) {
                    return filectime($b) - filectime($a);
                });

                for ($i=0; $i < count($files); $i++) 
                    $files[$i] = basename($files[$i]);


                if(count($files) < 1)
                    throw new Exception("Daha önce yüklenmiş bir dosya bulunamadı.");
                
                $response = new SuccessResponse([
                    'message' => 'Dosyalar başarıyla getirildi.',
                    'data' => $files
                ]); 
                $response = $response->createSuccessResponse();
                echo json_encode($response, JSON_UNESCAPED_UNICODE);
            }
            else
                throw new Exception("Daha önce yüklenmiş bir dosya bulunamadı.");
                       
        }

        public static function getFileByFileName(){

            if (empty($_GET['file_name']))
                throw new Exception("'file_name' parametresi gereklidir."); 

            $user = isStudent();
            
            $student_uuid = $user->user_uuid;
            $filename = $_GET['file_name'];
            
            Download::FileDownload(UPLOADS_DIR . $student_uuid . '/'.$filename);

        }

    }

    class Assignment {

        public static function Controller(){
            try {
                if($_SERVER['REQUEST_METHOD'] != 'POST'){
                    $response = new ErrorResponse(405);
                    $response = $response->createErrorResponse();
                    echo json_encode($response, JSON_UNESCAPED_UNICODE);
                } 
                else if (!empty($_POST['teacher_id']))
                    self::Upload();
                else if(!empty($_GET['assignment_id']))
                    self::getFileById();
                else
                    self::getAllAssignmentsById();
            }
            catch(Exception $e){
                $response = new ErrorResponse(500, $e->getMessage()); 
                $response = $response->createErrorResponse();
                echo json_encode($response, JSON_UNESCAPED_UNICODE);
            }
        }

        public static function getAllAssignmentsById(){
            
            $user = isStudent();

            $db = MySQL::connect();
            $query = "SELECT log_files.file_name, users.user_fullname as teacher_fullname, assignments.id, assignments.grade, assignments.comment, assignments.status FROM assignments 
                    RIGHT JOIN users ON users.id = assignments.teacher_id
                    RIGHT JOIN log_files ON log_files.id = assignments.file_log_id WHERE assignments.student_id = :student_id LIMIT 1000";
            $prepare = $db->prepare($query);
            $prepare->execute([
                ':student_id' => $user->id
            ]);
            $fetch = $prepare->fetchAll(PDO::FETCH_ASSOC);
            if(!$fetch)
                throw new Exception("Veritabanında kayıtlı herhangi bir ödev bulunamadı.");
            for ($i = 0; $i < count($fetch); $i++) {
                if($fetch[$i]['status'] == 0){      
                    $fetch[$i]['grade'] = "";
                    $fetch[$i]['comment'] = "";
                }
            }
                       
            $response = new SuccessResponse(['data' => $fetch]); 
            $response = $response->createSuccessResponse();
            echo json_encode($response, JSON_UNESCAPED_UNICODE);
        }

        public static function getFileById(){

            if (empty($_GET['assignment_id']))
                throw new Exception("'assignment_id' parametresi gereklidir."); 

            $user = isStudent();

            $db = MySQL::connect();
            
            $query = "UPDATE assignments SET is_readed = :is_readed WHERE id = :assignment_id AND student_id = :student_id LIMIT 1";
            $prepare = $db->prepare($query);
            $prepare->execute([
                ':is_readed' => 1,
                ':assignment_id' => $_GET['assignment_id'],
                ':student_id' => $user->id
            ]);           

            $fetch = self::getFileInfoById($user->id);
            
            $student_uuid = $fetch['user_uuid'];
            $filename = $fetch['file_name'];
            
            Download::FileDownload(ASSIGNMENTS_DIR . $student_uuid . '/'.$filename);

        }

        private static function getFileInfoById($id){
            $db = MySQL::connect();

            $query = "SELECT users.user_uuid, log_files.file_name FROM assignments 
                    INNER JOIN users ON users.id = :user_id
                    INNER JOIN log_files ON log_files.id = assignments.file_log_id
                    WHERE assignments.id = :assignment_id LIMIT 1";
            $prepare = $db->prepare($query);
            $prepare->execute([
                ':assignment_id' => $_GET['assignment_id'],
                ':user_id' => $id
            ]);

            $fetch = $prepare->fetch(PDO::FETCH_ASSOC);
            if(!$fetch)
                throw new Exception("Veritabanında kayıtlı bir dosya bulunamadı.");
                
            return $fetch;
        }

        public static function Upload(){

            Upload::setDirectory(ASSIGNMENTS_DIR);
            Upload::setStorageType('assignment');
            Upload::Controller();
        }
    }
}

?>