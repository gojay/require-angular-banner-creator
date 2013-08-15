<?php
// Autoload
include 'vendor/autoload.php';
// class upload
include 'vendor/class.upload.php';
// class Exception
include 'Exception.php';
// class DB NotORM
// include 'db/config.php';

/* Functions */

function _objectToArray($d) {
	if (is_object($d)) {
		// Gets the properties of the given object
		// with get_object_vars function
		$d = get_object_vars($d);
	}

	if (is_array($d)) {
		/*
		* Return array converted to object
		* Using __FUNCTION__ (Magic constant)
		* for recursive call
		*/
		return array_map(__FUNCTION__, $d);
	}
	else {
		// Return array
		return $d;
	}
}

function objectToArray($obj, $serialized = false) 
{
	// $array = json_decode(json_encode($json), true);
	$array = _objectToArray($obj);

	$data = array();
	foreach ($array as $key => $value) {
		$data[$key] = $serialized
        				? (is_array($value) ? serialize($value) : htmlentities($value, ENT_QUOTES, "utf-8"))
        				: (is_array($value) ? $value : htmlentities($value, ENT_QUOTES, "utf-8")) ;
	}

	return $data;
}  

/* RESTFUL API */

Slim\Slim::registerAutoLoader();
$app = new Slim\Slim();

$template_dir = dirname(dirname(__FILE__)) . '/assets/template';

$app->get('/template/conversation', function() use($app, $template_dir){
	// $app->response()->header('Content-Type', 'application/json');
	echo '<pre/>';
	echo print_r(array(
		1 => array(
			data_uri($template_dir . '/conversation/tpl-1-landscape.png', 'image/png'),
			data_uri($template_dir . '/conversation/tpl-1-portrait.png', 'image/png')
		),
		2 => array(
			data_uri($template_dir . '/conversation/tpl-2-landscape.png', 'image/png'),
			data_uri($template_dir . '/conversation/tpl-2-portrait.png', 'image/png')
		),
		3 => array(
			data_uri($template_dir . '/conversation/tpl-3-landscape.png', 'image/png'),
			data_uri($template_dir . '/conversation/tpl-3-portrait.png', 'image/png')
		),
		4 => array(
			data_uri($template_dir . '/conversation/tpl-4-landscape.png', 'image/png'),
			data_uri($template_dir . '/conversation/tpl-4-portrait.png', 'image/png')
		),
		5 => array(
			data_uri($template_dir . '/conversation/tpl-5-landscape.png', 'image/png'),
			data_uri($template_dir . '/conversation/tpl-5-portrait.png', 'image/png')
		),
		6 => array(
			data_uri($template_dir . '/conversation/tpl-6-landscape.png', 'image/png'),
			data_uri($template_dir . '/conversation/tpl-6-portrait.png', 'image/png')
		)
	), 1);
});

$dummy = array(
	1 => array(
		'name' => 'dummy-1',
		'data' => array(
			'logo' => array(
				'hide' => false,
				'placeholder' => true,
				'position' => array(
					'x' => 18,
					'y' => 78
				),
				'image' => 'assets/img/dummy/165x45.png'
			),
			'spot1' => array(
				'hide'=> false,
				'placeholder'=> true,
				'clip'=> 'square',
				'position'=> array(
					'x' => 65,
					'y' => 266
				),
				'image'=> 'assets/img/dummy/70x70.png'
			),
			'spot2' => array(
				'hide'=> false,
				'placeholder'=> true,
				'clip'=> 'square',
				'position'=> array(
					'x' => 266,
					'y' => 266
				),
				'image'=> 'assets/img/dummy/70x70.png'
			),
			'align'=> array(
				'x'=> 'none',
				'y'=> 'none'
			),
			'images' => array(
				'empty'    => true,
				'count'    => 0,
				'finished' => 0
			),
			'selected' => 0
		)
	),
	2 => array(
		'name' => 'dummy-2',
		'data' => array(
			'logo' => array(
				'hide' => false,
				'placeholder' => true,
				'position' => array(
					'x' => 109,
					'y' => 86
				),
				'image' => 'assets/img/dummy/165x45.png'
			),
			'spot1' => array(
				'hide'=> false,
				'placeholder'=> true,
				'clip'=> 'circle',
				'position'=> array(
					'x' => 30,
					'y' => 209
				),
				'image'=> 'assets/img/dummy/70x70.png'
			),
			'spot2' => array(
				'hide'=> false,
				'placeholder'=> true,
				'clip'=> 'circle',
				'position'=> array(
					'x' => 293,
					'y' => 209
				),
				'image'=> 'assets/img/dummy/70x70.png'
			),
			'align'=> array(
				'x'=> 'x1',
				'y'=> 'x2'
			),
			'images' => array(
				'empty'    => true,
				'count'    => 0,
				'finished' => 0
			),
			'selected' => 2
		)
	),
	3 => array(
		'name' => 'dummy-1',
		'data' => array(
			'logo' => array(
				'hide' => false,
				'placeholder' => true,
				'position' => array(
					'x' => 18,
					'y' => 78
				),
				'image' => 'assets/img/dummy/165x45.png'
			),
			'spot1' => array(
				'hide'=> false,
				'placeholder'=> true,
				'clip'=> 'square',
				'position'=> array(
					'x' => 65,
					'y' => 266
				),
				'image'=> 'assets/img/dummy/70x70.png'
			),
			'spot2' => array(
				'hide'=> false,
				'placeholder'=> true,
				'clip'=> 'square',
				'position'=> array(
					'x' => 266,
					'y' => 266
				),
				'image'=> 'assets/img/dummy/70x70.png'
			),
			'align'=> array(
				'x'=> 'none',
				'y'=> 'none'
			),
			'images' => array(
				'empty'    => true,
				'count'    => 0,
				'finished' => 0
			),
			'selected' => 3
		)
	),
);

