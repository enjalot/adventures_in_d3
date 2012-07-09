
var svg = d3.select('svg');
var bg_rect = svg.append("rect").attr("width", "100%").attr("height", "100%")
    .attr("fill-opacity", 0.01)
    .attr("fill", "#ffffff");
var defs = svg.append("defs");

var grad_x = 200;
var grad_y = 200;
var grad_width = 800;
var grad_height = 100;

var colorpicker_size = 110;

//need to remove existing color picker from dom
$("#colorpicker_gradient").remove();
var picker = new Color.Picker({
    id:"colorpicker_gradient",
    color: "#643263",// accepts rgba(), or #hex
    display: false,
    size: colorpicker_size,
    callback: function(rgba, state, type) {
    }
});
$("#colorpicker_gradient").css("position", "absolute");
    bg_rect.on("click", function() {
    picker.toggle(false);
});

function make_gradient(gradid)
{
    var gradient = defs.append("svg:linearGradient")
        .attr("id", gradid)
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "0%");
    /*
    gradient.append("svg:stop")
        .attr("offset", "0%")
        .attr("stop-color", "#0000ff")
        .attr("stop-opacity", 0.9);
    gradient.append("svg:stop")
        .attr("offset", "50%")
        .attr("stop-color", "#ff0000")
        .attr("stop-opacity", 0.9);
    */
    return gradient;
}

var def_grad = make_gradient("mygrad"); 

var gradient = svg.append("g")
    .attr("transform", "translate(" + [grad_x, grad_y] + ")");
gradient.append("rect")
    .classed("gradient", true)
    .attr("width", grad_width)
    .attr("height", grad_height)
    .style("fill", "url(#mygrad)");
 
function sort_stops() { 
    def_grad.selectAll("stop")
        .sort(function(a,b) {
            return a.x.get() > b.x.get();
        });
}
    
//map 0,1 to screen space
var xscale = d3.scale.linear()
    .range([0, grad_width]);

//map screen space to color range
var color_scale = d3.scale.linear()
    .domain([0, grad_width]);



var xmax = 1;
var xmin = 0;

var move_picker = function(d) {
    //picker.toggle(true);
    //TODO: better way to handle coordinate systems
    //(ColorPicker should not be absolute)
    var hx = grad_x + d.x.get() - colorpicker_size/2 - 20;
    var hy = grad_y + d.y.get() - colorpicker_size;
    $('#colorpicker_gradient').css("top", hy);
    $('#colorpicker_gradient').css("left", hx);
};

//The dragging behavior for the main handle
var xdrag = d3.behavior.drag()
    .on("drag", function(d,i) {
        var dx = d3.event.dx;
        var dy = d3.event.dy;
        var x = d.x.get();
        x += dx;
        //d3.select(this).attr("transform", "translate(" + [x, d.y.get()] + ")");
        d.x.set(x);
        d.x.notify();

        var mouse_x = d3.svg.mouse(this)[0];
        var mouse_y = d3.svg.mouse(this)[1];
        var my = d.my.get();
        //d.my.set(my + dy);
        d.mx.set(mouse_x);
        d.my.set(mouse_y);
        d.dy.set(dy);
        d.my.notify();
        move_picker(d);
    })
    .on("dragend", function(d,i) {
        d.first = false;
    });


function init_handle(data) {
    var handle = gradient.append("g")
        .data([data])
        .classed("handle", true)
        .attr("id", function(d,i) {
            return "grad_handle" + d.id;
        })
        .attr("transform", function(d,i) {
            return "translate(" + [d.x.get(), d.y.get()] + ")";
        });
    handle.append("svg:polygon")
        .attr("points", "0,-1 6,-1 6,5 3,8 0,5 ")
        .attr("fill", "#e3e3e3")
        //TODO: make this positioning properly calculated (center the control on the gradient point)
        .attr("transform", "translate(" + [-5,0] +")scale(" + 2.0 + ")");
    handle.append("rect")
        .attr("width", 20)
        .attr("height", 20)
        .attr("transform", "translate(" + [-9, -23] + ")")
        .style("fill", function(d,i) {
            return d.color.get();
        });

    //setup the drag behavior
    handle.call(xdrag);

    //deal with the colorpicker
    handle.on("mousedown", function(d,i) {
        picker.toggle(true);
        //grab just the hex #s and not the hashtag
        var c = d.color.get().slice(1, 7);
        move_picker(d);
        delete picker.callback;
        picker.callback = function(rgba, state, type) {
            //console.log("rgba", rgba);
            var newcolor = Color.Space(rgba, "RGB>STRING");
            d.color.set("#" + newcolor);
            d.color.notify();
        };
        picker.update(c); 
    });

    function make_stop(datum,id) {
        //add the associated gradient stop
        def_grad.append("stop")
            .data([datum])
            .attr("id", function(d,i) {
                return id + d.id;
            })
            .attr("offset", function(d,i) {
                var x = d.x.get();
                return xscale.invert(x) * 100 + "%";
            })
            .attr("stop-color", function(d,i) {
                return d.color.get();
            });
    }

    make_stop(data, "left_grad_stop");
    make_stop(data, "right_grad_stop");

    //make little stop handles at the bottom

    return handle;
}


