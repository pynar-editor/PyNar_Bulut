<?php
require_once('../namespace.php');

use Lib\HTTP\ErrorResponse;

$response = new ErrorResponse(500, "Oops! Bir şeyler yanlış gitti Error: 500."); 
$response = $response->createErrorResponse();
echo json_encode($response, JSON_UNESCAPED_UNICODE);

?>