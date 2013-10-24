define([
	'controllers/controllers',
	'raphael',
], function(controllers, Raphael){
	controllers.controller('RaphaelController', ['$scope',
		function($scope){
			$('a.handler-left').switchClass('visible', 'invisible', 0);
			$('a.handler-right').switchClass('visible', 'invisible', 0);

			/* RaphaelJS */

			var selectedEl = null;
		    var paper = Raphael('holder', 810, 810);

		    /* rounded square */

		    var rsquare = paper.set();
			paper.importSVG('<svg><path d="M105,95c0,5.523-4.477,10-10,10H15c-5.523,0-10-4.477-10-10V15C5,9.477,9.477,5,15,5h80c5.523,0,10,4.477,10,10V95z"/></svg>', rsquare);
			rsquare.attr({
				// x: 200,
				// y: 200,
				'fill':'#428bca'
			}).click(function(){
				ftText.hideHandles();
				ftCircle.hideHandles();
				ftRibbon.hideHandles();
				ftRSquare.showHandles();

				selectedEl = ftRSquare;
			});
			var ftRSquare = paper.freeTransform(rsquare);
	    	ftRSquare.setOpts({ 
		    	keepRatio: ['axisX', 'axisY', 'bboxCorners', 'bboxSides']
	    	}).hideHandles(); // Hide freeTransform handles

	    	/* ribbon */

		    var ribbon = paper.set(
		    	paper.path('M150,5C107.91,5,67.454,6.197,29.827,8.41L37.557,55c35.412-1.926,73.221-2.977,112.443-2.977S227.031,53.074,262.443,55 l7.73-46.553C232.547,6.197,192.09,5,150,5z').attr('stroke','none'), 
		    	paper.path('M4.863,16.283l19.484,14.15L8.202,50.789c7.438-0.508,16.981-1.852,24.673-2.287l-5.334-33.67 C19.885,15.268,12.303,15.775,4.863,16.283z').attr('stroke','none'), 
		    	paper.path('M295.137,16.283c-7.438-0.543-15.021-1.016-22.68-1.486l-5.334,33.67c7.656,0.438,17.199,1.779,24.676,2.287 l-16.111-20.355L295.137,16.283z').attr('stroke','none')
	    	);
		 //    var ribbon = paper.set();
			// paper.importSVG('<svg><path d="M405,380.401c-42.09,0-82.546,1.197-120.173,3.41l7.729,46.59c35.413-1.926,73.221-2.977,112.444-2.977 c39.222,0,77.031,1.051,112.444,2.977l7.729-46.554C487.546,381.597,447.09,380.401,405,380.401z"/><path d="M259.864,391.684l19.484,14.15l-16.146,20.355c7.438-0.508,16.981-1.851,24.673-2.286l-5.334-33.671 C274.885,390.668,267.303,391.176,259.864,391.684z"/><path d="M550.136,391.684c-7.437-0.544-15.021-1.016-22.678-1.487l-5.334,33.671c7.656,0.436,17.199,1.778,24.675,2.286 l-16.111-20.355L550.136,391.684z"/></svg>', ribbon);
			ribbon.attr({
				// x: 200,
				// y: 200,
				'fill':'#dff0d8'
			}).click(function(){
				ftText.hideHandles();
				ftCircle.hideHandles();
				ftRSquare.hideHandles();
				ftRibbon.showHandles();

				selectedEl = ftRibbon;
			});

	    	var rgroup = paper.group();
			rgroup.push(ribbon);

			var ftRibbon  = paper.freeTransform(ribbon);
	    	ftRibbon.setOpts({ 
		    	keepRatio: ['axisX', 'axisY', 'bboxCorners', 'bboxSides']
	    	}).hideHandles(); // Hide freeTransform handles

	    	/* circle */

		    var circle = paper.set();
			paper.importSVG('<svg><path d="M55,9.038c-25.088,0-45.5,20.412-45.5,45.5c0,25.087,20.412,45.5,45.5,45.5s45.5-20.412,45.5-45.5 C100.5,29.438,80.088,9.038,55,9.038z"/><path d="M55,5C27.389,5,5,27.387,5,55c0,27.611,22.389,50,50,50s50-22.389,50-50C105,27.387,82.611,5,55,5z M55,101.85 c-26.088,0-47.313-21.225-47.313-47.313C7.688,28.45,28.912,7.225,55,7.225s47.313,21.226,47.313,47.313 C102.313,80.625,81.088,101.85,55,101.85z"/></svg>', circle);
			circle.attr({
				// x: 500,
				// y: 200,
				'fill':'#d9edf7'
			}).click(function(){
				ftText.hideHandles();
				ftRibbon.hideHandles();
				ftRSquare.hideHandles();
				ftCircle.showHandles();

				selectedEl = ftCircle;
			});

		    var cgroup = paper.group();
			cgroup.push(circle);

			var ftCircle  = paper.freeTransform(circle);
	    	ftCircle.setOpts({ 
		    	keepRatio: ['axisX', 'axisY', 'bboxCorners', 'bboxSides']
	    	},function(ftCircle, events) {
		        console.log('circle', ftCircle.attrs);
		    }).hideHandles(); // Hide freeTransform handles

		    // var rect = paper
		    //     .rect(200, 200, 100, 100)
		    //     .attr('fill', '#f00')
		    //     ;

	    	/* text */

			var text = paper
						.text(200, 200, "Lorem ipsum dolor sit amet, consectetur adipisicing elit. \nadadada dadada")
						.attr({ "font-size": 22, "font-family": "Arial, Helvetica, sans-serif", 'fill':'green' })
						.click(function(){
							ftCircle.hideHandles();
							ftRibbon.hideHandles();
							ftRSquare.hideHandles();
							ftText.showHandles();

							selectedEl = ftText;
						});
			var ftText    = paper.freeTransform(text);
	    	ftText.setOpts({ 
		    	keepRatio: false
	    	}).hideHandles(); // Hide freeTransform handles

	    	var circle2 = paper.circle(500, 500, 150);
	    	$(circle2.node).qtip({
	    		content: $('#setting-circle').html(),
	    		style: {
	    			classes: 'doubleborder',
			        tip: {
			            width: 6,
			            height: 4
			        }
	            },
	    		position: {
			        my: 'top right',  // Position my top left...
				    // at: 'top center', // at the bottom right of...
				    // adjust: {
				    //     screen: true
				    // },
				    // viewport: $(circle2.node)
			    },
	    		hide: false,
			  	show: {
				    event: 'dblclick'
				}
	    	});

	    	var ftCircle2  = paper.freeTransform(circle2);
	    	ftCircle2.setOpts({ 
		    	keepRatio: ['axisX', 'axisY', 'bboxCorners', 'bboxSides']
	    	},function(ftCircle2, events) {
		        console.log('circle', ftCircle2.attrs);
		    }).hideHandles(); // Hide freeTransform handles

		    circle2.attr({
		    	'fill' : '#ff0000',
		      // "fill": "90-#f00:5-#00f:95",
		      // "fill": "45-rgba(255,0,0,0.25)-rgba(0,255,0,0.25)-rgba(0,0,255,0.25)",
		      "fill-opacity": 1.0
		    }).click(function(){
		    	ftCircle2.showHandles();

				selectedEl = circle2;
			});

		    var fts = [ftText, ftCircle, ftCircle2, ftRibbon, ftRSquare];

		    // Add freeTransform
		    // var ft  = paper.freeTransform(rect);

		    // Hide freeTransform handles
		    // ft.hideHandles();

		    // Show hidden freeTransform handles
		    // ft.showHandles();

		    // Apply transformations programmatically
		    // ft.attrs.rotate = 45;

		    // ft.apply();

		    // Remove freeTransform completely
		    // ft.unplug();

		    // Add freeTransform with options and callback
		    // ft = paper.freeTransform(rect, { keepRatio: true }, function(ft, events) {
		    //     console.log(ft.attrs);
		    // });

		    // // Change options on the fly
		    // ft.setOpts({ 
		    // 	keepRatio: true,
		    // 	// animate: true,
		    // 	draw: 'circle'
	    	// });

			$('a.close-tip').live('click',function(e){
				$('.qtip').hide();
				return false;
			});

			$('.qtip input').live('change', function(e){
				console.log('e', e);

				var actionType = $('.qtip input[name="action"]:checked').val();
				var keepRatio = $('.qtip input[name="keepRatio"]:checked').val();

				console.log('values', {
					'action' : actionType,
					'keepRatio' : keepRatio
				});

				var bounds = ['axisX', 'axisX', 'bboxCorners', 'bboxSides'];

				var options = {
					scale : bounds,
					keepRatio: (keepRatio == 'yes') ? bounds : false
				};

				if(eventType == 'rotate') {
					isRotate = true;
					options.scale  = false;
					options.rotate = ['axisX', 'axisX', 'self'];
				} else {
					options.scale  = bounds;
					options.rotate = false;
				}

				console.log('selected element', selectedEl);
				if( selectedEl ){
					paper.freeTransform(selectedEl).setOpts(options);
					if(e.target.id == 'fill'){
						selectedEl.attr('fill', e.target.value);
					} 
					if(e.target.id == 'fill-opacity') {
						selectedEl.attr('fill-opacity', e.target.value);
					} 
					if(e.target.id == 'stroke') {
						selectedEl.attr('stroke', e.target.value);
					}
				}
			});

	    	$("body").keydown(function (e) {
	    		console.log('key:',e);
	    		function cbFreeTransform(s, e) {
				    if (e.toString() == 'scale end') {    
				       ft.attrs.scale.y = s.attrs.scale.x;
				       ft.apply();
				    }
				}

				if(e.keyCode == 27){
			    	for ( var i in fts ) fts[i].hideHandles();
			    	selectedEl = null;
			     	$('.qtip').hide();
			    } else if (e.keyCode == 13) {
			        console.log('enter');
			        ftCircle.unplug();
			        ftRibbon.unplug();
			        elements = [circle,ribbon];
			        for ( var i in elements ) {
			        	var thisShape = elements[i];
						var ft = paper.freeTransform(thisShape,{ 
							keepRatio: ['axisX', 'axisY', 'bboxCorners', 'bboxSides'],
							draw:['bbox']
						}, cbFreeTransform);
						// ft.hideHandles();
						thisShape.click(function(){
						    paper.forEach(function(el) {
						  	if(el.freeTransform.handles.bbox != null)
						    	el.freeTransform.hideHandles();
							});
							this.freeTransform.showHandles();
					  	});
			        } 
			    }
			     
			});
		}
	]);
});