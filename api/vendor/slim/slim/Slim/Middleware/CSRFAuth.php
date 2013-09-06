<?php

class CSRFAuth extends \Slim\Middleware
{
	protected $_allowedRoutes;

	const SALT = 'S3c123T';

	public function __construct()
	{
		$this->_allowedRoutes = array(
    	    'GET/ping',
    	    'GET/test',
    	    'POST/login',
    	    'POST/logout'
    	);  
	}

	public function deny_access( $message )
	{
		$this->app->response()->status(401);
		echo json_encode( $message );
	}

	public function check_allowed_routes( $route )
	{
		foreach ($this->_allowedRoutes as $routeString) {
    	    if($route == $routeString)
    		return true;
    	}
    	
    	return false;
	}

	public function check_timestamp()
	{
		
	}

	public function authenticate()
	{
		NoCSRF::check( 'csrf_token', $_POST, true, 10, false );
	}

	public function create_token()
	{
		return NoCSRF::generate( 'csrf_token' );
	}

	public function call()
	{
		$req = $this->app->request();
	
    	if($this->check_allowed_routes($req->headers('REQUEST_METHOD').$req->getResourceUri()))	
    	    $this->next->call();
    	else {

    		$token = $req->headers('AuthToken');
    		if ( $token ) {
	    		try {
	    			
	    			$token = array('csrf_token' => $token);
	    			NoCSRF::check( 'csrf_token', $token, true, 60*10, false );
    		   		$this->next->call();

	    		} catch (Exception $e) {

	    			$this->deny_access(array(
				        'class'   => 'alert-warning',
				        'message' => '<strong>You are Authorizztion has expired</strong>. ' . $e->getMessage() . ' Please logged in'
				    ));
	    			
	    		}	
    		} 
    		else {
    		    $this->deny_access(array(
			        'class'   => 'alert-warning',
			        'message' => '<strong>You are Unauthorized</strong> Please logged in'
			    ));
		    }

	    }
	}
}