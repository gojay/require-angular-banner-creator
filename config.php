<?php
/* AUTHORIZATION */
define('ENABLE_AUTHORIZATION', false);

/* PATH */
define('BASE_PATH', dirname(__FILE__));
define('UPLOAD_PATH', BASE_PATH . '/images/upload');

/* URL */
// my ubuntu URL
define('ABS_URL', 'http://angularjs/require-angular-banner-creator');
// define('ABS_URL', 'http://dev.angularjs/_learn_/require-angular-banner-creator-master');
define('UPLOAD_URL', 'images/upload');

define('PUSHER_APP_ID', '89723');
define('PUSHER_APP_KEY', '43fd3eef0863aaee13db');
define('PUSHER_APP_SECRET', 'fb0125d8a8073f280f4e');
define('PUSHER_PRIVATE_CHANNEL', 'private-messages');
// define('PUSHER_PRIVATE_CHANNEL', 'presence-message');
define('PUSHER_PRIVATE_EVENT', 'new_message');

/* DB Config */
$db_config = array(
	'host'     => 'localhost',
	'username' => 'root',
	'password' => 'root',
	'dbname'   => 'ch',
);