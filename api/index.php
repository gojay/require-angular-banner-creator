<?php
session_start();
error_reporting(E_ERROR | E_WARNING | E_PARSE | E_NOTICE); 
ini_set('display_errors','on');

include '../config.php';
include 'vendor/nocsrf/nocsrf.php';
// Autoload
include 'vendor/autoload.php';
require 'vendor/slim/slim/Slim/Middleware.php';
require 'vendor/slim/slim/Slim/Middleware/CSRFAuth.php';
// class Exception
include 'Exception.php';
// class DB NotORM
include 'db/config.php';
// functions
include 'functions.php';

/* RESTFUL API */

Slim\Slim::registerAutoLoader();
$app = new Slim\Slim();
if( ENABLE_AUTHORIZATION ){
	$app->add(new \CSRFAuth());
}

/* ================================ Test ================================ */

$app->get('/test', function() use($app, $pdo){
	$app->response()->header('Content-Type', 'application/json');

	// $table = $pdo->query("SHOW TABLE STATUS LIKE 'creators'")->fetch();
	// echo str_pad($table['Auto_increment'], 9, '0', STR_PAD_LEFT);

	echo json_encode(array(
		data_uri(BASE_PATH . '/images/facebook/fb-like1.png', 'image/png'),
		data_uri(BASE_PATH . '/images/facebook/fb-like2.png', 'image/png'),
		data_uri(BASE_PATH . '/images/facebook/fb-like3.png', 'image/png')
	));

});

/* ================================ Authorization ================================ */

$app->get('/ping', function() use($app){
	$hash = $app->request()->headers('AuthToken');
	echo json_encode($hash);
});

$app->post('/login', function() use($app){
	$request = json_decode($app->request()->getBody());
	if($request->username == 'admin' && $request->password == 'admin')
	{
		echo json_encode(array(
			'username' => $request->username,
			'token' => CSRFAuth::create_token()
		));
	}
	else {
		$app->response()->status(401);
	    echo json_encode(array(
	        'type'    => 1,
	        'message' => '<strong>Login Failure !!</strong> User not found'
	    ));
	}
});

$app->post('/logout', function() use($app){
	
});

/* ================================ Config ================================ */

$app->get('/config', function() use($app, $db_config){
	$app->response()->header('Content-Type', 'application/json');
	echo json_encode(array(
		'DB' => $db_config,
		'BASE_PATH' => BASE_PATH,
		'UPLOAD_PATH' => UPLOAD_PATH,
		'ABS_URL' => ABS_URL,
		'UPLOAD_URL' => UPLOAD_URL
	));
});

$app->get('/ID', function() use($app, $pdo){
	$app->response()->header('Content-Type', 'application/json');
	$table = $pdo->query("SHOW TABLE STATUS LIKE 'creators'")->fetch();
	echo json_encode(array(
		'ID' => str_pad($table['Auto_increment'], 9, '0', STR_PAD_LEFT)
	));
});

// define creator columns
$creator_columns = array('ID', 'title', 'description', 'preview', 'autosave');

/* ================================ Banner ================================ */

$ss_fb_image = array(
	// '1' => data_uri(BASE_PATH . '/images/facebook/mobile-fb-A4.png', 'image/png'),
	'1' => data_uri(BASE_PATH . '/images/facebook/mobile-fb-A5.png', 'image/png')
);

$banner_fb = array(
	'1' => data_uri(BASE_PATH . '/images/facebook/fb-like1.png', 'image/png'),
	'2' => data_uri(BASE_PATH . '/images/facebook/fb-like2.png', 'image/png'),
	'3' => data_uri(BASE_PATH . '/images/facebook/fb-like3.png', 'image/png')
);

$banner_badges = array(
	'1' => data_uri(BASE_PATH . '/images/badge/badge-1.png', 'image/png'),
	'2' => data_uri(BASE_PATH . '/images/badge/badge-2.png', 'image/png'),
	'3' => data_uri(BASE_PATH . '/images/badge/badge-3.png', 'image/png'),
	'4' => data_uri(BASE_PATH . '/images/badge/badge-4.png', 'image/png')
);