//Initialize the data and behaviors for the handles
function make_handle_data(id, x, y, color) {
    var hd = {
        "id": id,
        "x": dvl.def(xscale(x)),
        "y": dvl.def(y),
        "color": dvl.def(color),
        "mx": dvl.def(0),    //for keeping track of mouse x movement
        "my": dvl.def(0),    //for keeping track of mouse y movement
        "dy": dvl.def(0),    //for keeping track of mouse y velocity 
        "sl": dvl.def(0),   //offset for left stop
        "sr": dvl.def(0)   //offset for right stop
    };

    //behavior for what happens when the color is changed
    var update_color = function() {
        var color = hd.color.get();
        //select the handle
        gradient.select("#grad_handle" + hd.id)
            .select("rect")
            .style("fill", function(d,i) {
                return color;
            });
        def_grad.select("#left_grad_stop" + hd.id)
            .attr("stop-color", function(d,i) {
                return color;
            });
        def_grad.select("#right_grad_stop" + hd.id)
            .attr("stop-color", function(d,i) {
                return color;
            });

    };
    dvl.register({
        fn: update_color,
        listen: [hd.color]
    });



    //behavior for what happens when the handle is dragged in x direction
    var update_x = function() {
        var x = hd.x.get();
        var mx = hd.x.get();
        if(x > xscale(xmax)) { x = xscale(xmax); }
        if(x < xscale(xmin)) { x = xscale(xmin); }

        //console.log("HI!", hd.x.get(), hd.id);
        gradient.select("#grad_handle" + hd.id)
            .attr("transform", function(d,i) {
                //return "translate(" + [d.x.get(), d.y.get()] + ")";
                return "translate(" + [x, d.y.get()] + ")";
            });
            
        def_grad.select("#left_grad_stop" + hd.id)
            .attr("offset", function(d,i) {
                //var x = d.x.get();
                var ox = d.sl.get();
                return xscale.invert(x + ox) * 100 + "%";
            });
        def_grad.select("#right_grad_stop" + hd.id)
            .attr("offset", function(d,i) {
                //var x = d.x.get();
                var ox = d.sr.get();
                return xscale.invert(x + ox) * 100 + "%";
            });

        //console.log(mx, xscale(xmax) + 100)
        /*
        //let's not remove the handle when it goes to far left or right
        if(mx < -100 || mx > xscale(xmax) + 100) {
            gradient.select("#grad_handle" + hd.id).remove();
            def_grad.select("#left_grad_stop" + hd.id).remove();
            def_grad.select("#right_grad_stop" + hd.id).remove();
        }
        */
        sort_stops();
    };

    dvl.register({
        fn: update_x,
        listen: [hd.x, hd.sl, hd.sr]
    });

    /*
    var yscale = d3.scale.linear()
        .domain([-500, 500])
        .range([-xscale(xmax)/2, xscale(xmax)/2]);
    */

    //behavior for if the handle being dragged in the y direction
    function update_y() {
        //console.log(hd.my.get())
        var my = hd.my.get();
        var dy = hd.dy.get();
        //if(hd.first) {
            //we want to allow "splitting" of stops for first drag
            //my = yscale(my);
            var sl = -my; //down makes it go left
            var sr = my; //up makes it go right
            if(sl > 0) { sl = 0; }
            if(sr < 0) { sr = 0; }
            //console.log(my, sl, sr);
            hd.sl.set(sl);
            hd.sr.set(sr);
            update_x();
            //only need to notify one, the other will get updated too
            //hd.sl.notify();
        //} else {
            //if the user snaps the handle away it gets deleted
            //also if the user brings it above a threshold it delets it
            //console.log("my, dy", my, dy)
            if(my < -100 || dy < -30) {
                //TODO: only do this if the user releases the mouse with this condition
                gradient.select("#grad_handle" + hd.id).remove();
                def_grad.select("#left_grad_stop" + hd.id).remove();
                def_grad.select("#right_grad_stop" + hd.id).remove();
                picker.toggle(false);
            }
        //}
    }

    dvl.register({
        fn: update_y,
        listen: hd.my
    });

    return hd;
}


//The behavior for creating a new handle by clicking on the gradient rectangle
gradient.select("rect.gradient").on("mousedown", function(d,i) {
    //sort the handles and interpolate the color where mouse is clicked.
    _.sortBy(handles, function(hd,i) {
        return hd.x.get();
    });
    var color_list = _.map(handles, function(hd,i) {
        return hd.color.get();
    });
    var x_list = _.map(handles, function(hd,i) {
        return hd.x.get();
    });
    //console.log(color_list);
    //console.log(x_list);
    color_scale
        .domain(x_list)
        .range(color_list);

    var x = d3.mouse(this)[0];
    //TODO: interpolate or grab color from where clicked
    var handle = make_handle_data(handles.length, xscale.invert(x), -17, color_scale(x));
    handles.push(handle);
    init_handle(handle);
    handle.first = true;
    sort_stops();
});


var handles = [];
handles.push(make_handle_data(0, 0, -17, "#0000ff"));
handles.push(make_handle_data(2, 0.5, -17, "#00ff00"));
handles.push(make_handle_data(1, 1, -17, "#ff0000"));


init_handle(handles[0]);
init_handle(handles[1]);
init_handle(handles[2]);


//append_stops(handles);

/*
var sample_data = d3.range(10);
var samples = svg.append("g")
	.attr("transform", "translate(" + [100, 200] + ")");
samples.selectAll("rect.sample")
  .data(sample_data)
  .enter()
	.append("rect")
    .attr("width", 20)
    .attr("height", 30)
  .attr("x", function(d,i) { return i * 25})
*/


