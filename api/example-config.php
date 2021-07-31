<?php

define('BASE_DIR', __DIR__);
define('CHUNKS_DIR', __DIR__.'/chunks/');
define('ANONYMOUS_LOGS', __DIR__.'/chunks/files/anonymous_logs/');
define('UPLOADS_DIR', __DIR__.'/chunks/files/uploads/');
define('ASSIGNMENTS_DIR', __DIR__.'/chunks/files/assignments/');
define('SESSIONS_DIR', __DIR__.'/chunks/sessions/');
define('NO_LOGGING_SESSION_FILE', '__no-logging');

define('DATABASE_CONFIG', [
    'host' => 'host',
    'user' => 'user',
    'pass' => 'pass',
    'dbname' => 'dbname'   
]);

define('MAIL_CONFIG', [
    'host' => 'host',
    'user' => 'user',
    'pass' => 'pass'
]);

define('JWT_SECRET', 'JWT_SECRET');

?>
