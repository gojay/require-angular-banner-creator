<?php

class CSRFAuth extends \Slim\Middleware
{
	protected $_allowedRoutes;

	static $max_time = 3600; // 10 minutes

	static $tokenName = 'auth_token';

	public function __construct()
	{
		$this->_allowedRoutes = array(
    	    // 'GET/ping',
    	    // 'GET/test',
    	    // 'GET/ID',
    	    // 'GET/banner',
    	    // 'GET/banner/template',
    	    'POST/pusher/auth/socket',
    	    'POST/pusher/auth/presence',
    	    'POST/login',
    	    'POST/logout'
    	);  
	}

	public static function create_token()
	{
		// NoCSRF::enableOriginCheck();
		return NoCSRF::generate( self::$tokenName );
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

	public function call()
	{
		$req = $this->app->request();
	
    	if($req->headers('REQUEST_METHOD') == "OPTIONS" || $this->check_allowed_routes($req->headers('REQUEST_METHOD').$req->getResourceUri()))	
    	    $this->next->call();
    	else 
    	{
    		$token = $req->headers('X-Auth-Token');
    		if ( $token ) 
    		{
	    		try {
	    			
	    			$origin = array(self::$tokenName => $token);
	    			$authorized = NoCSRF::check( self::$tokenName, $origin, true, self::$max_time, true );
    		   		// if( !$authorized ) throw new Exception( 'You are not authorized' );  
    		   		  		   		
    		   		$this->next->call();

	    		} catch (Exception $e) {

	    			$this->deny_access(array(
				        'type'    => 0,
				        'info' => array(
				        	'token' => $token,
				        	'SESSION' => $_SESSION
				        ),
				        'message' => '<strong>' . $e->getMessage() . ' </strong>. Please logged in'
				    ));
	    			
	    		}	
    		} 
    		else {
    		    $this->deny_access(array(
			        'type'    => 0,
			        'info'	  => 'Token is empty',
			        'message' => '<strong>You are not authorized</strong> Please logged in'
			    ));
		    }
	    }
	}
}