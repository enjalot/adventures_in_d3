//TODO: wrap this shit up


var svg = d3.select("#svg")
var wait = 1000;
var strokes = [];
var stroke_idx = -1;

make_background();

//TODO: use a backbone class or something instead of global state
var painting = false;

var pause = true;
jwerty.key('p', function () { 
    pause = !pause;
});


function init_strokes() {
    //create the svg infrastructure for our strokes
    svg.append("g")
        .classed("strokes", true);
}

function update() {
    //console.log("update");
    //this function gets called everytime a point is added

    var sd = strokes[stroke_idx];

    //redraw stroke paths with new points. only need to update current stroke
    var g = svg.select("g.strokes");
    var current_stroke = g.selectAll("g.stroke"+stroke_idx)
        .data([sd]);
    var points;

    current_stroke.enter()
        .append("g")
        .classed("stroke" + stroke_idx, true);

    points = current_stroke
        .selectAll("g.point")
        .data(function(d) { return d; });
    
    var sel = points.enter()
        .append("g")
        .classed("point", true);

    //make_rect(sel);
    make_oval(sel);
        
}

//TODO: organize into a series of views
var make_rect = function(selection) {
    selection.append("rect")
        .attr("width", function(d,i) {
            return 1.5 * d.dist + 1;
        })
        //.attr("height", 20)
        .attr("height", function(d,i) {
            var max_h = 40;
            //inverse of speed, slower = bigger, faster = smaller
            //TODO: come up with paramaterized way to set the stroke width
            var h = max_h * 40/(d.dist+1);
            if(h > max_h) { h = max_h; }
            if(h <= 1) { h = 1; }
            return h;
        })
        .style("fill", "#000")
        .style("fill-opacity", 0.5)
        .attr("x", function(d,i) { return d.x; })
        .attr("y", function(d,i) { return d.y; })
        .attr("transform", function(d,i) {
            return "rotate(" + [d.deg, d.x, d.y] + ")";
        });
};
var make_oval = function(selection) {
    //TODO: make the rendering part its own function (so we can switch whole stroke's view)
    selection.append("circle")
        .attr("r", function(d,i) {
            var max_h = 40;
            //TODO: use power curve or something else. be able to switch out curves
            var h = p.mod;//max_h * 40/(d.dist+1);
            if(h > max_h) { h = max_h; }
            if(h <= 1) { h = 1; }
            return h;
        })
        .style("fill", "#000")
        .style("fill-opacity", 0.1)
        .attr("cx", function(d,i) { return d.x; })
        .attr("cy", function(d,i) { return d.y; })
};

init_strokes();

var drawmove = function(d,i) {
    //console.log("drawmove");
    if(!painting) { return false; }
    d3.event.preventDefault();

    //var x = d3.svg.mouse(this)[0];
    var x = d3.mouse(this)[0];
    var y = d3.mouse(this)[1];
    var touches = d3.touches(this);

    //adding the point
    p = {"x": x, "y": y} ;

    function dist(a, b) {
        var dx = (a.x - b.x);
        var dy = (a.y - b.y);
        return Math.sqrt(dx*dx + dy*dy);
    }

    var sd = strokes[stroke_idx];
    //get the last point and the 2nd to last point
    //var pn = sd[sd.length-1];
    if (sd.length > 0) {
        var pnm1 = sd[sd.length-1];
        p.dist = dist(p, pnm1);
        var dx = (p.x - pnm1.x);
        p.deg = Math.acos(dx/p.dist) * 180/Math.PI;
    } else {
        p.dist = 0;
    }

    if(touches.length > 1) {
        //calculate a scalar between 0 and 1 depending on spread of the touch events
        max_dist = d3.max(touches, function(t) {
            return dist({"x":t[0], "y":t[1]}, p);
        });
        //console.log(String(max_dist));
        //TODO: make this a reasonable constant/scalar
        p.mod = max_dist / 10;

    } else {
        p.mod = 10;
    }

    //TODO: use backbone to collect the points, trigger events
    strokes[stroke_idx].push(p);
    update();
    

    var colors = d3.scale.category20c();
    //temporarily draw circles around the touches
    var fingers = svg.select("#ui_elements").selectAll("circle.finger")
        .data(touches);
    fingers.enter()
        .append("circle")
        .classed("finger", true);

    fingers
        .attr("r", 40)
        .attr("cx", function(d,i) {
            return d[0];
        })
        .attr("cy", function(d,i) {
            return d[1];
        })
        .attr("fill", "none")
        .attr("stroke", function(d,i) {
            return colors(i);
        })
        .attr("stroke-width", 4)

};

var drawstart = function(d,i) {
    //console.log("drawstart");
    painting = true;
    //make a new stroke
    strokes.push([]);
    stroke_idx++;
};

var drawend = function(d,i) {
    //console.log("drawend");
    painting = false;

    //remove temporary ui elements
    svg.select("#ui_elements").selectAll("*").remove()
};


function make_overlay() {

    svg.append("g")
        .attr("id", "ui_elements");

    //overlay an empty rectangle on everything to catch our mouse events
    svg.append("rect")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("pointer-events", "all")
        .attr("fill", "none")
        .on("mousemove", drawmove)
        .on("touchmove", drawmove)
        .on("mousedown", drawstart)
        .on("touchstart", drawstart)
        .on("mouseup", drawend)
        .on("touchend", drawend)
        ;

}

make_overlay();



//TODO: make ui for choosing brushes
//ui button for selection

//be able to select strokes
//change stroke brush after the fact
//select points? change only selected?

//transform all points in a given stroke to a preset. like mapping all points to a bar chart over time
//data viz of the drawing...






time = new Date();
d3.timer(function() {
    if(pause) { return false; }
    now = new Date();
    dt = now - time;
    if(dt < wait) { return false; }

    //console.log("looped");
    time = new Date();
});
