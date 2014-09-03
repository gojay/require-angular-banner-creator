
Raphael.fn.html = function(html, x, y, width, height, className) {

	function createSVG(svg, container, type, x, y, w, h, r) {

	    // svg is the main Raphael paper instance 
	    // container is the containing element, usuall also the paper instance 
	    // but alternatively the 'g' 

	    // thank you for leaking :) 
	    var Element = svg.constructor.el.constructor;

	    var el = document.createElementNS("http://www.w3.org/2000/svg", type);
	    el.style.webkitTapHighlightColor = "rgba(0,0,0,0)";

	    container.canvas && container.canvas.appendChild(el);

	    var res = new Element(el, svg);
	    res.attrs = {
	        x: x,
	        y: y,
	        width: w,
	        height: h,
	        r: r || 0,
	        rx: r || 0,
	        ry: r || 0,
	        fill: "none",
	        stroke: "#000"
	    };
	    res.type = type;
	    if (type == "g")
	        res.canvas = res.node;
	    var has = "hasOwnProperty";
	    for (var key in res.attrs) {
	        if (res.attrs[has](key)) {
	            if (res.attrs[key] !== undefined)
	                el.setAttribute(key, res.attrs[key] + "");
	        }
	    }

	    var set = svg.set(res);
	    res.getBBox = function(){
	    	return set.getBBox();
	    };

	    return res;
	}
	
    var f = createSVG(
    	this, 
    	this, 
    	"foreignObject",
        x, y, 
        width, height
    );
    var b = document.createElement("body");
    b.innerHTML = html;
    if( className ) b.className = className;
    f.node.appendChild(b);

    // fix the height to match the newly created html 
    f.node.setAttribute("height", Math.max(b.clientHeight, height));
    f.node.setAttribute("width", Math.max(b.clientWidth, width));
    return f;
}