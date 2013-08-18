<?php
// class upload
include 'vendor/class.upload.php';

function objectToArray($d) {
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

function serializeRecursive($array, $not_in_key = null) 
{
	$data = array();
	foreach ($array as $key => $value) {
		$data[$key] = is_array($value) ? 
						($key == $not_in_key) ? $value : serialize($value) : 
						htmlentities($value, ENT_QUOTES, "utf-8");
	}
	return $data;
}  

function mapping_object_to_array( $columns, $object, $serialized = false )
{
	global $columns;

	// convert objrct to array
	$array = objectToArray($object);
	// array manipulation
	$creators       = array_intersect_key($array, array_flip($columns));
	$creator_meta   = array_diff_key($array, array_flip($columns));

	foreach ($creator_meta as $key => $value) {
		if( is_array($value) && array_key_exists('uploaded', $value) ){
			$im = UPLOAD_URL . '/' . $creators['ID'] . '/' . $key . '.png';
			$imPath = BASE_PATH . '/' . $im;
			if( $creator_meta[$key]['uploaded'] && file_exists($imPath) ){
				$creator_meta[$key]['image'] = $im;
			}
		}
	}

	// serialize creator meta
	if($creator_meta){
		$creator_meta = serializeRecursive($creator_meta);
	}
	
	// send array key value
	return array(
		'creators' => $creators,
		'creator_meta' => $creator_meta
	);
}

function data_uri($file, $mime) 
{
  	$contents = file_get_contents($file);
  	$base64 = base64_encode($contents);
  	return "data:$mime;base64,$base64";
}

function create_data_uri($image)
{
	$imagePath = BASE_PATH . "/$image";
	$ext = pathinfo($image, PATHINFO_EXTENSION);
	$mime = "image/$ext";
	return data_uri($imagePath, $mime);
}

function convert_image_uri($value)
{
	if(array_key_exists('image', $value)){
		// check valid URL
		if(preg_match('!http://[^?#]+\.(?:jpe?g|png|gif)!Ui', BASE_URL . '/' . $value['image']))
			$value['image'] = create_data_uri($value['image']);
	}
	return $value;
}

function do_upload($fileImg, $ext, $name, $width, $height, $is_crop, $upload_path)
{
	// do upload n resize
	$imagehand = new upload( $fileImg );
	$imagehand->file_dst_name_ext  = $ext;
	$imagehand->file_new_name_body = $name;
	$imagehand->file_overwrite     = true;
	$imagehand->image_resize       = true;
	// if( $is_crop ) {
	// 	$imagehand->image_ratio_crop = true;
	// 	$imagehand->image_ratio_fill = true;	
	// }
	$imagehand->image_x            = $width;
	$imagehand->image_y            = $height;
	$imagehand->image_convert      = $ext;
	$imagehand->Process($upload_path);
	$imagehand->processed;

	return $imagehand;
}