$banner_templates = array(
	'1' => array(
		'grass' => data_uri(BASE_PATH . '/images/banner/1-Prize-Background-Grass.jpg', 'image/jpg'),
		'feris' => data_uri(BASE_PATH . '/images/banner/1-Prize-Background-Feris.jpg', 'image/jpg'),
		'young' => data_uri(BASE_PATH . '/images/banner/1-Prize-Background-Young.jpg', 'image/jpg')
	),
	'2' => array(
		'grass' => data_uri(BASE_PATH . '/images/banner/General-Background-Grass.jpg', 'image/jpg'),
		'feris' => data_uri(BASE_PATH . '/images/banner/General-Background-Feris.jpg', 'image/jpg'),
		'young' => data_uri(BASE_PATH . '/images/banner/General-Background-Young.jpg', 'image/jpg')
	),
	'3' => array(
		'grass' => data_uri(BASE_PATH . '/images/banner/3-Prizes-Background-Grass.jpg', 'image/jpg'),
		'feris' => data_uri(BASE_PATH . '/images/banner/3-Prizes-Background-Feris.jpg', 'image/jpg'),
		'young' => data_uri(BASE_PATH . '/images/banner/3-Prizes-Background-Young.jpg', 'image/jpg')
	)
);

$app->get('/mobile/image', function() use($app, $ss_fb_image){
	$app->response()->header('Content-Type', 'application/json');
	// sleep(2);
	echo json_encode($ss_fb_image);
});

$app->get('/banner/template', function() use($app, $banner_fb, $banner_badges, $banner_templates){
	$app->response()->header('Content-Type', 'application/json');
	// sleep(2);
	echo json_encode(array(
		'fb' => $banner_fb,
		'badges' => $banner_badges,
		'tpl' => $banner_templates
	));
});

$app->get('/banner', function() use ($app, $db){
	$app->response()->header("Content-Type", "application/json");
	try {
		$creators = $db->creators()
		    		->select("*")
		    		->where('type', 'banner')
				    ->order("creator_id DESC")
				    ->limit(10);
		$data = array();
		foreach ($creators as $creator) {
		   $data[] = array(
				'ID'          => $creator['creator_id'],
				'title'       => $creator['title'],
				'preview'	  => $creator['image'],
				'description' => html_entity_decode($creator['description'], ENT_COMPAT, 'UTF-8'),
				'autosave'	  => (boolean) $creator['autosave']
			);
		}
		echo json_encode($data);
	}
	catch(Exception $e){
		$app->halt(500, $e->getMessage());
	}
});

$app->get('/banner/:bannerId', function($bannerId) use ($app, $db){
	$app->response()->header("Content-Type", "application/json");
	try {
		$creator = $db->creators[$bannerId];
		if($creator && $creator['type'] == 'banner'){
			$data = array(
				'ID'          => $creator['creator_id'],
				'title'       => $creator['title'],
				'preview'	  => $creator['image'],
				'description' => html_entity_decode($creator['description'], ENT_COMPAT, 'UTF-8'),
				'autosave'	  => (boolean) $creator['autosave']
			);
			if($creator->creator_meta()){
				foreach ($creator->creator_meta() as $meta){
					$value = @unserialize($meta['meta_value']);
					$data[$meta['meta_key']] = ($value === false) ? $meta['meta_value'] : convert_image_uri($value) ;
					// create data uri images prize
					if( $meta['meta_key'] == 'prize' ){
						if( $value['one']['uploaded'] ){
							$data['prize']['one']['image'] = create_data_uri($value['one']['image']);
						}
						if( $value['two']['uploaded'] ){
							$data['prize']['two']['image'] = create_data_uri($value['two']['image']);
						}
						if( $value['three']['uploaded'] ){
							$data['prize']['three']['image'] = create_data_uri($value['three']['image']);
						}
					} 
				}
			}

			$path = 'images/upload/'.$creator['creator_id'];
			$data['uploaded'] = array(
				'like' => create_data_uri( $path . '/banner_like.jpg'),
				'enter' => create_data_uri( $path . '/banner_enter.jpg')
			);
			// sleep(2);
			echo json_encode($data);
		}
		else {
			// sleep(2);
			throw new NotFoundException("Banner not found");
		}
	}
	catch(NotFoundException $e){
		$app->halt(404, $e->getMessage());
	}
	catch(Exception $e) {
		$app->halt(500, $e->getMessage());
	}
});

