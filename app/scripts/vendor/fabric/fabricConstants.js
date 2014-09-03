angular.module('common.fabric.constants', [])

.service('FabricConstants', [function() {

	var objectDefaults = {
		rotatingPointOffset: 20,
		padding: 0,
		borderColor: 'EEF6FC',
		cornerColor: 'rgba(64, 159, 221, 1)',
		cornerSize: 10,
		transparentCorners: false,
		hasRotatingPoint: true,
		centerTransform: true,
		hasControls: false
	};

	return {

		presetSizes: [
			// {
			// 	name: 'Portrait (8.5 x 11)',
			// 	height: 1947,
			// 	width: 1510
			// },
			// {
			// 	name: 'Landscape (11 x 8.5)',
			// 	width: 1947,
			// 	height: 1510
			// },
			// {
			// 	name: 'Business Card (3.5 x 2)',
			// 	height: 368,
			// 	width: 630
			// },
			// {
			// 	name: 'Postcard (6 x 4)',
			// 	height: 718,
			// 	width: 1068
			// },
			// {
			// 	name: 'Content/Builder Product Thumbnail',
			// 	height: 400,
			// 	width: 760
			// },
			// {
			// 	name: 'Badge',
			// 	height: 400,
			// 	width: 400
			// },
			// {
			// 	name: 'Facebook Profile Picture',
			// 	height: 300,
			// 	width: 300
			// },
			// {
			// 	name: 'Facebook Cover Picture',
			// 	height: 315,
			// 	width: 851
			// },
			// {
			// 	name: 'Facebook Photo Post (Landscape)',
			// 	height: 504,
			// 	width: 403
			// },
			// {
			// 	name: 'Facebook Photo Post (Horizontal)',
			// 	height: 1008,
			// 	width: 806
			// },
			// {
			// 	name: 'Facebook Full-Width Photo Post',
			// 	height: 504,
			// 	width: 843
			// },
			{
				name: 'A4 200 PPI (1654x2339)',
				type  : 'a4',
				ppi   : 200,
				height: 2339,
				width: 1654
			},
			{
				name: 'A4 300 PPI (2480x3508)',
				type  : 'a4',
				ppi   : 300,
				height: 3508,
				width : 2480
			},
			{
				name: 'A5 300 PPI (1167x1653)',
				type  : 'a5',
				ppi   : 300,
				height: 1653,
				width : 1167
			}
		],

		fonts: [
			{ name: 'Arial' },
			{ name: 'Myriad Pro' },
			{ name: 'Croissant One' },
			{ name: 'Architects Daughter' },
			{ name: 'Emblema One' },
			{ name: 'Graduate' },
			{ name: 'Hammersmith One' },
			{ name: 'Oswald' },
			{ name: 'Oxygen' },
			{ name: 'Krona One' },
			{ name: 'Indie Flower' },
			{ name: 'Courgette' },
			{ name: 'Gruppo' },
			{ name: 'Ranchers' }
		],

		shapeCategories: [
			{
				name: 'Popular Shapes',
				shapes: [
					'arrow6',
					'bubble4',
					'circle1',
					'rectangle1',
					'star1',
					'triangle1'
				]
			},
			{
				name: 'Simple Shapes',
				shapes: [
					'circle1',
					'heart1',
					'rectangle1',
					'triangle1',
					'star1',
					'star2',
					'star3',
					'square1'
				]
			},
			{
				name: 'Arrows & Pointers',
				shapes: [
					'arrow1',
					'arrow9',
					'arrow3',
					'arrow6',
				]
			},
			{
				name: 'Bubbles & Balloons',
				shapes: [
					'bubble5',
					'bubble4'
				]
			},
			{
				name: 'Check Marks',
				shapes: [

				]
			},
			{
				name: 'Badges',
				shapes: [
					'badge1',
					'badge2',
					'badge4',
					'badge5',
					'badge6'
				]
			}
		],

		JSONExportProperties: [
			'height',
			'width',
			'background',
			'objects',

			'originalHeight',
			'originalWidth',
			'originalScaleX',
			'originalScaleY',
			'originalLeft',
			'originalTop',

			'lineHeight',
			'lockMovementX',
			'lockMovementY',
			'lockScalingX',
			'lockScalingY',
			'lockUniScaling',
			'lockRotation',
			'lockObject',
			'id',
			'isTinted',
			'filters'
		],

		shapeDefaults: angular.extend({
			fill: '#0088cc'
		}, objectDefaults),

		textDefaults: angular.extend({
			originX: 'left',
			scaleX: 1,
			scaleY: 1,
			fontFamily: 'Arial',
			fontSize: 40,
			fill: '#434343',
			textAlign: 'left',
			strokeWidth: 1,
			stroke: '#454545',
			keepCenterH: false
		}, objectDefaults),

		CustomAttributes: {
			'a4': {
				200 : {
					'text':{
						app : {
							size: 52,  // 65 * 3
							left: 674, // 314 * 3
							top: 266   // 120 * 3
						},
						people: {
							left:{
								size: 28,  // 43 * 3
								left: 414, // 201 * 3
								top: 1691   // 751 * 3
							},
							right:{
								size: 28,  // 43 * 3
								left: 1174, // 201 * 3
								top: 1691   // 751 * 3
							}
						}
					},
					'ss': {
						width: 430, 
						height: 760,
						left: 214,
						top : 560
					},
					'qr': {
						'iphone': {
							width : 180,
							height: 180,
							top : 1240, // 1836
							left: 882 // 1306
						},
						'android': {
							width: 180,
							height: 180,
							top : 1240, // 1836
							left: 1283 // 1906
						}
					},
					'people': {
						left: {
							width : 285, // 285 
							height: 285, // 285
							top : 1653, // 2506
							left: 99 // 176 52
						},
						right: {
							width : 285, // 285
							height: 285, // 285
							top : 1653, // 2506 751
							left: 860 // 1316 394
						}
					}
				},

				300: {
					'text':{
						app : {
							size: 95, // 65 * 3
							left: 964, // 314 * 3
							top: 360   // 120 * 3
						},
						people: {
							left:{
								size: 42,  // 43 * 3
								left: 621, // 201 * 3
								top: 2537  // 751 * 3
							},
							right:{
								size: 42,   // 43 * 3
								left: 1761, // 201 * 3
								top: 2537   // 751 * 3
							}
						}
					},
					'ss': {
						width: 640, // 427
						height: 1138, // 758
						left: 324, // 216
						top : 842 // 561
					},
					'qr': {
						'iphone': {
							width: 280,
							height: 280,
							top : 1852, // 1836
							left: 1316 // 1306
						},
						'android': {
							width: 280,
							height: 280,
							top : 1852, // 1836
							left: 1914 // 1906
						}
					},
					'people': {
						left: {
							width : 428, // 428 
							height: 428, // 428
							top : 2479, // 2506
							left: 151 // 176 52
						},
						right: {
							width : 428, // 428
							height: 428, // 428
							top : 2479, // 2506 751
							left: 1290 // 1316 394
						}
					}
				}
			},
			'a5': {
				300: {
					'text':{
						app : {
							size: 46, // 65 * 3
							left: 448, // 314 * 3
							top : 188   // 120 * 3
						},
						people: {
							left:{
								size: 18,  // 43 * 3
								left: 286, // 201 * 3
								top: 1203  // 751 * 3
							},
							right:{
								size: 18,   // 43 * 3
								left: 828, // 201 * 3
								top: 1203   // 751 * 3
							}
						}
					},
					'ss': {
						width: 302,
						height: 536,
						left: 152,
						top : 396
					},
					'qr': {
						'iphone': {
							width : 130,
							height: 130,
							top : 875, // 1836
							left: 615 // 1306
						},
						'android': {
							width: 130,
							height: 130,
							top : 875, // 1836
							left: 903 // 1906
						}
					},
					'people': {
						left: {
							width : 205, // 220 
							height: 205, // 220
							top : 1167, // 0
							left: 69 // 176 52
						},
						right: {
							width : 205, // 205
							height: 205, // 205
							top : 1167, // 0 751
							left: 605 // 1316 394
						}
					}
				}
			}
		}

	};

}]);
