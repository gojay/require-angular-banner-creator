define(['services/services'], function(services){
	services
		.factory('BannerConfig', function(){
			return {
				text: {
					title : {
						text    : 'Company Name, Company Contest, Contest',
						limit   : 50,
						counter : 50
					},
					description : {
						text    : 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sit, fugit hic tempora dolorem non sunt incidunt velit quam distinctio cum.',
						limit   : 225,
						counter : 255
					},
					logo : {
						hide: false,
						w : 0,
						h : 0
					},
					price : {
						title: 'This Month\'s Prizes',
						one: {
							text   : 'Enter prize 1 description',
							limit  : 75,
							counter: 75
						},
						two: {
							text    : 'Enter prize 2 description',
							limit   : 75,
							counter : 75
						},
						three: {
							text    : 'Enter prize 3 description',
							limit   : 75,
							counter : 75
						}
					}
				},
				dimensions : {
					'tpl-0' : {
						logo : {
							pos : {
								placeholder:{
									x:20,
									y:5
								},
								image:{
									x:25,
									y:10
								}
							},
							image : {
								width:122,
								height:80
							}
						},
						background : {
							width:810,
							height:381
						}
					},
					'tpl-1' : {
						logo : {
							pos : {
								placeholder:{
									x:20,
									y:5
								},
								image:{
									x:25,
									y:10
								}
							},
							image : {
								width:122,
								height:80
							}
						},
						background : {
							width:810,
							height:381
						},
						price : {
							width:340,
							height:183
						}
					},
					'tpl-2' : {
						logo : {
							pos : {
								placeholder:{
									x:20,
									y:5
								},
								image:{
									x:25,
									y:10
								}
							},
							image : {
								width:122,
								height:80
							}
						},
						background : {
							width:810,
							height:339
						},
						price : {
							width:203,
							height:130
						}
					},
					'tpl-3' : {
						logo : {
							pos : {
								placeholder:{
									x:20,
									y:5
								},
								image:{
									x:45,
									y:10
								}
							},
							image : {
								width:122,
								height:80
							}
						},
						background : {
							width:770,
							height:315
						},
						price : {
							width:250,
							height:250
						}
					},
					'tpl-4' : {
						logo : {
							pos : {
								placeholder:{
									x:129,
									y:9
								},
								image:{
									x:134,
									y:14
								}
							},
							image : {
								width:226,
								height:56
							}
						},
						background : {
							width:810,
							height:339
						},
						price : {
							width:208,
							height:109
						}
					},
					'tpl-5' : {
						logo : {
							pos : {
								placeholder:{
									x:79,
									y:9
								},
								image:{
									x:84,
									y:14
								}
							},
							image : {
								width:226,
								height:56
							}
						},
						background : {
							width:810,
							height:339
						},
						price : {
							width:170,
							height:68
						}
					},
					'tpl-6' : {
						logo : {
							pos : {
								placeholder:{
									x:129,
									y:9
								},
								image:{
									x:134,
									y:14
								}
							},
							image : {
								width:226,
								height:56
							}
						},
						background : {
							width:810,
							height:339
						},
						price : {
							width:137,
							height:68
						}
					}
				}
			};
		})
		.factory('BannerService', ['$resource',
			function($resource){
				return $resource('api/banner/:id', {}, {
					update : {
						method: 'PUT'
					},
					remove: {
						method: 'DELETE'
					}
				});
			}
		])
		.factory('MultiBannerLoader', ['BannerService', '$q',
			function(BannerService, $q){
				return function(){
					var deferred = $q.defer();
					BannerService.query(function(data){
						deferred.resolve(data);
					}, function(err){
						deferred.reject('Unable to fetch banners' + err);
					});
					return deferred.promise;
				};
			}
		])
		.factory('BannerLoader', ['BannerService', '$route', '$q',
			function(BannerService, $route, $q){
				return function(){
					var deferred = $q.defer();
					BannerService.get({id : $route.current.params.bannerId}, function(data){
						deferred.resolve(data);
					}, function(err){
						deferred.reject('Unable to fetch banner '  + $route.current.params.bannerId + err);
					});
					return deferred.promise;
				};
			}
		]);
});