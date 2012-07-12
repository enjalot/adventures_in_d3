var Handle = function() {
    var data = new Backbone.Model({
        //the x,y coordinates which are the actual location
        x: 0,
        y: -17,
        //the x,y coordinates which represent the target or moving location
        mx: 0,
        my: 0,
        color: "#ff0000",
        sl: 0,
        sr: 0,
        height: 20 
    });
    //map 0,1 to screen space
    var x_scale = d3.scale.linear();
    //map screen space to color range
    var color_scale = d3.scale.linear();
    var x_max = 1;
    var x_min = 0;

    //the handle's containing group
    var group;
    //reference to the svg gradient element
    var gradient;


    var handle = function(g) {
        //represent the handle
        //a handle is made up of a top part, with a color rect and a little arrow
        gradient = g;
        group = gradient.append("g")
            .classed("handle", true)
            .attr("transform", "translate(" + [data.get("x"), data.get("height")/2] + ")");
        /*
        group.append("polygon")
            .attr("points", "0,-1 6,-1 6,5 3,8 0,5 ")
            .attr("fill", "#e3e3e3")
            //TODO: make this positioning properly calculated (center the control on the gradient point)
            .attr("transform", "translate(" + [-5,0] +")scale(" + 2.0 + ")");
        */
        group.append("rect")
            .attr("width", 20)
            .attr("height", 20)
            .attr("transform", "translate(" + [-10, -10] + ")")
            .style("fill", data.get("color"))
            .style("stroke", "#ffffff")
            .style("stroke-width", 3);

        group.append("circle")
            .classed("sl", true)
            .attr("r", 5)
            .style("stroke", "#ffffff")
            .style("stroke-width", 1);
        group.append("circle")
            .classed("sr", true)
            .attr("r", 5)
            .style("stroke", "#ffffff")
            .style("stroke-width", 1);

        //calculate the changes and update the data
        data.on("change:mx", handle.update_x);
        data.on("change:my", handle.update_y);
        //update the representation
        data.on("move", handle.move);
        data.on("move", handle.move_picker);
        //update the stop handles
        data.on("change:sl", handle.update_sl);
        data.on("change:sr", handle.update_sr);
        handle.update_sl();
        handle.update_sr();

        data.on("change:color", handle.update_color);
        handle.update_color();

        //set the drag behavior
        group.call(handle.drag);
 
        //deal with the color picker
        group.on("mousedown", handle.update_picker);
        handle.update_picker();

        data.on("remove", function() {
            group.remove();
        });
    };

    handle.move = function() {
        //update the representation of the handle when moving
        group.attr("transform", "translate(" + [data.get("x"), data.get("y")] + ")");
        return handle;
    };
    handle.update_sl = function() {
        group.select("circle.sl")
          .attr("transform", "translate(" + [data.get("sl"), 0] + ")");
    };
    handle.update_sr = function() {
        group.select("circle.sr")
          .attr("transform", "translate(" + [data.get("sr"), 0] + ")");
    };
    handle.update_color = function() {
        group.select("rect").style("fill", data.get("color"));
        group.selectAll("circle").style("fill", data.get("color"));
    };

    handle.update_x = function() {
        //this behavior constrains the x movement from the mouse/touch 
        var x = data.get("mx");

        //limit movement to inside the gradient
        //this will also limit handle to stay between two other handles
        //(when a new handle is added, it becomes the max of the handle to it's left
        //and the min of the handle to it's right
        if(x > x_max) { x = x_max; }
        if(x < x_min) { x = x_min; }
        data.set({x: x});

    };

    //capture dragging behavior on the handle
    handle.drag = d3.behavior.drag()
        .on("drag", function(d,i) {
            var dx = d3.event.dx;
            var dy = d3.event.dy;
            var mx = data.get("mx");
            var my = data.get("my");
            mx += dx;
            my += dy;

            var sl = -my; //down makes it go left
            var sr = my; //up makes it go right
            var x = data.get("x");
            if(sl > 0) { sl = 0; }
            if(x + sl < x_min) { sl = x_min - x; }
            if(sr < 0) { sr = 0; }
            if(x + sr > x_max) { sr = x_max - x; }

            data.set({
                mx:mx,
                my:my,
                dx:dx,
                dy:dy,
                sl:sl,
                sr:sr
            });
            data.trigger("move");
        })
        .on("dragend", function(d,i) {
            //d.first = false;
        });
       

    handle.update_picker = function() {
        picker.toggle(true);
        //grab just the hex #s and not the hashtag
        var c = data.get("color").slice(1, 7);
        handle.move_picker();
        delete picker.callback;
        picker.callback = function(rgba, state, type) {
            //console.log("rgba", rgba);
            var newcolor = Color.Space(rgba, "RGB>STRING");
            data.set({color: "#" + newcolor});
        };
        picker.update(c); 
    };

    handle.move_picker = function() {
        //NOTE: this is least elegant part, due to global nature of colorpicker
        //figure out the absolute position of the handle
        //first get svg element's offset
        var svg = group.node().nearestViewportElement;
        var x = svg.offsetLeft;
        var y = svg.offsetTop; 
        //get position of handle relative to svg
        var rent = group.node().parentElement;
        var p = svg.createSVGPoint();
        var matrix = rent.getTransformToElement(svg);
        p.x = 0;
        p.y = 0;
        var sp = p.matrixTransform(matrix);
        //Update the location of the color picker
        //don't like that i'm using globals here
        var hx = sp.x + x + data.get("x") - colorpicker_size/2 - 20;
        var hy = sp.y + y + data.get("y") - 2*colorpicker_size;
        $('#colorpicker_gradient').css("top", hy);
        $('#colorpicker_gradient').css("left", hx);
    };

    handle.data = function(value) {
        if (!arguments.length) { return data; }
        data.set(value);
        return handle;
    };
    handle.x_min = function(value) {
        if (!arguments.length) { return x_min; }
        x_min = value;
        return handle;
    };
    handle.x_max = function(value) {
        if (!arguments.length) { return x_max; }
        x_max = value;
        return handle;
    };
    handle.color_scale = function(value) {
        if (!arguments.length) { return color_scale; }
        color_scale = value;
        return handle;
    };

    return handle;
};


