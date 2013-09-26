<?php
/* AUTHORIZATION */
define('ENABLE_AUTHORIZATION', false);

/* PATH */
define('BASE_PATH', dirname(__FILE__));
define('UPLOAD_PATH', BASE_PATH . '/images/upload');

/* URL */
// my ubuntu URL
define('ABS_URL', 'http://dev.angularjs/require-angular-banner-creator');
// define('ABS_URL', 'http://dev.angularjs/_learn_/require-angular-banner-creator-master');
define('UPLOAD_URL', 'images/upload');

/* DB Config */
$db_config = array(
	'host'     => 'localhost',
	'username' => 'root',
	'password' => 'root',
	'dbname'   => 'ch',
);