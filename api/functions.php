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
	// convert objrct to array
	$array = objectToArray($object);
	// array manipulation
	$creators       = array_intersect_key($array, array_flip($columns));
	$creator_meta   = array_diff_key($array, array_flip($columns));

	$base = 'images/upload/' . $creators['ID'] ;	
	foreach ($creator_meta as $key => $value) {
		// meta prize
		if( $key == 'prize' ){
			$g1 = glob( BASE_PATH . '/' . $base . '/prize_1.*');
			$g2 = glob( BASE_PATH . '/' . $base . '/prize_2.*');
			$g3 = glob( BASE_PATH . '/' . $base . '/prize_3.*');
			if( $creator_meta[$key]['one']['uploaded'] && $g1 ){
				$imginfo = pathinfo($g1[0]);
				$creator_meta[$key]['one']['image'] = $base . '/' . $imginfo['basename'];
			}
			if( $creator_meta[$key]['two']['uploaded'] && $g2 ){
				$imginfo = pathinfo($g2[0]);
				$creator_meta[$key]['two']['image'] = $base . '/' . $imginfo['basename'];
			}
			if( $creator_meta[$key]['three']['uploaded'] && $g3 ){
				$imginfo = pathinfo($g3[0]);
				$creator_meta[$key]['three']['image'] = $base . '/' . $imginfo['basename'];
			}
		} else if( is_array($value) && array_key_exists('uploaded', $value) ){
			$g = glob( BASE_PATH . '/' . $base . '/' . $key . '.*');
			$uploaded = $creator_meta[$key]['uploaded'];
			if( $uploaded && $g ){
				$imginfo = pathinfo($g[0]);
				$creator_meta[$key]['image'] = $base . '/' . $imginfo['basename'];
			} else {
				$image = $creator_meta[$key]['image'];
				if(!empty($image) || $image !== null) {
					$creator_meta[$key]['image'] = '';
				}
			}
		}
	}

	// serialize creator meta
	if($serialized){
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
		if(preg_match('!http://[^?#]+\.(?:jpe?g|png|gif)!Ui', ABS_URL . '/' . $value['image'])){
			$value['image'] = create_data_uri($value['image']);
		}
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