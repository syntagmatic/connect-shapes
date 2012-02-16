window.onload = function () {
//define toolbar canvas
var r_shapes = Raphael("shapes", 320, 40);
var r_colors = Raphael("colors", 320, 40);
var r_comm = Raphael("commands", 320, 40);

var toolbar_shapes = [];
var s_shapes = [r_shapes.circle(31, 20, 16),
		r_shapes.rect(63, 6, 28, 28),
		r_shapes.ellipse(131, 20, 26, 16),
		r_shapes.rect(173, 6, 52, 28),
];
var s_colors = [];
var s_comm = [];

var colors = ['#bf0000', '#bf5600', '#bfac00', '#00bf2f', '#0000ff', '#b500bf'];

//for (var i=0, ii = 18; i<ii; i++) {
	for (var s=0, ss=s_shapes.length; s<ss; s++) {
		s_shapes[s].attr({fill:"#acacac", stroke:"#acacac", "fill-opacity":0.1, "stroke-width":1});
	}
	var cx = 15, cd = 28;
	for (var c=0; c<10; c++) {
		s_colors[c] = r_colors.rect(cx, 6, 28, 28).attr({fill:colors[c], stroke:colors[c], "fill-opacity":0.2, "stroke-width":1});
		cx = (cx+15)+cd;
	} 
//}



}