$app->post('/banner', function() use ($app, $db, $creator_columns){
	$app->response()->header("Content-Type", "application/json");
	try{
		$body = $app->request()->getBody();
		$object = json_decode($body);

		// mapping object to array
		$arr = mapping_object_to_array($creator_columns, $object, true);
		// insert creator
		$creator = $db->creators()->insert(array(
			'creator_id'  => $arr['creators']['ID'],
			'title'       => $arr['creators']['title'],
			'description' => $arr['creators']['description'],
			'type'        => 'banner',
			'image'       => $arr['creators']['preview'],
			'autosave'    => $arr['creators']['autosave']
		));
		// insert creator meta
		if( $arr['creator_meta'] )
		{
			foreach ($arr['creator_meta'] as $key => $value) {
				$creator->creator_meta()->insert(array(
					'meta_key'   => $key,
					'meta_value' => $value
				));
			}
		}
		// send response
		echo json_encode(true);
	} catch(Exception $e) {
		$app->halt(500, $e->getMessage());
	}
});
$app->put('/banner/:bannerId', function($bannerId) use ($app, $db, $creator_columns){
	$app->response()->header("Content-Type", "application/json");
	try {
		$creator = $db->creators[$bannerId];
		if($creator && $creator['type'] == 'banner') {
			$body = $app->request()->getBody();
			$object = json_decode($body);
			// mapping object to array
			$arr = mapping_object_to_array($creator_columns, $object, true);
			foreach ($arr['creators'] as $key => $value) {
				if($key == 'ID') continue;
				if($key == 'preview') $key = 'image';
				$creator[$key] = $value;
			}
			// update creator
			$creator->update();
			// update meta
			foreach ($arr['creator_meta'] as $key => $value) {
				$creator->creator_meta()->where(array('meta_key' => $key))->update(array('meta_value' => $value));
			}
			// send response
			echo json_encode(true);
		}
		else {
			throw new NotFoundException("Banner not found");
		}
	} 
	catch(NotFoundException $e){
		$app->halt(404, $e->getMessage());
	} 
	catch (Exception $e) {
		$app->halt(500, $e->getMessage());
	}
});
$app->delete('/banner/:bannerId', function($bannerId) use ($app, $db){
	$app->response()->header("Content-Type", "application/json");
	$body = $app->request()->getBody();
	$data = json_decode($body);
	$data->type = 'delete';
	echo json_encode($data);
});

/* ================================ Conversation ================================ */

