
mouse_events = _.extend({}, Backbone.Events);

var svg_preview = d3.select("#svg_preview");
var svg_frame0 = d3.select("#svg_frame0");
var svg_frame1 = d3.select("#svg_frame1");
var svg_canvas = d3.select("#svg_canvas");


make_background(svg_preview);
make_background(svg_frame0);
make_background(svg_frame1);
make_background(svg_canvas);

function make_overlay(svg) {
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
            mouse_events.trigger("mouse:move", p);
        })
        .on("mousedown", function(d,i) {
            painting = true;
            mouse_events.trigger("mouse:down");
            //make a new stroke
            //strokes.push([]);
            //stroke_idx++;
        })
        .on("mouseup", function(d,i) {
            //console.log("huh?")
            painting = false;
            mouse_events.trigger("mouse:up");
        })
        ;
}



make_overlay(svg_canvas);


