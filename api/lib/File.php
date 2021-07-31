<?php
namespace Lib\File {

    use function Lib\UUID\uuidv4;  
    use function Lib\Auth\isLogin;
    use function Lib\Auth\isActive;

    use DateTime;
    use Lib\HTTP\ErrorResponse;
    use Lib\HTTP\SuccessResponse;
    use Lib\Database\MySQL;
    use \Exception;

    class Download {
        public static function FileDownload($target = NULL){
            $user = isLogin();
            $active = isActive(NULL, $user->id, $user->mac_address);
            $filename = "";
            if(empty($target)){
                $uploadFolder = UPLOADS_DIR.$user->user_uuid;
                $filename = urldecode($_GET['targetFile']);
                $downloadFile = $uploadFolder.'/'.$filename;
            }else
                $downloadFile = $target;
                
            if(file_exists($downloadFile)){
                header('Content-Description: File Transfer');
                header('Content-Type: application/octet-stream');
                header('Content-Disposition: attachment; filename="' . urlencode($filename) . '"');
                header('Expires: 0');
                header('Cache-Control: must-revalidate');
                header('Pragma: public');
                header('Content-Length: ' . filesize($downloadFile));
                readfile($downloadFile);
                exit;
            }
            else
                throw new Exception("Bilinmeyen bir sorun oluştu, dosya indirilemiyor.");  
        }

        public static function Controller(){
            
            try {
                if($_SERVER['REQUEST_METHOD'] != 'POST'){
                    $response = new ErrorResponse(405);
                    $response = $response->createErrorResponse();
                    echo json_encode($response, JSON_UNESCAPED_UNICODE);
                } else if (empty($_GET['targetFile'])){
                    $response = new ErrorResponse(404, "'targetFile' parametresi gereklidir.");
                    $response = $response->createErrorResponse();
                    echo json_encode($response, JSON_UNESCAPED_UNICODE);
                } else if (empty($_POST['mac_address'])){
                    $response = new ErrorResponse(404, "Gerekli bir parametre bulunamadı. Error: Parameter-SYS1");
                    $response = $response->createErrorResponse();
                    echo json_encode($response, JSON_UNESCAPED_UNICODE);
                }
                else
                    self::FileDownload();
            }
            catch(Exception $e){
                $response = new ErrorResponse(500, $e->getMessage()); 
                $response = $response->createErrorResponse();
                echo json_encode($response, JSON_UNESCAPED_UNICODE);
            }

        }
    }

    class Upload {

        protected static $directory = NULL;
        protected static $storageType = NULL;

        public static function setStorageType($param){
            self::$storageType = $param;
        }

        public static function getStorageType($param){
            return self::$storageType;
        }

        public static function setDirectory($param){
            self::$directory = $param;
        }

        public static function getDirectory(){
            return self::$directory;
        }
        
        public static function FileUpload(){
            $user = isLogin();
            $active = isActive(NULL, $user->id, $user->mac_address);

            $mime_types = [
                'py' => [
                    'text/x-python',
                    'application/octet-stream',
                    'application/x-python-code',
                    'text/plain'
                ],
                'json' => [
                    'application/json'
                ]
            ];

            $filename = basename($_FILES['file']['name']);
            $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));