$conversation_templates = array(
	'1' => array(
		'square' => data_uri(BASE_PATH . '/images/conversation/tpl-1.png', 'image/png'),
		'landscape' => data_uri(BASE_PATH . '/images/conversation/tpl-1-landscape.png', 'image/png'),
		'portrait' => data_uri(BASE_PATH . '/images/conversation/tpl-1-portrait.png', 'image/png')
	),
	'2' => array(
		'square' => data_uri(BASE_PATH . '/images/conversation/tpl-2.png', 'image/png'),
		'landscape' => data_uri(BASE_PATH . '/images/conversation/tpl-2-landscape.png', 'image/png'),
		'portrait' => data_uri(BASE_PATH . '/images/conversation/tpl-2-portrait.png', 'image/png')
	),
	'3' => array(
		'square' => data_uri(BASE_PATH . '/images/conversation/tpl-3.png', 'image/png'),
		'landscape' => data_uri(BASE_PATH . '/images/conversation/tpl-3-landscape.png', 'image/png'),
		'portrait' => data_uri(BASE_PATH . '/images/conversation/tpl-3-portrait.png', 'image/png')
	),
	'4' => array(
		'blue' => array(
			'square' => data_uri(BASE_PATH . '/images/conversation/tpl-4-blue.png', 'image/png'),
			'landscape' => data_uri(BASE_PATH . '/images/conversation/tpl-4-blue-landscape.png', 'image/png'),
			'portrait' => data_uri(BASE_PATH . '/images/conversation/tpl-4-blue-portrait.png', 'image/png')
		),
		'bluedark' => array(
			'square' => data_uri(BASE_PATH . '/images/conversation/tpl-4-dblue.png', 'image/png'),
			'landscape' => data_uri(BASE_PATH . '/images/conversation/tpl-4-dblue-landscape.png', 'image/png'),
			'portrait' => data_uri(BASE_PATH . '/images/conversation/tpl-4-dblue-portrait.png', 'image/png')
		),
		'orange' => array(
			'square' => data_uri(BASE_PATH . '/images/conversation/tpl-4-lorange.png', 'image/png'),
			'landscape' => data_uri(BASE_PATH . '/images/conversation/tpl-4-lorange-landscape.png', 'image/png'),
			'portrait' => data_uri(BASE_PATH . '/images/conversation/tpl-4-lorange-portrait.png', 'image/png')
		),
		'orangedark' => array(
			'square' => data_uri(BASE_PATH . '/images/conversation/tpl-4-dorange.png', 'image/png'),
			'landscape' => data_uri(BASE_PATH . '/images/conversation/tpl-4-dorange-landscape.png', 'image/png'),
			'portrait' => data_uri(BASE_PATH . '/images/conversation/tpl-4-dorange-portrait.png', 'image/png')
		),
		'green' => array(
			'square' => data_uri(BASE_PATH . '/images/conversation/tpl-4-green.png', 'image/png'),
			'landscape' => data_uri(BASE_PATH . '/images/conversation/tpl-4-green-landscape.png', 'image/png'),
			'portrait' => data_uri(BASE_PATH . '/images/conversation/tpl-4-green-portrait.png', 'image/png')
		),
		'greenlight' => array(
			'square' => data_uri(BASE_PATH . '/images/conversation/tpl-4-lgreen.png', 'image/png'),
			'landscape' => data_uri(BASE_PATH . '/images/conversation/tpl-4-lgreen-landscape.png', 'image/png'),
			'portrait' => data_uri(BASE_PATH . '/images/conversation/tpl-4-lgreen-portrait.png', 'image/png')
		),
		'yellow' => array(
			'square' => data_uri(BASE_PATH . '/images/conversation/tpl-4-yellow.png', 'image/png'),
			'landscape' => data_uri(BASE_PATH . '/images/conversation/tpl-4-yellow-landscape.png', 'image/png'),
			'portrait' => data_uri(BASE_PATH . '/images/conversation/tpl-4-yellow-portrait.png', 'image/png')
		),
		'yellowdark' => array(
			'square' => data_uri(BASE_PATH . '/images/conversation/tpl-4-dyellow.png', 'image/png'),
			'landscape' => data_uri(BASE_PATH . '/images/conversation/tpl-4-dyellow-landscape.png', 'image/png'),
			'portrait' => data_uri(BASE_PATH . '/images/conversation/tpl-4-dyellow-portrait.png', 'image/png')
		),
		'purple' => array(
			'square' => data_uri(BASE_PATH . '/images/conversation/tpl-4-purple.png', 'image/png'),
			'landscape' => data_uri(BASE_PATH . '/images/conversation/tpl-4-purple-landscape.png', 'image/png'),
			'portrait' => data_uri(BASE_PATH . '/images/conversation/tpl-4-purple-portrait.png', 'image/png')
		),
		'red' => array(
			'square' => data_uri(BASE_PATH . '/images/conversation/tpl-4-red.png', 'image/png'),
			'landscape' => data_uri(BASE_PATH . '/images/conversation/tpl-4-red-landscape.png', 'image/png'),
			'portrait' => data_uri(BASE_PATH . '/images/conversation/tpl-4-red-portrait.png', 'image/png')
		),
		'pink' => array(
			'square' => data_uri(BASE_PATH . '/images/conversation/tpl-4-pink.png', 'image/png'),
			'landscape' => data_uri(BASE_PATH . '/images/conversation/tpl-4-pink-landscape.png', 'image/png'),
			'portrait' => data_uri(BASE_PATH . '/images/conversation/tpl-4-pink-portrait.png', 'image/png')
		)
	),
	'5' => array(
		'blue' => array(
			'square' => data_uri(BASE_PATH . '/images/conversation/tpl-5-blue.png', 'image/png'),
			'landscape' => data_uri(BASE_PATH . '/images/conversation/tpl-5-blue-landscape.png', 'image/png'),
			'portrait' => data_uri(BASE_PATH . '/images/conversation/tpl-5-blue-portrait.png', 'image/png')
		),
		'bluedark' => array(
			'square' => data_uri(BASE_PATH . '/images/conversation/tpl-5-dblue.png', 'image/png'),
			'landscape' => data_uri(BASE_PATH . '/images/conversation/tpl-5-dblue-landscape.png', 'image/png'),
			'portrait' => data_uri(BASE_PATH . '/images/conversation/tpl-5-dblue-portrait.png', 'image/png')
		),
		'orange' => array(
			'square' => data_uri(BASE_PATH . '/images/conversation/tpl-5-lorange.png', 'image/png'),
			'landscape' => data_uri(BASE_PATH . '/images/conversation/tpl-5-lorange-landscape.png', 'image/png'),
			'portrait' => data_uri(BASE_PATH . '/images/conversation/tpl-5-lorange-portrait.png', 'image/png')
		),
		'orangedark' => array(
			'square' => data_uri(BASE_PATH . '/images/conversation/tpl-5-dorange.png', 'image/png'),
			'landscape' => data_uri(BASE_PATH . '/images/conversation/tpl-5-dorange-landscape.png', 'image/png'),
			'portrait' => data_uri(BASE_PATH . '/images/conversation/tpl-5-dorange-portrait.png', 'image/png')
		),
		'green' => array(
			'square' => data_uri(BASE_PATH . '/images/conversation/tpl-5-green.png', 'image/png'),
			'landscape' => data_uri(BASE_PATH . '/images/conversation/tpl-5-green-landscape.png', 'image/png'),
			'portrait' => data_uri(BASE_PATH . '/images/conversation/tpl-5-green-portrait.png', 'image/png')
		),
		'greenlight' => array(
			'square' => data_uri(BASE_PATH . '/images/conversation/tpl-5-lgreen.png', 'image/png'),
			'landscape' => data_uri(BASE_PATH . '/images/conversation/tpl-5-lgreen-landscape.png', 'image/png'),
			'portrait' => data_uri(BASE_PATH . '/images/conversation/tpl-5-lgreen-portrait.png', 'image/png')
		),
		'yellow' => array(
			'square' => data_uri(BASE_PATH . '/images/conversation/tpl-5-yellow.png', 'image/png'),
			'landscape' => data_uri(BASE_PATH . '/images/conversation/tpl-5-yellow-landscape.png', 'image/png'),
			'portrait' => data_uri(BASE_PATH . '/images/conversation/tpl-5-yellow-portrait.png', 'image/png')
		),
		'yellowdark' => array(
			'square' => data_uri(BASE_PATH . '/images/conversation/tpl-5-dyellow.png', 'image/png'),
			'landscape' => data_uri(BASE_PATH . '/images/conversation/tpl-5-dyellow-landscape.png', 'image/png'),
			'portrait' => data_uri(BASE_PATH . '/images/conversation/tpl-5-dyellow-portrait.png', 'image/png')
		),
		'purple' => array(
			'square' => data_uri(BASE_PATH . '/images/conversation/tpl-5-purple.png', 'image/png'),
			'landscape' => data_uri(BASE_PATH . '/images/conversation/tpl-5-purple-landscape.png', 'image/png'),
			'portrait' => data_uri(BASE_PATH . '/images/conversation/tpl-5-purple-portrait.png', 'image/png')
		),
		'red' => array(
			'square' => data_uri(BASE_PATH . '/images/conversation/tpl-5-red.png', 'image/png'),
			'landscape' => data_uri(BASE_PATH . '/images/conversation/tpl-5-red-landscape.png', 'image/png'),
			'portrait' => data_uri(BASE_PATH . '/images/conversation/tpl-5-red-portrait.png', 'image/png')
		),
		'pink' => array(
			'square' => data_uri(BASE_PATH . '/images/conversation/tpl-5-pink.png', 'image/png'),
			'landscape' => data_uri(BASE_PATH . '/images/conversation/tpl-5-pink-landscape.png', 'image/png'),
			'portrait' => data_uri(BASE_PATH . '/images/conversation/tpl-5-pink-portrait.png', 'image/png')
		)
	),
	'6' => array(
		'blue' => array(
			'square' => data_uri(BASE_PATH . '/images/conversation/tpl-6-blue.png', 'image/png'),
			'landscape' => data_uri(BASE_PATH . '/images/conversation/tpl-6-blue-landscape.png', 'image/png'),
			'portrait' => data_uri(BASE_PATH . '/images/conversation/tpl-6-blue-portrait.png', 'image/png')
		),
		'bluedark' => array(
			'square' => data_uri(BASE_PATH . '/images/conversation/tpl-6-dblue.png', 'image/png'),
			'landscape' => data_uri(BASE_PATH . '/images/conversation/tpl-6-dblue-landscape.png', 'image/png'),
			'portrait' => data_uri(BASE_PATH . '/images/conversation/tpl-6-dblue-portrait.png', 'image/png')
		),
		'orange' => array(
			'square' => data_uri(BASE_PATH . '/images/conversation/tpl-6-lorange.png', 'image/png'),
			'landscape' => data_uri(BASE_PATH . '/images/conversation/tpl-6-lorange-landscape.png', 'image/png'),
			'portrait' => data_uri(BASE_PATH . '/images/conversation/tpl-6-lorange-portrait.png', 'image/png')
		),
		'orangedark' => array(
			'square' => data_uri(BASE_PATH . '/images/conversation/tpl-6-dorange.png', 'image/png'),
			'landscape' => data_uri(BASE_PATH . '/images/conversation/tpl-6-dorange-landscape.png', 'image/png'),
			'portrait' => data_uri(BASE_PATH . '/images/conversation/tpl-6-dorange-portrait.png', 'image/png')
		),
		'green' => array(
			'square' => data_uri(BASE_PATH . '/images/conversation/tpl-6-green.png', 'image/png'),
			'landscape' => data_uri(BASE_PATH . '/images/conversation/tpl-6-green-landscape.png', 'image/png'),
			'portrait' => data_uri(BASE_PATH . '/images/conversation/tpl-6-green-portrait.png', 'image/png')
		),
		'greenlight' => array(
			'square' => data_uri(BASE_PATH . '/images/conversation/tpl-6-lgreen.png', 'image/png'),
			'landscape' => data_uri(BASE_PATH . '/images/conversation/tpl-6-lgreen-landscape.png', 'image/png'),
			'portrait' => data_uri(BASE_PATH . '/images/conversation/tpl-6-lgreen-portrait.png', 'image/png')
		),
		'yellow' => array(
			'square' => data_uri(BASE_PATH . '/images/conversation/tpl-6-yellow.png', 'image/png'),
			'landscape' => data_uri(BASE_PATH . '/images/conversation/tpl-6-yellow-landscape.png', 'image/png'),
			'portrait' => data_uri(BASE_PATH . '/images/conversation/tpl-6-yellow-portrait.png', 'image/png')
		),
		'yellowdark' => array(
			'square' => data_uri(BASE_PATH . '/images/conversation/tpl-6-dyellow.png', 'image/png'),
			'landscape' => data_uri(BASE_PATH . '/images/conversation/tpl-6-dyellow-landscape.png', 'image/png'),
			'portrait' => data_uri(BASE_PATH . '/images/conversation/tpl-6-dyellow-portrait.png', 'image/png')
		),
		'purple' => array(
			'square' => data_uri(BASE_PATH . '/images/conversation/tpl-6-purple.png', 'image/png'),
			'landscape' => data_uri(BASE_PATH . '/images/conversation/tpl-6-purple-landscape.png', 'image/png'),
			'portrait' => data_uri(BASE_PATH . '/images/conversation/tpl-6-purple-portrait.png', 'image/png')
		),
		'red' => array(
			'square' => data_uri(BASE_PATH . '/images/conversation/tpl-6-red.png', 'image/png'),
			'landscape' => data_uri(BASE_PATH . '/images/conversation/tpl-6-red-landscape.png', 'image/png'),
			'portrait' => data_uri(BASE_PATH . '/images/conversation/tpl-6-red-portrait.png', 'image/png')
		),
		'pink' => array(
			'square' => data_uri(BASE_PATH . '/images/conversation/tpl-6-pink.png', 'image/png'),
			'landscape' => data_uri(BASE_PATH . '/images/conversation/tpl-6-pink-landscape.png', 'image/png'),
			'portrait' => data_uri(BASE_PATH . '/images/conversation/tpl-6-pink-portrait.png', 'image/png')
		)
	)
);

