<?php
namespace Lib\Database {
	use \PDO;
	use \Exception;
	use Lib\HTTP\ErrorResponse;

	class MySQL {
		public $conn = "";
	
		public function __construct(){
			$this->conn = self::connect();
		}
	
		public static function connect() {
			try {
				$conn = new PDO('mysql:host='.DATABASE_CONFIG['host'].';dbname='.DATABASE_CONFIG['dbname'].';charset=utf8', 
					DATABASE_CONFIG['user'], 
					DATABASE_CONFIG['pass']
				);
				$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
				return $conn;
			}
			catch(Exception $e){
				$response = new ErrorResponse(500, $e->getMessage()); 
				$response = $response->createErrorResponse();
				echo json_encode($response, JSON_UNESCAPED_UNICODE);
			}
		}
	}
}

?>
