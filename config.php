<?php

// PATH
define('BASE_PATH', dirname(__FILE__));
define('UPLOAD_PATH', BASE_PATH . '/images/upload');
// URL
define('ABS_URL', 'bannercreator/');
// define('UPLOAD_URL', ABS_URL . '/images/upload');
define('UPLOAD_URL', 'images/upload');
// DB Config
$db_config = array(
	'host'     => 'localhost',
	'username' => 'root',
	'password' => 'root',
	'dbname'   => 'ch',
);