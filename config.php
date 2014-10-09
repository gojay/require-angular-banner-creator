<?php
/* AUTHORIZATION */
define('ENABLE_AUTHORIZATION', true);

/* PATH / URL */
define('BASE_PATH', dirname(__FILE__));
define('UPLOAD_PATH', BASE_PATH . '/images/upload');
define('ABS_URL', 'http://localhost:8080');
define('UPLOAD_URL', ABS_URL . '/images/upload');

define('PUSHER_APP_ID', '89723');
define('PUSHER_APP_KEY', '43fd3eef0863aaee13db');
define('PUSHER_APP_SECRET', 'fb0125d8a8073f280f4e');
define('PUSHER_PRIVATE_CHANNEL', 'private-messages');
define('PUSHER_PRESENCE_CHANNEL', 'presence-messages');
define('PUSHER_PRIVATE_EVENT', 'new_message');

/* DB Config */
$db_config = array(
	'host'     => 'localhost',
	'username' => 'root',
	'password' => '',
	'dbname'   => 'ch',
);