            if (array_key_exists($ext, $mime_types) && in_array($_FILES['file']['type'], $mime_types[$ext])) {
               
                $uploadFolder = self::$directory.$user->user_uuid;
                $uploadFile = $uploadFolder.'/'.$filename;

                
                if($_FILES['file']['size'] > 1024*1024*5) // 5 MB
                    throw new Exception("En fazla 5 MB boyutunda dosya yüklenebilir.");
                if(file_exists($uploadFile))
                    throw new Exception("Sunucuda aynı isimde bir dosya bulunuyor.");
                                               
                if(!file_exists($uploadFolder))
                    if(!mkdir($uploadFolder, 0777, true))
                        throw new Exception("Sunucuda kişiye özel dizin oluşturulamadı.");
                $uploadLogFilename = NULL;
                if(!empty($_FILES['logs'])){
                    $log_filename = basename($_FILES['logs']['name']);

                    $uploadFolderLogs = self::$directory.$user->user_uuid.'/logs/';
                    $uploadLogFilename = $filename.'__'.uuidv4().'__'.$log_filename;
                    $uploadFileLogs = $uploadFolderLogs.$uploadLogFilename;

                    if(file_exists($uploadFileLogs))
                        throw new Exception("Sunucuda aynı isimde bir log dosyası bulunuyor. ");

                    if(!file_exists($uploadFolderLogs))
                        if(!mkdir($uploadFolderLogs, 0777, true))
                            throw new Exception("Sunucuda kişiye özel log dizini oluşturulamadı.");

                    if($_FILES['logs']['size'] > 1024*1024*5) // 5 MB
                        throw new Exception("Üzgünüm dosya karşıya yüklenirken bir hata oluştu. ERR_LOG_MAX_SIZE.");

                    /*$data = file_get_contents($_FILES['logs']['tmp_name']);
                    $data = mb_convert_encoding($data, "UTF-8", "ISO-8859-1");   */       

                    if (!move_uploaded_file($_FILES['logs']['tmp_name'], $uploadFileLogs))
                        throw new Exception("Dosya karşıya yüklenirken bir hata oluştu.");
                }
                
                /*$data = file_get_contents($_FILES['file']['tmp_name']);
                $data = mb_convert_encoding($data, 'UTF-8', 'ISO-8859-9');*/

                if (!move_uploaded_file($_FILES['file']['tmp_name'], $uploadFile))
                    throw new Exception("Dosya karşıya yüklenirken bir hata oluştu.");

                $db = MySQL::connect();
                $query = "INSERT INTO log_files (user_id, file_name, log_file_name, upload_type, mac_address) VALUES (:user_id, :file_name, :log_file_name, :upload_type, :mac_address)";
                $prepare = $db->prepare($query);
                $result = $prepare->execute([
                    ':user_id' => $user->id,
                    ':file_name' => $filename,
                    ':log_file_name' => $uploadLogFilename,
                    ':upload_type' => self::$storageType,
                    ':mac_address' => $user->mac_address
                ]);
    
                if(!$result){
                    unlink($_FILES['file']['tmp_name'], $uploadFile);
                    throw new Exception("Dosya başarıyla yüklenemedi, günlüklere yazılamıyor.");
                }

                if(self::$storageType == "assignment"){
                    $log_id = $db->lastInsertId();
                    $query = "INSERT INTO assignments (student_id, teacher_id, file_log_id) VALUES (:student_id, :teacher_id, :file_log_id)";
                    $prepare = $db->prepare($query);
                    $prepare = $prepare->execute([
                        ':student_id' => $user->id,
                        ':teacher_id' => $_POST['teacher_id'],
                        ':file_log_id' => $log_id
                    ]);

                    if(!$result){
                        unlink($_FILES['file']['tmp_name'], $uploadFile);
                        throw new Exception("Dosya başarıyla yüklenemedi, öğretmene gönderilemiyor.");
                    }
                }
                    
                $response = new SuccessResponse(['message' => 'Dosya yüklemesi başarılı.']); 
                $response = $response->createSuccessResponse();
                echo json_encode($response, JSON_UNESCAPED_UNICODE);

            }else
                throw new Exception("Dosya formatı kabul edilmedi. Beklenen dosya formatı => ext:.py, mime-type: 'text/x-python' | application/octet-stream | application/x-python-code | text/plain");

        }

        public static function Controller(){
            
            try {
                if($_SERVER['REQUEST_METHOD'] != 'POST'){
                    $response = new ErrorResponse(405);
                    $response = $response->createErrorResponse();
                    echo json_encode($response, JSON_UNESCAPED_UNICODE);
                } else if (empty($_FILES['file'])){
                    $response = new ErrorResponse(404, "'file' parametresi gereklidir.");
                    $response = $response->createErrorResponse();
                    echo json_encode($response, JSON_UNESCAPED_UNICODE);
                } else if (empty($_POST['mac_address'])){
                    $response = new ErrorResponse(404, "Gerekli bir parametre bulunamadı. Error: Parameter-SYS1");
                    $response = $response->createErrorResponse();
                    echo json_encode($response, JSON_UNESCAPED_UNICODE);
                }
                else
                    self::FileUpload();
            }
            catch(Exception $e){
                $response = new ErrorResponse(500, $e->getMessage()); 
                $response = $response->createErrorResponse();
                echo json_encode($response, JSON_UNESCAPED_UNICODE);
            }

        }
    }

    class Uploaded {
        public static function FilesUploaded(){
            $user = isLogin();
            $active = isActive(NULL, $user->id, $user->mac_address);

            $uploadFolder = UPLOADS_DIR.$user->user_uuid;

            if(file_exists($uploadFolder)){
                $scan = scandir($uploadFolder);
                $allFiles = array();
                foreach($scan as $file) {
                    if (!is_dir($uploadFolder."/".$file) && $file != '.' && $file != '..') 
                        array_push($allFiles, $file);            
                }
                if(count($allFiles) < 1)
                    throw new Exception("Daha önce yüklenmiş bir dosya bulunamadı.");
                
                $response = new SuccessResponse([
                    'message' => 'Dosyalar başarıyla getirildi.',
                    'files' => $allFiles
                ]); 
                $response = $response->createSuccessResponse();
                echo json_encode($response, JSON_UNESCAPED_UNICODE);
            }
            else
                throw new Exception("Daha önce yüklenmiş bir dosya bulunamadı.");
            
        }

        public static function Controller(){
            
            try {
                if($_SERVER['REQUEST_METHOD'] != 'POST'){
                    $response = new ErrorResponse(405);
                    $response = $response->createErrorResponse();
                    echo json_encode($response, JSON_UNESCAPED_UNICODE);
                } else if (empty($_POST['mac_address'])){
                    $response = new ErrorResponse(404, "Gerekli bir parametre bulunamadı. Error: Parameter-SYS1");
                    $response = $response->createErrorResponse();
                    echo json_encode($response, JSON_UNESCAPED_UNICODE);
                }
                else
                    self::FilesUploaded();
            }
            catch(Exception $e){
                $response = new ErrorResponse(500, $e->getMessage()); 
                $response = $response->createErrorResponse();
                echo json_encode($response, JSON_UNESCAPED_UNICODE);
            }

        }
    }

    class Remove {
        public static function FileRemove(){
            $user = isLogin();
            $active = isActive(NULL, $user->id, $user->mac_address);
            
            $uploadFolder = UPLOADS_DIR.$user->user_uuid;
            $filename = urldecode($_GET['targetFile']);
            $removeFile = $uploadFolder.'/'.$filename;

            if(file_exists($removeFile)){

                $db = MySQL::connect();
                $query = "UPDATE log_files SET file_status = :file_status, deleted_date = now() WHERE file_name = :file_name and user_id = :user_id";
                $prepare = $db->prepare($query);
                $prepare = $prepare->execute([
                    ':file_status' => 0,
                    ':file_name' => $filename,
                    ':user_id' => $user->id
                ]);
    
                if(!$prepare)
                    throw new Exception("Dosya başarıyla silinemedi, günlüklere yazılamıyor.");
                
                if(!unlink($removeFile)){
                    $db->rollBack();
                    throw new Exception("Dosya bilinemeyen bir nedenden dolayı silinemiyor.");    
                }

                $response = new SuccessResponse(['message' => 'Dosya başarıyla silindi.']); 
                $response = $response->createSuccessResponse();
                echo json_encode($response, JSON_UNESCAPED_UNICODE);
            }
            else
                throw new Exception("Daha önce geçerli isimde yüklenmiş bir dosya bulunamadı.");
            
        }

        public static function Controller(){
            
            try {
                if($_SERVER['REQUEST_METHOD'] != 'POST'){
                    $response = new ErrorResponse(405);
                    $response = $response->createErrorResponse();
                    echo json_encode($response, JSON_UNESCAPED_UNICODE);
                } else if (empty($_GET['targetFile'])){
                    $response = new ErrorResponse(404, "'targetFile' parametresi gereklidir.");
                    $response = $response->createErrorResponse();
                    echo json_encode($response, JSON_UNESCAPED_UNICODE);
                } else if (empty($_POST['mac_address'])){
                    $response = new ErrorResponse(404, "Gerekli bir parametre bulunamadı. Error: Parameter-SYS1");
                    $response = $response->createErrorResponse();
                    echo json_encode($response, JSON_UNESCAPED_UNICODE);
                }
                else
                    self::FileRemove();
            }
            catch(Exception $e){
                $response = new ErrorResponse(500, $e->getMessage()); 
                $response = $response->createErrorResponse();
                echo json_encode($response, JSON_UNESCAPED_UNICODE);
            }

        }
    }

    class UploadLogs {
        public static function LogUpload(){
            
            $user = isLogin();
            
            $mime_types = [
                'json' => [
                    'application/json'
                ]
            ];

            $filename = $_FILES['logs']['name'];
            $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
            
            if (array_key_exists($ext, $mime_types) && in_array($_FILES['logs']['type'], $mime_types[$ext])) {
               
                $uploadFolder = UPLOADS_DIR.$user->user_uuid;
                $uploadFile = $uploadFolder.'/'.$filename;

                $log_filename = $_FILES['logs']['name'];

                $uploadFolderLogs = ANONYMOUS_LOGS.$_POST['uid'];
                $uploadLogFilename = $filename.'__'.$log_filename;
                $uploadFileLogs = $uploadFolderLogs.'/'.$uploadLogFilename;

                
                if($_FILES['logs']['size'] > 1024*1024*5) // 5 MB
                    throw new Exception("En fazla 5 MB boyutunda dosya yüklenebilir.");
                
                if(file_exists($uploadFileLogs))
                    throw new Exception("Sunucuda aynı isimde bir log dosyası bulunuyor. ");

                if(!file_exists($uploadFolderLogs))
                    if(!mkdir($uploadFolderLogs, 0777, true))
                        throw new Exception("Sunucuda kişiye özel log dizini oluşturulamadı.");

                if (!move_uploaded_file($_FILES['logs']['tmp_name'], $uploadFileLogs))
                    throw new Exception("Loglar karşıya yüklenirken bir hata oluştu.");
                
                $response = new SuccessResponse(['message' => 'Log yüklemesi başarılı.']); 
                $response = $response->createSuccessResponse();
                echo json_encode($response, JSON_UNESCAPED_UNICODE);

            }else
                throw new Exception("Dosya formatı kabul edilmedi. Beklenen dosya formatı => ext:.json, mime-type: application/json");

        }

        public static function Controller(){
            try {
                
                if($_SERVER['REQUEST_METHOD'] != 'POST'){
                    $response = new ErrorResponse(405);
                    $response = $response->createErrorResponse();
                    echo json_encode($response, JSON_UNESCAPED_UNICODE);
                } else if (empty($_FILES['logs'])){
                    $response = new ErrorResponse(404, "'logs' parametresi gereklidir.");
                    $response = $response->createErrorResponse();
                    echo json_encode($response, JSON_UNESCAPED_UNICODE);
                } else if (empty($_POST['uid'])){
                    $response = new ErrorResponse(404, "Gerekli bir parametre bulunamadı. Error: Parameter-UID-1");
                    $response = $response->createErrorResponse();
                    echo json_encode($response, JSON_UNESCAPED_UNICODE);
                }
                else
                    self::LogUpload();
            }
            catch(Exception $e){
                $response = new ErrorResponse(500, $e->getMessage()); 
                $response = $response->createErrorResponse();
                echo json_encode($response, JSON_UNESCAPED_UNICODE);
            }

        }
    }

    class Storage {
        public static function Upload(){
            Upload::setDirectory(UPLOADS_DIR);
            Upload::setStorageType('storage');
            Upload::Controller();
        }
    }
}

?>