var Gradient = function() {
    //layout properties
    var x = 0;
    var y = 0;
    var width = 800;
    var height = 100;
    var color_scale;
    var nbars = 800;
    var bar_width;

    var x_scale = d3.scale.linear().range([0, width]);

    //the gradient's containing group
    var group;
    //defs element to keep reference to the svg gradient
    var defs;
    //reference to the svg gradient element
    var svggrad;
    //id of the gradient
    var gradid = "gradient0";

    //list of handles
    var handles = [];


    var gradient = function(g) {

        //create initial frame
        group = g.append("g")
            .attr("transform", "translate(" + [x, y] + ")");
        
        var bars = d3.range(nbars);
        bar_width = width/nbars;
        var grad = group.selectAll("rect.gbar")
          .data(bars)
          .enter()
          .append("rect")
          .classed("gbar", true)
          .attr("stroke", "none")
          .attr("width", bar_width)
          .attr("height", height)
          .attr("transform", function(d,i) {
            //return "translate(" + [i*bar_width, height/2 - bar_width] + ")";
            return "translate(" + [i*bar_width, 0] + ")";
          })


        var rect = group.append("rect")
            .classed("gradient", true)
            .attr("width", width)
            .attr("height", height)
            .attr("stroke", "#000000")
            //.attr("fill", "url(#" + gradid + ")");
            .attr("fill", "#ffffff")
            .attr("fill-opacity", 0)
            .attr("pointer-events", "all");

        rect.on("click", gradient.add_handle);

        //add 2 defualt handles at each end
        gradient.add_handle({
          x: 0,
          mx: 0,
          color: "#ff0000"
        });
        gradient.add_handle({
          x: width,
          mx: width,
          color: "#0000ff"
        });

    };

    gradient.add_handle = function(options) {
        var hd = new Handle();

        var x;
        if(!options) {
            //set the initial position to where the mouse was clicked
            x = d3.mouse(this)[0];
        } else if(options.x !== undefined) {
            x = options.x;
        } else {
            //TODO: shouldn't need to repeat this line...
            x = d3.mouse(this)[0];
        }
    
        if(!options) {
            options = {
              //id: handles.length,
              x: x,
              mx: x//TODO: shouldn't have to set this from outside...
            };
        }
        options.height = height;
        options.y = height/2;
        hd.data(options);

        //set the handle's bounds
        //find the closest handle to the left of the click
        //we take advantage of the fact that handles will always be in order
        //(due to their behavior)
        var i, ind = -1, hi, hix, insert;
        for(i = handles.length; i >=0; i--) {
            hi = handles[i];
            if(hi) {
                hix = hi.data().get("x");
                if(hix < x) {
                  ind = i;
                  //update the left handles max to be the current x
                  hi.x_max(x);
                  break;
                }
            }
        }
        if(ind >= 0) {
            //update the min we found
            hd.x_min(hix);
            //save the index we want to insert at 
            insert = ind+1;
        } else {
            //if none set min to 0;
            hd.x_min(0);
            insert = 0;
        }

        //find the closest handle to the right of the click
        ind = -1;
        for(i = 0; i < handles.length; i++) {
            hi = handles[i];
            if(hi) {
                hix = hi.data().get("x");
                if(hix > x) {
                  ind = i;
                  //update the right handles min to be current x
                  hi.x_min(x);
                  break;
                }
            }
        }
        if(ind >= 0) {
            hd.x_max(hix);
        } else {
            //if none set min to width;
            hd.x_max(width);
        }
         //add hd to list of handles
        handles.splice(insert, 0, hd);

        //listen on changes to x, update min and max of other handles
        var hd_data = hd.data();
        hd_data.on("change:x", function() {
            var ind = handles.indexOf(hd);
            if(ind > 0) {
                //update x_max of left handle when moving
                handles[ind-1].x_max(hd_data.get("x"));
            }
            if(ind < handles.length-1) {
                //update x_max of left handle when moving
                handles[ind+1].x_min(hd_data.get("x"));
            }
        });

        //make the color an interpolation of the two colors this stop is between
        //var color = ["#0000ff", "#ff0000", "#00ff00"];
        //hd_data.set({color: color[parseInt(Math.random() * 3)]});
        ind = handles.indexOf(hd);
        var left, right, left_color, right_color, lx, rx, t;
        if(ind > 0 && ind < handles.length-1) {
          left = handles[ind-1].data();
          right = handles[ind+1].data();
          left_color = left.get("color");
          right_color = right.get("color");
          lx = left.get("x");
          rx = right.get("x");
          t = (x - lx) / (rx - lx);
          //console.log(t, left_color, right_color, lx, x, rx)
          //options.color = d3.interpolateRgb(left_color, right_color)(t);
          options.color = d3.interpolateHsl(left_color, right_color)(t);
        } else if(!options.color) {
          options.color = "#ff0000";
        }
        hd_data.set({color: options.color});
      
        update_colors();
        
        //listen on the handle's change in sl and sr to update stop position
        //listen for change in color to update the stops
        //listen on the handle's movement to update the stop positions
        hd_data.on("change:color change:sl change:sr move", function() {
            var ind = handles.indexOf(hd);
            //update_stop(ind);
            update_colors();
        });
 

        function update_colors() {
            var i,handle;
            var domain = [];
            var colors = [];

            for(i = 0; i < handles.length; i++) {
               handle = handles[i].data();
               domain.push((handle.get("x") + handle.get("sl"))/width);
               domain.push((handle.get("x") + handle.get("sr"))/width);
               colors.push(handle.get("color"));
               colors.push(handle.get("color"));
            }
            color_scale = d3.scale.linear()
              .domain(domain)
              .interpolate(d3.interpolateHsl)
              .range(colors);
            group.selectAll("rect.gbar")
                .style("fill", function(d,i) {
                    return color_scale(i/nbars);
                });
        }

        //remove a handle (by yanking off)
        hd_data.on("change:dy", function() {
            var dy = hd_data.get("dy");
            if(dy < -30) {
                var ind = handles.indexOf(hd);
                //remove the svg representations
                hd_data.trigger("remove");
                /*
                svggrad.select("#lstop" + (handles.length-1)).remove()
                svggrad.select("#rstop" + (handles.length-1)).remove()
                */
                
                //set the appropriate min and max
                var left, right;
                if(ind > 0 && ind < handles.length-1) {
                    left = handles[ind-1];
                    right = handles[ind+1];
                    left.x_max(right.data().get("x"));
                    right.x_min(left.data().get("x"));
                } else if(ind === 0) {
                    right = handles[1];
                    right.x_min(0);
                } else if(ind === handles.length-1) {
                    left = handles[ind-1];
                    left.x_max(width);
                }
 
                //remove the handle from the array
                handles.splice(ind, 1);

                hd_data.unbind();
                picker.toggle("false");
                //reupdate all stops
                /*
                for(i = 0; i < handles.length; i++) {
                  update_stop(i);
                }
                */
                update_colors();
            }
        });

        //draw the handle
        hd(group);

    };

    gradient.x = function(value) {
        if (!arguments.length) { return x; }
        x = value;
        return gradient;
    };
    gradient.y = function(value) {
        if (!arguments.length) { return y; }
        y = value;
        return gradient;
    };
    gradient.width = function(value) {
        if (!arguments.length) { return width; }
        width = value;
        //update the scale when the width changes
        x_scale.range([0, width]);
        bar_width = width/nbars;
        return gradient;
    };
    gradient.height = function(value) {
        if (!arguments.length) { return height; }
        height = value;
        return gradient;
    };
    gradient.nbars = function(value) {
        if (!arguments.length) { return nbars; }
        nbars = value;
        bar_width = width/nbars;
        return gradient;
    };




    return gradient; 
};

var svg = d3.select('svg');
var bg_rect = svg.append("rect").attr("width", "100%").attr("height", "100%")
    .attr("fill-opacity", 0.1)
    //.attr("fill", "#ffffff");
    .attr("fill", "#d3d3d3");


var colorpicker_size = 110;
//remove colorpicker from the dom (for tributary)
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

var grad = new Gradient();

grad.width(tributary.sw-10)
  .height(tributary.sh)
  .nbars(40);

grad(svg);
//set to true for debugging
tributary.trace = false;
