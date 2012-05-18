//svg is already defined in background.js but this might need to be modular
var svg = d3.select("svg")


var pause = true;
jwerty.key('p', function () { 
    pause = !pause;
});

wait = 700;

radius = 100


var get_layout = function(element) {
    var node = element.node()
    var bbox = node.getBBox()
    var nve = node.nearestViewportElement;
    var matrix = node.getTransformToElement(nve)
    var mp = nve.createSVGPoint()
    mp.x = 0
    mp.y = 0
    var p = mp.matrixTransform(matrix)

    var layout = { 
        "width": bbox.width,
        "height": bbox.height,
        "x": p.x,
        "y": p.y
    }
    console.log("layout", layout)
    return layout
}

//stage is where we do the prism stuff
var stage = svg.append("g")
    .attr("class", "stage")


var transform_prism = function(id, angle) {
    var prisms = stage.selectAll("g.prism" + id)
        console.log("primss", prisms)

    var base_angle = 2 * Math.PI / prisms[0].length
    prisms.attr("transform", function(d,i) { 
        var r = 60
        var x= Math.cos(i * base_angle + angle) * r
        var y= Math.sin(i * base_angle + angle) * r
        //var offset = 20 * (i & 1) - 10
        //var x = layout.x + x_offset
        //var y = layout.y + y_offset

        console.log(x, y)
        return "translate(" + [ x, y ] + ")"
    })
}
//make prism of element
var prism = function(id) {
    //make 3 copies of rgb
    var element = d3.select("#"+id)
    var colors = ["#f00", "#0f0", "#00f"]

    var prisms = stage.selectAll("g.prism" + id)
        .data(colors, String)
        .enter().append("g")
        .attr("class", "prism"+id)

    prisms.append("use")
        .attr("xlink:href", "#"+id)
        .attr("fill", function(d) { return d })
        .attr("fill-opacity", .5)
        

    //var layout = get_layout(element)
    var angle = 0;
    transform_prism(id, angle)
}

prism("useman")


//use jwerty to switch the mouseover functionality
//var behavior = ransize
//jwerty...

jwerty.key('a', function () { 
    var angle = Math.PI / 2    
    transform_prism("useman", angle)
});



/*
drag = d3.behavior.drag()
    .on("drag", function(d,i) {
        console.log("drag!")
    })
*/

//overlay an empty rectangle on everything to catch our mouse events
svg.append("rect")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("pointer-events", "all")
    .attr("fill", "none")
    .on("mousemove", function(d,i) {
        x = d3.svg.mouse(this)[0]
        y = d3.svg.mouse(this)[1]
        p = {"x": x, "y": y} 
        d3.selectAll("circle")
            .each(function(d,i) {
                //behavior(d3.select(this), d, i, p, radius);
            })
    })
    //.call(drag)



/*
time = new Date()
d3.timer(function() {
    if(pause) return false;
    now = new Date();
    dt = now - time
    if(dt > wait)
    {
        //console.log("dt", dt)
        update_dots("dots0");
        update_dots("dots1");
        update_dots("dots2");
        time = new Date();
    }
})
*/