$app->get('/conversation/template', function() use($app, $conversation_templates){
	$app->response()->header('Content-Type', 'application/json');
	// sleep(2);
	echo json_encode($conversation_templates);
});

$app->get('/conversation', function() use ($app, $db){
	$app->response()->header("Content-Type", "application/json");
	try {
		$creators = $db->creators()
		    		->select("*")
		    		->where('type', 'conversation')
				    ->order("creator_id DESC")
				    ->limit(10);
		$data = array();
		foreach ($creators as $creator) {
		   $data[] = array(
				'ID'          => $creator['creator_id'],
				'title'       => $creator['title'],
				'preview'	  => $creator['image'],
				'description' => html_entity_decode($creator['description'], ENT_COMPAT, 'UTF-8'),
				'autosave'	  => (boolean) $creator['autosave']
			);
		}
		// sleep(2);
		echo json_encode($data);
	}
	catch(Exception $e){
		$app->halt(500, $e->getMessage());
	}
});
$app->get('/conversation/:conversationId', function($conversationId) use ($app, $db){
	$app->response()->header("Content-Type", "application/json");
	try {
		$creator = $db->creators[$conversationId];
		if($creator && $creator['type'] == 'conversation'){
			$data = array(
				'ID'          => $creator['creator_id'],
				'title'       => $creator['title'],
				'preview'	  => $creator['image'],
				'description' => html_entity_decode($creator['description'], ENT_COMPAT, 'UTF-8'),
				'autosave'	  => (boolean) $creator['autosave']
			);
			if($creator->creator_meta()){
				foreach ($creator->creator_meta() as $meta){
					$value = @unserialize($meta['meta_value']);
					$data[$meta['meta_key']] = ($value === false) ? 
												preg_match('/\d/', $meta['meta_value']) ? (int) $meta['meta_value'] : $meta['meta_value'] :
												convert_image_uri($value) ;
				}
			}
			// sleep(2);
			echo json_encode($data);
		}
		else {
			// sleep(2);
			throw new NotFoundException("Conversation not found");
		}
	}
	catch(NotFoundException $e){
		$app->halt(404, $e->getMessage());
	}
	catch(Exception $e) {
		$app->halt(500, $e->getMessage());
	}
});
$app->post('/conversation', function() use ($app, $db, $creator_columns){
	$app->response()->header("Content-Type", "application/json");
	try{
		$body = $app->request()->getBody();
		$object = json_decode($body);
		// mapping object to array
		$arr = mapping_object_to_array($creator_columns, $object, true);
		// insert creator
		$creator = $db->creators()->insert(array(
			'creator_id'  => $arr['creators']['ID'],
			'title'       => $arr['creators']['title'],
			'type'        => 'conversation',
			'image'       => $arr['creators']['preview'],
			'description' => $arr['creators']['description'],
			'autosave'    => $arr['creators']['autosave']
		));
		// insert creator meta
		if( $arr['creator_meta'] )
		{
			foreach ($arr['creator_meta'] as $key => $value) {
				$creator->creator_meta()->insert(array(
					'meta_key'   => $key,
					'meta_value' => $value
				));
			}
		}
		// send response
		echo json_encode(true);
	} 
	catch(Exception $e) {
		$app->halt(500, $e->getMessage());
	}
});
$app->put('/conversation/:conversationId', function($conversationId) use ($app, $db, $creator_columns){
	$app->response()->header("Content-Type", "application/json");
	try {
		$body = $app->request()->getBody();
		$object = json_decode($body);
		// mapping object to array
		$arr = mapping_object_to_array($creator_columns, $object, true);

		$creator = $db->creators[$conversationId];
		if($creator && $creator['type'] == 'conversation'){
			foreach ($arr['creators'] as $key => $value) {
				if($key == 'ID') continue;
				if($key == 'preview') $key = 'image';
				$creator[$key] = $value;
			}
			// update creator
			$creator->update();
			// update meta
			foreach ($arr['creator_meta'] as $key => $value) {
				$creator->creator_meta()->where(array('meta_key' => $key))->update(array('meta_value' => $value));
			}
		}
		else {
			throw new NotFoundException("Conversation not found");
		}
		// send response
		echo json_encode(true);
	} 
	catch(NotFoundException $e){
		$app->halt(404, $e->getMessage());
	}
	catch (Exception $e) {
		$app->halt(500, $e->getMessage());
	}
});
$app->delete('/conversation/:conversationId', function($conversationId) use ($app, $db){
	$app->response()->header("Content-Type", "application/json");
	$body = $app->request()->getBody();
	$data = json_decode($body);
	$data->type = 'delete';
	echo json_encode($data);
});

