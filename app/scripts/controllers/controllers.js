define(['angular'], function(angular){
	'use strict';
	return angular.module('controllers', [
		'common.fabric',
  		'common.fabric.utilities',
  		'common.fabric.constants'
	]);
});