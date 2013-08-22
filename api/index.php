<?php
include '../config.php';
// Autoload
include 'vendor/autoload.php';
// class Exception
include 'Exception.php';
// class DB NotORM
include 'db/config.php';
// functions
include 'functions.php';

/* RESTFUL API */

Slim\Slim::registerAutoLoader();
$app = new Slim\Slim();

/* ================================ Test ================================ */

$app->get('/test', function() use($app){
	$app->response()->header('Content-Type', 'application/json');
	$imageURL = ABS_URL . "/images/upload/1375827178614/logo.png";
	$image = BASE_PATH . "/images/upload/1375827178614/logo.png";
	$ext = pathinfo($image, PATHINFO_EXTENSION);
	$mime = "image/$ext";
	$g = glob( BASE_PATH . "/images/upload/1377166547843/logo.*");
	echo json_encode(array(
		'match' => preg_match('!http://[^?#]+\.(?:jpe?g|png|gif)!Ui', $imageURL),
		// 'data_uri' => create_data_uri('images/upload/1375827178614/logo.png'),
		'glob' => array(
			'exists' => $g ? $g[0] : false,
			'info' => $g ? pathinfo($g[0]) : null
		)
	));
});

$app->get('/template/conversation', function() use($app){
	// $app->response()->header('Content-Type', 'application/json');
	echo '<pre/>';
	echo print_r(array(
		1 => array(
			data_uri(BASE_PATH . '/images/conversation/tpl-1-landscape.png', 'image/png'),
			data_uri(BASE_PATH . '/images/conversation/tpl-1-portrait.png', 'image/png')
		),
		2 => array(
			data_uri(BASE_PATH . '/images/conversation/tpl-2-landscape.png', 'image/png'),
			data_uri(BASE_PATH . '/images/conversation/tpl-2-portrait.png', 'image/png')
		),
		3 => array(
			data_uri(BASE_PATH . '/images/conversation/tpl-3-landscape.png', 'image/png'),
			data_uri(BASE_PATH . '/images/conversation/tpl-3-portrait.png', 'image/png')
		),
		4 => array(
			data_uri(BASE_PATH . '/images/conversation/tpl-4-landscape.png', 'image/png'),
			data_uri(BASE_PATH . '/images/conversation/tpl-4-portrait.png', 'image/png')
		),
		5 => array(
			data_uri(BASE_PATH . '/images/conversation/tpl-5-landscape.png', 'image/png'),
			data_uri(BASE_PATH . '/images/conversation/tpl-5-portrait.png', 'image/png')
		),
		6 => array(
			data_uri(BASE_PATH . '/images/conversation/tpl-6-landscape.png', 'image/png'),
			data_uri(BASE_PATH . '/images/conversation/tpl-6-portrait.png', 'image/png')
		)
	), 1);
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

// define columns
$columns = array('ID', 'title', 'description', 'preview', 'autosave');

/* ================================ Banner ================================ */

$app->post('/banner', function() use ($app, $db, $columns){
	$app->response()->header("Content-Type", "application/json");
	try{
		$body = $app->request()->getBody();
		$object = json_decode($body);
		// mapping object to array
		$arr = mapping_object_to_array($columns, $object);
		// insert creator
		// $creator = $db->creators()->insert(array(
		// 	'creator_id'  => $arr['creators']['ID'],
		// 	'title'       => $arr['creators']['title'],
		// 	'type'        => 'conversation',
		// 	'image'       => $arr['creators']['preview'],
		// 	'description' => $arr['creators']['description'],
		// 	'autosave'    => $arr['creators']['autosave']
		// ));
		// insert creator meta
		// if( $arr['creator_meta'] )
		// {
		// 	foreach ($arr['creator_meta'] as $key => $value) {
		// 		$creator->creator_meta()->insert(array(
		// 			// 'creator_id' => $creator['creator_id'],
		// 			'meta_key'   => $key,
		// 			'meta_value' => $value
		// 		));
		// 	}
		// }
		// send response
		echo json_encode($arr);
	} catch(Exception $e) {
		$app->halt(500, $e->getMessage());
	}
});

/* ================================ Conversation ================================ */

$templates = array(
	array(
		'square' => data_uri(BASE_PATH . '/images/conversation/tpl-1.png', 'image/png'),
		'landscape' => data_uri(BASE_PATH . '/images/conversation/tpl-1-landscape.png', 'image/png'),
		'portrait' => data_uri(BASE_PATH . '/images/conversation/tpl-1-portrait.png', 'image/png')
	),
	array(
		'square' => data_uri(BASE_PATH . '/images/conversation/tpl-2.png', 'image/png'),
		'landscape' => data_uri(BASE_PATH . '/images/conversation/tpl-2-landscape.png', 'image/png'),
		'portrait' => data_uri(BASE_PATH . '/images/conversation/tpl-2-portrait.png', 'image/png')
	),
	array(
		'square' => data_uri(BASE_PATH . '/images/conversation/tpl-3.png', 'image/png'),
		'landscape' => data_uri(BASE_PATH . '/images/conversation/tpl-3-landscape.png', 'image/png'),
		'portrait' => data_uri(BASE_PATH . '/images/conversation/tpl-3-portrait.png', 'image/png')
	),
	array(
		'square' => data_uri(BASE_PATH . '/images/conversation/tpl-4.png', 'image/png'),
		'landscape' => data_uri(BASE_PATH . '/images/conversation/tpl-4-landscape.png', 'image/png'),
		'portrait' => data_uri(BASE_PATH . '/images/conversation/tpl-4-portrait.png', 'image/png')
	),
	array(
		'square' => data_uri(BASE_PATH . '/images/conversation/tpl-5.png', 'image/png'),
		'landscape' => data_uri(BASE_PATH . '/images/conversation/tpl-5-landscape.png', 'image/png'),
		'portrait' => data_uri(BASE_PATH . '/images/conversation/tpl-5-portrait.png', 'image/png')
	),
	array(
		'square' => data_uri(BASE_PATH . '/images/conversation/tpl-6.png', 'image/png'),
		'landscape' => data_uri(BASE_PATH . '/images/conversation/tpl-6-landscape.png', 'image/png'),
		'portrait' => data_uri(BASE_PATH . '/images/conversation/tpl-6-portrait.png', 'image/png')
	)
);

$app->get('/conversation', function() use ($app, $db){
	$app->response()->header("Content-Type", "application/json");
	try {
		$creators = $db->creators()
		    		->select("*")
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
		sleep(2);
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
		if($creator){
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
			sleep(2);
			echo json_encode($data);
		}
		else {
			sleep(2);
			throw new NotFoundException("Conversation not found", 1);
		}
	}
	catch(NotFoundException $e){
		$app->halt(404, $e->getMessage());
	}
	catch(Exception $e) {
		$app->halt(500, $e->getMessage());
	}
});
$app->post('/conversation', function() use ($app, $db, $columns){
	$app->response()->header("Content-Type", "application/json");
	try{
		$body = $app->request()->getBody();
		$object = json_decode($body);
		// mapping object to array
		$arr = mapping_object_to_array($columns, $object, true);
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
					// 'creator_id' => $creator['creator_id'],
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
$app->put('/conversation/:conversationId', function($conversationId) use ($app, $db, $columns){
	$app->response()->header("Content-Type", "application/json");
	try {
		$body = $app->request()->getBody();
		$object = json_decode($body);
		// mapping object to array
		$arr = mapping_object_to_array($columns, $object, true);

		$creators = $db->creators[$conversationId];
		foreach ($arr['creators'] as $key => $value) {
			if($key == 'ID') continue;
			if($key == 'preview') $key = 'image';
			$creators[$key] = $value;
		}
		// update meta
		foreach ($arr['creator_meta'] as $key => $value) {
			$creators->creator_meta()->where(array('meta_key' => $key))->update(array('meta_value' => $value));
		}
		// send response
		echo json_encode(true);
		
	} catch (Exception $e) {
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

	$name   = $_REQUEST['name'];
	$id     = isset($_REQUEST['id']) ? $_REQUEST['id'] : null ;
	$width  = isset($_REQUEST['width']) ? $_REQUEST['width'] : null ;
	$height = isset($_REQUEST['height']) ? $_REQUEST['height'] : null ;
	$sizes  = isset($_REQUEST['size']) ? $_REQUEST['size'] : false ;
	$isCrop = isset($_REQUEST['crop']) ? $_REQUEST['crop'] : false ;

	$fileImg  = $_FILES['file']['tmp_name'];
	$fileName = $_FILES['file']['name'];
	$fileType = $_FILES['file']['type'];
	$ext      = pathinfo($fileName, PATHINFO_EXTENSION);

	$upload_path = UPLOAD_PATH;
	$upload_url  = UPLOAD_URL;

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
				'image' => $name,
				'url'   => $upload_url . '/' . $name
			);
		} else {
			// upload splash screen
			if( $sizes !== false ){
				foreach ($sizes as $key => $dimension) {
					$image = do_upload($fileImg, $ext, $name . '_' . $key , $dimension['w'], $dimension['h'], $isCrop, $upload_path);
					$response[$key] = data_uri($image->file_dst_pathname, $fileType);
				}
			} else {
				$image = do_upload($fileImg, $ext, $name, $width, $height, $isCrop, $upload_path);
				// create response
				$response = array(
					'image'   => $image->file_dst_name,
					'url'     => $upload_url . '/' . $image->file_dst_name,
					'dataURI' => data_uri($image->file_dst_pathname, $fileType)
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
