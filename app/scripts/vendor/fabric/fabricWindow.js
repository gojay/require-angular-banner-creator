angular.module('common.fabric.window', [])

.factory('FabricWindow', ['$window', function($window) {

	fabric.PolaroidPhoto = fabric.util.createClass(fabric.Object, fabric.Observable, {
	    H_PADDING: 10,
	    V_PADDING: 50,
	    type: 'polaroid',
	    originX: 'center',
	    originY: 'center',
	    initialize: function(src, options) {
	        this.callSuper('initialize', options);
	        this.image = new Image();
	        this.image.src = src;
	        this.image.onload = (function() {
	            this.width = this.image.width;
	            this.height = this.image.height;
	            this.loaded = true;
	            this.hideframe = false;
	            this.setCoords();
	            this.fire('image:loaded');
	        }).bind(this);
	    },
	    _render: function(ctx) {
	    	// ctx.drawImage(this.image, -this.width / 2, -this.height / 2);
		    // ctx.globalCompositeOperation = 'destination-in';
		    // ctx.beginPath();
		    // var radius = this.width < this.height ? (this.width / 2) : (this.height / 2);
		    // ctx.arc(0, 0, radius, 0, 2*Math.PI, true);
		    // ctx.fill();
	        if (this.loaded) {
	            if (this.hideframe) {
	                ctx.fillStyle = "transparent";
	            } else {
	                ctx.fillStyle = "#13987E";
	            }
	            ctx.fillRect(-(this.width / 2) - this.H_PADDING, -(this.height / 2) - this.H_PADDING,
	                this.width + this.H_PADDING * 2,
	                this.height + this.H_PADDING * 2);
	            ctx.drawImage(this.image, -this.width / 2, -this.height / 2);
	        }
	    },
	    toggleFrame: function() {
	        this.hideframe = !this.hideframe;
	    }
	});

	return $window.fabric;

}]);
