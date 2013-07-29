define(['services/services'], function(services){
	services
		/*
		 * original iphone4  
		 *  dimension : 640 X 920
		 *  client logo : 447 X 220
		 *  CH logo : 608 X 306
		 *
		 * original iphone5  
		 *  dimension : 640 X 1096
		 *  client logo : 447 X 220
		 *  CH logo : 608 X 306
		 *
		 * original ipad  
		 *  dimension : 1536 X 2048
		 *  client logo : 1102 X 512
		 *  CH logo : 608 X 306
		*/
		.factory('SplashConfig', function(){
			return {
				white : true,
				editor: {
					logo : {
						w:null,
						h:null,
						p:null, // percent
						x:null,
						y:null
					},
					ch : {
						p:null, // percent
						x:null,
						y:null
					}
				},
				dimensions: {
					iphone4: {
						width  : 640,
						height : 920
					},
					iphone5: {
						width  : 640,
						height : 1096
					},
					ipad: {
						width  : 1536,
						height : 2048
					}
				},
				logo: {
					iphone4: {
						width  : 447,
						height : 220,
						x:97,
						y:120
					},
					iphone5: {
						width  : 447,
						height : 220,
						x:97,
						y:164
					},
					ipad: {
						width  : 1102,
						height : 512,
						x:217,
						y:768
					}
				},
				ch: {
					iphone4: {
						width  : 307,
						height : 153,
						x : 167,
						y : 608
					},
					iphone5: {
						width  : 307,
						height : 153,
						x : 167,
						y : 745
					},
					ipad: {
						width  : 608,
						height : 306,
						x : 464,
						y : 1383
					}
				},
				isDownloadDisabled: true
			};
		});
	});