/* ================================ Upload ================================ */

$app->post('/upload', function() use ($app) {
	$app->response()->header('Content-Type', 'application/json');

	$upload_path = UPLOAD_PATH;
	$upload_url  = UPLOAD_URL;

	$name   = $_REQUEST['name'];
	$id     = isset($_REQUEST['id']) ? $_REQUEST['id'] : null ;
	$width  = isset($_REQUEST['width']) ? $_REQUEST['width'] : null ;
	$height = isset($_REQUEST['height']) ? $_REQUEST['height'] : null ;
	$sizes  = isset($_REQUEST['size']) ? $_REQUEST['size'] : false ;
	$autoWidth = isset($_REQUEST['auto_width']) ? (boolean) $_REQUEST['auto_width'] : false ;
	$direction = isset($_REQUEST['direction']) ? $_REQUEST['direction'] : null ;

	$files = $_FILES['file'];
	$fileImg  = $files['tmp_name'];
	// $fileName = $files['name'];
	$fileType = $files['type'];

	try{
		if( $id !== null ){
			$upload_path .= '/' . $id;
			$upload_url  .= '/' . $id;
			if(!is_dir($upload_path)){
				if(false === mkdir($upload_path, 0777, true)){
					throw new Exception(sprintf('Unable to create the %s directory', $upload_path));
				}
			}
		}

		$response = array();
		// upload screenshot
		if( $width == 'original' && $height == 'original' ){
			$name = str_replace('-', '_', $name) . '.jpg';
			$target = $upload_path . DIRECTORY_SEPARATOR . $name;
			move_uploaded_file($fileImg, $target);
			// create response
			$response = array(
				'image'     => $name,
				'url'       => $upload_url . '/' . $name
			);
		} else {
			// upload splash screen
			if( $sizes !== false ){
				foreach ($sizes as $key => $dimension) {
					$image = do_upload($files, $upload_path, $name . '_' . $key , $dimension['w'], $dimension['h'], $autoWidth);
					$response[$key] = data_uri($image->file_dst_pathname, $fileType);
				}
			} else {
				$image = do_upload($files, $upload_path, $name, $width, $height, $autoWidth);
				// create response
				$response = array(
					'image'     => $image->file_dst_name,
					'height'    => $image->image_dst_y,
					'width'     => $image->image_dst_x,
					'url'       => $upload_url . '/' . $image->file_dst_name,
					'dataURI'   => data_uri($image->file_dst_pathname, $fileType),
					'direction' => $direction
				);
			}
		}
		// send response
		echo json_encode($response);
	} 
	catch(Exception $e) {
		$app->halt(500, $e->getMessage());
	}
});

$app->run();