$app->get('/conversation', function() use ($app, $dummy){
	$app->response()->header("Content-Type", "application/json");
	try {
		echo json_encode($dummy);
	}
	catch(Exception $e){
		$app->halt(500, $e->getMessage());
	}
});
$app->get('/conversation/:bannerId', function($bannerId) use ($app, $dummy){
	$app->response()->header("Content-Type", "application/json");
	try {
		$data = $dummy[$bannerId];
		echo json_encode($data);
	}
	catch(Exception $e){
		$app->halt(500, $e->getMessage());
	}
});

$app->post('/conversation', function() use ($app){
	$app->response()->header("Content-Type", "application/json");
	$body = $app->request()->getBody();
	$json = json_decode($body);
	$json->type = 'post';
	$data = objectToArray($json, true);
	echo json_encode($data);
});

$app->put('/conversation/:bannerId', function($bannerId) use ($app){
	$app->response()->header("Content-Type", "application/json");
	$body = $app->request()->getBody();
	$data = json_decode($body);
	$data->type = 'put';
	echo json_encode($data);
});

$app->delete('/conversation/:bannerId', function($bannerId) use ($app){
	$app->response()->header("Content-Type", "application/json");
	$body = $app->request()->getBody();
	$data = json_decode($body);
	$data->type = 'delete';
	echo json_encode($data);
});

/**========================================================================
 * ================================ Upload ================================
 * ======================================================================== */

function do_upload($upload_dir, $fileImg, $ext, $name, $width, $height, $isCrop)
{
	// do upload n resize
	$imagehand = new upload( $fileImg );
	$imagehand->file_dst_name_ext  = $ext;
	$imagehand->file_new_name_body = $name;
	$imagehand->file_overwrite     = true;
	$imagehand->image_resize       = true;
	// if( $isCrop ) {
	// 	$imagehand->image_ratio_crop = true;
	// 	$imagehand->image_ratio_fill = true;	
	// }
	$imagehand->image_x            = $width;
	$imagehand->image_y            = $height;
	$imagehand->image_convert      = $ext;
	$imagehand->Process($upload_dir);
	$imagehand->processed;

	return $imagehand;
}

function data_uri($file, $mime) {
  	$contents=file_get_contents($file);
  	$base64=base64_encode($contents);
  	return "data:$mime;base64,$base64";
}

$upload_dir = dirname(__FILE__) . DIRECTORY_SEPARATOR . 'img/uploads';
$upload_url = 'http://' . $_SERVER['SERVER_NAME'] . $_SERVER['REQUEST_URI'] . '/../img/uploads';

$app->get('/config', function() use($app, $upload_dir, $upload_url){
	// $app->response()->header('Content-Type', 'application/json');
	echo '<pre/>';
	echo print_r(array(
		'dir' => $upload_dir,
		'url' => $upload_url,
		'data_uri' => array(
			 data_uri($upload_dir . '/conversation/tpl-1.png', 'image/png'),
			 data_uri($upload_dir . '/conversation/tpl-2.png', 'image/png'),
			 data_uri($upload_dir . '/conversation/tpl-3.png', 'image/png'),
			 data_uri($upload_dir . '/conversation/tpl-4.png', 'image/png'),
			 data_uri($upload_dir . '/conversation/tpl-5.png', 'image/png'),
			 data_uri($upload_dir . '/conversation/tpl-6.png', 'image/png')
		)
	), 1);
});

$app->post('/upload', function() use ($app, $upload_dir, $upload_url) {
	$app->response()->header('Content-Type', 'application/json');

	$name   = $_REQUEST['name'];
	$width  = isset($_REQUEST['width']) ? $_REQUEST['width'] : null ;
	$height = isset($_REQUEST['height']) ? $_REQUEST['height'] : null ;
	$sizes  = isset($_REQUEST['size']) ? $_REQUEST['size'] : false ;
	$isCrop = isset($_REQUEST['crop']) ? $_REQUEST['crop'] : false ;

	$fileImg  = $_FILES['file']['tmp_name'];
	$fileName = $_FILES['file']['name'];
	$fileType = $_FILES['file']['type'];
	$ext      = pathinfo($fileName, PATHINFO_EXTENSION);

	try{
		$response = array();
		// upload screenshot
		if( $width == 'original' && $height == 'original' ){
			$name = str_replace('-', '_', $name) . '.jpg';
			$target = $upload_dir . DIRECTORY_SEPARATOR . $name;
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
					$image = do_upload($upload_dir, $fileImg, $ext, $name . '_' . $key , $dimension['w'], $dimension['h'], $isCrop);
					$response[$key] = data_uri($image->file_dst_pathname, $fileType);
				}
			} else {
				$image = do_upload($upload_dir, $fileImg, $ext, $name, $width, $height, $isCrop);
				// create response
				$response = array(
					'crop' => $isCrop,
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
