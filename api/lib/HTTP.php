<?php
namespace Lib\HTTP {

    class Response {

        protected $statusCode = 404;

        public function __construct($statusCode=404){
            header("HTTP/1.1 ".$statusCode." ".$this->HttpStatus($statusCode));
            header("Content-Type: application/json; charset=UTF-8");
            $this->statusCode = $statusCode;
        }
        
        protected function HttpStatus($code) {
            $status = array(
                200 => 'İşleminiz başarıyla tamamlandı.',
                401 => 'Giriş yapmuş bir kullanıcı bulunamadı.',  
                404 => 'Oops! Herhangi bir şey bulunamadı',  
                405 => $_SERVER['REQUEST_METHOD'].' metodu geçerli uç nokta için desteklenmiyor.',  
                415 => 'Desteklenmeyen medya formatı tespit edildi.',  
                500 => 'Sunucu içerisinde bir hata meydana geldi.');
                
            return $status[$code] ? $status[$code] : $status[500];
        }   
    }

    class SuccessResponse extends Response {

        private $result = [];

        public function __construct($result=[]) {
            parent::__construct(200);
            $this->result = $result;
        }
        
        public function createSuccessResponse(){
            return [
                "ok" => true,
                "result" => $this->result
            ];
        }
    }

    class ErrorResponse extends Response {

        private $description = [];

        public function __construct($statusCode=404, $description=NULL) {
            parent::__construct($statusCode);
            
            if($description == NULL)
                return $this->description = $this->HttpStatus($this->statusCode);
            
            $this->description = $description;
        }
        
        public function createErrorResponse(){
            return [
                "ok" => false,
                "err_code" => $this->statusCode,
                "description" => $this->description
            ];
            
        }
    }
    }
    ?>