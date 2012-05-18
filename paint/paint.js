//TODO: wrap this shit up


var svg = d3.select("#svg")
    , wait = 1000
    , strokes = []
    , stroke_idx = -1;
    ;

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
    console.log("update");
    //this function gets called everytime a point is added

    //TODO: some preprocessing on the data so that each point knows something
    //about the previous ones (or at least can have some properties like
    //velocity based on other points)
    var sd = strokes[stroke_idx];
    //get the last point and the 2nd to last point
    var pn = sd[sd.length-1];
    var pnm1 = sd[sd.length-2];
    var dist = 0;
    var dx = (pn.x - pnm1.x);
    if(pnm1) { 
        dist = Math.sqrt(dx*dx + (pn.y - pnm1.y)*(pn.y - pnm1.y));
    }
    pn.dist = dist;



    //redraw stroke paths with new points. only need to update current stroke
    var g = svg.select("g.strokes")
        , current_stroke = g.selectAll("g.stroke"+stroke_idx)
        .data([sd])
        , points;

    current_stroke.enter()
        .append("g")
        .classed("stroke" + stroke_idx, true)
        ;

    points = current_stroke
        .selectAll("g.point")
        .data(function(d) { return d; });
    
    points.enter()
        .append("g")
        .classed("point", true)
        .append("rect")
            .attr("width", function(d,i) {
                return d.dist + 1;
            })
            .attr("height", 20)
            .attr("fill", "#000")
            .attr("x", function(d,i) { return d.x; })
            .attr("y", function(d,i) { return d.y; })
            ;
        
}

init_strokes();

function make_overlay() {
    //overlay an empty rectangle on everything to catch our mouse events
    svg.append("rect")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("pointer-events", "all")
        .attr("fill", "none")
        .on("mousemove", function(d,i) {
            if(!painting) { return false; }

            x = d3.svg.mouse(this)[0];
            y = d3.svg.mouse(this)[1];
            p = {"x": x, "y": y} ;
            //TODO: use backbone to collect the points, trigger events
            strokes[stroke_idx].push(p);
            update();
        })
        .on("mousedown", function(d,i) {
            painting = true;
            //make a new stroke
            strokes.push([]);
            stroke_idx++;
        })
        .on("mouseup", function(d,i) {
            console.log("huh?")
            painting = false;
        })
        ;
}

make_overlay();










time = new Date();
d3.timer(function() {
    if(pause) { return false; }
    now = new Date();
    dt = now - time;
    if(dt < wait) { return false; }

    console.log("looped");
    time = new Date();
});
